// POST /api/commerce/orders/[id]/confirm-receipt
// Called by the buyer to confirm they received their order.
// Moves status to DELIVERED and releases seller funds immediately.
import { walletService } from '~~/layers/commerce/server/services/wallet.service'
import { notificationService } from '~~/layers/profile/server/services/notification.service'
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
    if (order.userId !== user.id)
      throw new UserError(
        'FORBIDDEN',
        'Only the buyer can confirm receipt',
        403,
      )
    if (order.status === 'DELIVERED')
      return { success: true, data: { message: 'Already delivered' } }
    // Allow SHIPPED or CONFIRMED (seller may have skipped SHIPPED step)
    if (!['SHIPPED', 'CONFIRMED'].includes(order.status))
      throw new UserError(
        'INVALID_STATE',
        `Cannot confirm receipt for an order with status: ${order.status}`,
        400,
      )

    await prisma.orders.update({
      where: { id },
      data: { status: 'DELIVERED' },
    })

    // Release funds non-blocking — wallet errors must not fail the receipt confirmation
    if (order.paymentStatus === 'PAID') {
      walletService
        .releaseFundsOnDelivery(id)
        .catch((e) => logger.error('[confirm-receipt wallet release]', e))
    }

    // Notify each unique seller (non-blocking)
    const seen = new Set<string>()
    for (const item of order.orderItem) {
      const sellerId = item.variant?.product?.seller?.profileId
      if (!sellerId || seen.has(sellerId)) continue
      seen.add(sellerId)
      notificationService
        .createNotification({
          userId: sellerId,
          type: 'ORDER',
          actorId: user.id,
          message: `Buyer confirmed receipt of order #${id}. Funds have been released to your wallet.`,
        })
        .catch((e) => logger.error('[notify seller receipt]', e))
    }

    return {
      success: true,
      data: { message: 'Receipt confirmed. Funds released to seller.' },
    }
  } catch (error: any) {
    logger.error('[confirm-receipt]', error)
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error',
    })
  }
})
