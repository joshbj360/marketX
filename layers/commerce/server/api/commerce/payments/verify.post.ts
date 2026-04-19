// POST /api/commerce/payments/verify
// Called by the client after Paystack redirect to confirm payment.
import { z } from 'zod'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { walletService } from '../../../services/wallet.service'
import { orderRepository } from '../../../repositories/order.repository'
import { squareService } from '~~/layers/square/server/services/square.service'

/** Notify every unique seller whose products are in this order */
async function notifySellers(orderId: number, buyerName: string) {
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
      message: `New order #${orderId} received from ${buyerName}`,
    })
  }
}

const schema = z.object({ reference: z.string().min(1) })

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const { reference } = schema.parse(await readBody(event))

    // 1. Find the order by payment reference
    const order = await orderRepository.getOrderByPaymentRef(reference)
    if (!order) throw new UserError('NOT_FOUND', 'Order not found for this reference', 404)
    if (order.userId !== user.id) throw new UserError('FORBIDDEN', 'Access denied', 403)

    // 2. Already confirmed — idempotent early return
    if (order.paymentStatus === 'PAID') {
      return { success: true, data: { status: 'already_paid', orderId: order.id } }
    }

    // 3. Verify with Paystack
    const result = await paystack.verifyTransaction(reference)

    if (result.data.status === 'success') {
      // Atomic update — only the first concurrent caller gets count > 0.
      // If the webhook already processed this reference, count === 0 and we
      // skip side effects to prevent double-crediting.
      const { count } = await prisma.orders.updateMany({
        where: { id: order.id, paymentStatus: { notIn: ['PAID', 'FAILED'] } },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })
      if (count > 0) {
        notifySellers(order.id, user.username || user.email || 'a customer')
          .catch((e) => logger.error('Verify: notify sellers failed', { orderId: order.id, error: e?.message ?? e }))
        walletService.creditSellersOnPayment(order.id)
          .catch((e) => logger.error('Verify: wallet credit failed', { orderId: order.id, error: e?.message ?? e }))
        squareService.creditAssociationsForOrder(order.id)
          .catch((e) => logger.error('Verify: association credit failed', { orderId: order.id, error: e?.message ?? e }))
      }
      return { success: true, data: { status: 'paid', orderId: order.id } }
    }

    // Payment failed or abandoned
    await orderRepository.updatePaymentStatus(order.id, 'FAILED')
    return { success: true, data: { status: result.data.status, orderId: order.id } }
  } catch (error: unknown) {
    if (error instanceof UserError)
      throw createError({ statusCode: error.status, statusMessage: error.message })
    const msg = error instanceof Error ? error.message : 'Payment verification failed'
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
