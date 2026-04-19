// POST /api/commerce/orders/[id]/confirm-cash
// Called by the seller after collecting cash payment on delivery.
// Sets paymentStatus → PAID, status → DELIVERED, credits seller wallet.

import { walletService } from '~~/layers/commerce/server/services/wallet.service'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = parseInt(getRouterParam(event, 'id') || '')
    if (isNaN(id)) throw new UserError('INVALID_ID', 'Invalid order ID', 400)

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    seller: { select: { profileId: true, store_name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) throw new UserError('NOT_FOUND', 'Order not found', 404)
    if (order.paymentMethod !== 'pay_on_delivery')
      throw new UserError('INVALID_METHOD', 'Only POD orders support cash confirmation', 400)

    // Must be a seller whose product is in this order
    const isSeller = order.orderItem.some(
      (item) => item.variant?.product?.seller?.profileId === user.id,
    )
    if (!isSeller) throw new UserError('FORBIDDEN', 'Only the seller can confirm cash receipt', 403)

    if (order.paymentStatus === 'PAID') {
      return { success: true, data: { message: 'Cash already confirmed' } }
    }

    if (!['SHIPPED', 'CONFIRMED'].includes(order.status)) {
      throw new UserError(
        'INVALID_STATE',
        `Cannot confirm cash for an order with status: ${order.status}`,
        400,
      )
    }

    // Mark fully paid + delivered
    await prisma.orders.update({
      where: { id },
      data: { paymentStatus: 'PAID', status: 'DELIVERED' },
    })

    // Credit seller wallet (product amount — shipping was already collected upfront)
    walletService
      .creditSellersOnPayment(id)
      .catch((e) => logger.error('[confirm-cash wallet]', e))

    // Notify buyer
    notificationQueue.enqueue({
      userId: order.userId,
      type: 'ORDER',
      actorId: user.id,
      orderId: id,
      message: `✅ Your Pay-on-Delivery order #${id} has been delivered and payment confirmed. Thank you!`,
    })

    return {
      success: true,
      data: { message: 'Cash confirmed. Order marked delivered and wallet credited.' },
    }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({ statusCode: error.status, statusMessage: error.message })
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal server error' })
  }
})
