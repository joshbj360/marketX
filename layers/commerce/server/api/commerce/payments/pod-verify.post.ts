// POST /api/commerce/payments/pod-verify
// Called by the client after Paystack redirects back from the shipping fee payment.
// Sets paymentStatus → SHIPPING_PAID, status → CONFIRMED, then notifies sellers.

import { z } from 'zod'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { orderRepository } from '../../../repositories/order.repository'

const schema = z.object({ reference: z.string().min(1) })

/** Notify each unique seller that shipping is secured and order is ready to ship */
async function notifySellersPODConfirmed(orderId: number, buyerName: string) {
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
      orderId,
      message: `✅ POD order #${orderId} from ${buyerName} — shipping fee confirmed. Please pack and ship. Collect payment on delivery.`,
    })
  }
}

/** Notify buyer that their POD order is confirmed */
async function notifyBuyerPODConfirmed(order: { id: number; userId: string }) {
  notificationQueue.enqueue({
    userId: order.userId,
    type: 'ORDER',
    actorId: order.userId,
    orderId: order.id,
    message: `🛍️ Your Pay-on-Delivery order #${order.id} is confirmed! The seller will ship soon. You'll pay the product amount when it arrives.`,
  })
}

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const { reference } = schema.parse(await readBody(event))

    // 1. Find the order
    const order = await orderRepository.getOrderByPaymentRef(reference)
    if (!order) throw new UserError('NOT_FOUND', 'Order not found for this reference', 404)
    if (order.userId !== user.id) throw new UserError('FORBIDDEN', 'Access denied', 403)
    if (order.paymentMethod !== 'pay_on_delivery')
      throw new UserError('INVALID_METHOD', 'Not a POD order', 400)

    // 2. Idempotent
    if (order.paymentStatus === 'SHIPPING_PAID') {
      return { success: true, data: { status: 'already_confirmed', orderId: order.id } }
    }

    // 3. Verify shipping payment with Paystack
    const result = await paystack.verifyTransaction(reference)

    if (result.data.status !== 'success') {
      await orderRepository.updatePaymentStatus(order.id, 'FAILED')
      return { success: true, data: { status: result.data.status, orderId: order.id } }
    }

    // 4. Atomic update — only the first concurrent caller (verify vs webhook) wins
    const { count } = await prisma.orders.updateMany({
      where: { id: order.id, paymentStatus: { notIn: ['SHIPPING_PAID', 'PAID', 'FAILED'] } },
      data: { paymentStatus: 'SHIPPING_PAID', status: 'CONFIRMED' },
    })

    // 5. Notify sellers + buyer only if we made the state change
    if (count > 0) {
      const buyerName = user.username || user.email || 'a customer'
      notifySellersPODConfirmed(order.id, buyerName).catch((e) =>
        logger.error('POD verify: notify sellers failed', { orderId: order.id, error: e?.message ?? e }),
      )
      notifyBuyerPODConfirmed(order).catch((e) =>
        logger.error('POD verify: notify buyer failed', { orderId: order.id, error: e?.message ?? e }),
      )
    }

    return { success: true, data: { status: 'shipping_paid', orderId: order.id } }
  } catch (error: unknown) {
    if (error instanceof UserError)
      throw createError({ statusCode: error.status, statusMessage: error.message })
    const msg = error instanceof Error ? error.message : 'POD verification failed'
    throw createError({ statusCode: 500, statusMessage: msg })
  }
})
