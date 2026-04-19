// POST /api/commerce/payments/paypal/capture
// Called after buyer approves the PayPal payment.
// Captures funds and marks the internal order as PAID.
import { z } from 'zod'
import { walletService } from '~~/layers/commerce/server/services/wallet.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { notificationQueue } from '~~/server/queues/notification.queue'

const schema = z.object({
  orderId: z.number().int().positive(), // internal order ID
  paypalOrderId: z.string().min(1), // token from PayPal return URL
})

async function notifySellers(orderId: number) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      variant: {
        include: {
          product: {
            include: { seller: { select: { profileId: true } } },
          },
        },
      },
    },
  })
  const seen = new Set<string>()
  for (const item of items) {
    const sellerId = item.variant?.product?.seller?.profileId
    if (!sellerId || seen.has(sellerId)) continue
    seen.add(sellerId)
    notificationQueue.enqueue({
      userId: sellerId,
      type: 'ORDER',
      actorId: sellerId,
      message: `New order #${orderId} paid via PayPal`,
    })
  }
}

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const { orderId, paypalOrderId } = schema.parse(await readBody(event))

    // 1. Load order and verify ownership
    const order = await prisma.orders.findUnique({ where: { id: orderId } })
    if (!order) throw new UserError('NOT_FOUND', 'Order not found', 404)
    if (order.userId !== user.id)
      throw new UserError('FORBIDDEN', 'Access denied', 403)

    // 2. Idempotent — already paid
    if (order.paymentStatus === 'PAID') {
      return { success: true, data: { status: 'already_paid', orderId } }
    }

    // 3. Capture PayPal payment
    const result = await paypal.captureOrder(paypalOrderId)

    if (result.status === 'COMPLETED') {
      // Atomic update — guards against duplicate captures or a racing webhook
      const { count } = await prisma.orders.updateMany({
        where: { id: order.id, paymentStatus: { notIn: ['PAID', 'FAILED'] } },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })
      if (count > 0) {
        notifySellers(order.id).catch((e) => logger.error('PayPal: notify sellers failed', { orderId: order.id, error: e?.message ?? e }))
        walletService
          .creditSellersOnPayment(order.id)
          .catch((e) => logger.error('PayPal: wallet credit failed', { orderId: order.id, error: e?.message ?? e }))
      }
      return { success: true, data: { status: 'paid', orderId } }
    }

    // Capture failed or pending
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentStatus: 'FAILED' },
    })
    return {
      success: true,
      data: { status: result.status.toLowerCase(), orderId },
    }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'PayPal capture failed',
    })
  }
})
