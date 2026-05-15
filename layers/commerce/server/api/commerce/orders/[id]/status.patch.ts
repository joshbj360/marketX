// PATCH /api/commerce/orders/[id]/status — seller updates order status
import { z, ZodError } from 'zod'
import { walletService } from '~~/layers/commerce/server/services/wallet.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { emailQueue } from '~~/server/queues/email.queue'
import { buildOrderStatusEmail } from '~~/server/utils/email/emailService'

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

    // Notify + email buyer on all seller-driven status changes
    const buyerMessages: Partial<Record<string, string>> = {
      CONFIRMED: `Your order #${id} has been confirmed by the seller and is being prepared.`,
      SHIPPED: `Your order #${id} has been shipped${body.trackingNumber ? ` · Tracking: ${body.trackingNumber}` : ''}. Funds will be released in 7 days if not confirmed.`,
      DELIVERED: `Your order #${id} has been marked as delivered.`,
      CANCELLED: `Your order #${id} has been cancelled by the seller.`,
    }
    const buyerMsg = buyerMessages[body.status]
    if (buyerMsg) {
      notificationQueue.enqueue({
        userId: order.userId,
        type: 'ORDER',
        actorId: user.id,
        orderId: id,
        message: buyerMsg,
      })
      prisma.user.findUnique({ where: { id: order.userId }, select: { email: true } })
        .then((buyer) => {
          if (!buyer?.email) return
          const { subject, html, text } = buildOrderStatusEmail(id, body.status as any, {
            trackingNumber: body.trackingNumber,
            shipper: body.shipper,
          })
          emailQueue.enqueue({ to: buyer.email, subject, html, text, type: 'GENERAL' })
        })
        .catch((e) => logger.logError('[status email buyer]', e))
    }

    // Release held funds to seller available balance on delivery
    if (body.status === 'DELIVERED' && order.paymentStatus === 'PAID') {
      walletService
        .releaseFundsOnDelivery(id)
        .catch((e) => logger.logError('[wallet release]', e))
    }

    return { success: true, data: updated }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    if (error instanceof ZodError)
      throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    logger.logError('[PATCH /api/commerce/orders/:id/status]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
