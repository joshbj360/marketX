// POST /api/commerce/payments/webhook
// Paystack sends this after a transaction completes (even if user closes the tab).
// Set this URL in the Paystack dashboard: https://yourdomain.com/api/commerce/payments/webhook
import crypto from 'crypto'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { walletService } from '../../../services/wallet.service'

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
      message: `New order #${orderId} payment confirmed`,
    })
  }
}

export default defineEventHandler(async (event) => {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfigured',
    })

  // 1. Validate Paystack signature
  const signature = getHeader(event, 'x-paystack-signature')
  const rawBody = await readRawBody(event)
  if (!rawBody || !signature)
    throw createError({ statusCode: 400, statusMessage: 'Bad request' })

  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  if (hash !== signature)
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })

  // 2. Parse event
  const payload = JSON.parse(rawBody)
  const { event: eventType, data } = payload

  if (eventType === 'charge.success') {
    const reference: string = data?.reference
    if (!reference) return { success: true }

    const order = await prisma.orders.findUnique({
      where: { paymentRef: reference },
    })
    if (order && order.paymentStatus !== 'PAID') {
      await prisma.orders.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })
      notifySellers(order.id).catch((e) => console.error('[webhook notify]', e))
      walletService
        .creditSellersOnPayment(order.id)
        .catch((e) => console.error('[webhook wallet]', e))
    }
  }

  // Always return 200 to Paystack
  return { success: true }
})
