// PATCH /api/commerce/orders/[id]/status — seller updates order status
import { z } from 'zod'
import { walletService } from '~~/layers/commerce/server/services/wallet.service'
import { notificationService } from '~~/layers/profile/server/services/notification.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

const schema = z.object({
  status: z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional(),
  shipper: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = parseInt(getRouterParam(event, 'id') || '')
    if (isNaN(id)) throw new UserError('INVALID_ID', 'Invalid order ID', 400)

    const body = schema.parse(await readBody(event))

    // Load order with items → seller info
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            variant: {
              include: {
                product: {
                  include: { seller: { select: { profileId: true } } },
                },
              },
            },
          },
        },
      },
    })

    if (!order) throw new UserError('NOT_FOUND', 'Order not found', 404)

    // Must be buyer OR a seller whose product is in the order
    const isBuyer = order.userId === user.id
    const isSeller = order.orderItem.some(
      (item) => item.variant.product.seller?.profileId === user.id,
    )

    if (!isBuyer && !isSeller)
      throw new UserError('FORBIDDEN', 'Access denied', 403)

    const updated = await prisma.orders.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.trackingNumber ? { trackingNumber: body.trackingNumber } : {}),
        ...(body.shipper ? { shipper: body.shipper } : {}),
        // Record when shipped so auto-release cron can use it
        ...(body.status === 'SHIPPED' ? { shippedAt: new Date() } : {}),
      },
    })

    // Notify buyer when order is shipped
    if (body.status === 'SHIPPED') {
      notificationService
        .createNotification({
          userId: order.userId,
          type: 'ORDER',
          actorId: user.id,
          message: `Your order #${id} has been shipped${body.trackingNumber ? ` · Tracking: ${body.trackingNumber}` : ''}. Funds will be released to the seller in 7 days if not confirmed.`,
        })
        .catch((e) => console.error('[notify buyer shipped]', e))
    }

    // Release held funds to seller available balance on delivery
    if (body.status === 'DELIVERED' && order.paymentStatus === 'PAID') {
      walletService
        .releaseFundsOnDelivery(id)
        .catch((e) => console.error('[wallet release]', e))
    }

    return { success: true, data: updated }
  } catch (error: unknown) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
