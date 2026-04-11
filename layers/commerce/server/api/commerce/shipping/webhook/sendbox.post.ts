/**
 * POST /api/commerce/shipping/webhook/sendbox
 * Receives status update events from Sendbox.
 * Register this URL in your Sendbox dashboard → Webhooks.
 *
 * Sendbox signs requests with a HMAC-SHA256 signature in the
 * X-Sendbox-Signature header. Verify with SENDBOX_WEBHOOK_SECRET.
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '~~/server/utils/db'
import { sseConnections } from '~~/server/utils/connections'

function verify(rawBody: string, signature: string): boolean {
  const secret = useRuntimeConfig().sendboxWebhookSecret
  if (!secret) return true // skip verification if secret not set (dev mode)
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const rawBody = (await readRawBody(event)) ?? ''
  const signature = getHeader(event, 'x-sendbox-signature') ?? ''

  if (!verify(rawBody, signature)) {
    throw createError({ statusCode: 401, message: 'Invalid signature' })
  }

  const payload = JSON.parse(rawBody)

  // Sendbox event shape: { event, data: { tracking_number, status, ... } }
  const trackingNumber: string = payload?.data?.tracking_number
  const newStatus: string = payload?.data?.status?.toUpperCase()

  if (!trackingNumber) {
    return { received: true }
  }

  // Update order in DB
  const order = await prisma.orders.findFirst({
    where: { trackingNumber },
    select: { id: true, userId: true },
  })

  if (order) {
    const orderStatus = newStatus === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED'
    await prisma.orders.update({
      where: { id: order.id },
      data: { status: orderStatus as any },
    })

    // Push real-time notification to buyer via SSE
    sseConnections.send(order.userId, 'shipping_update', {
      orderId: order.id,
      trackingNumber,
      status: newStatus,
      description:
        payload?.data?.description ?? `Package ${newStatus.toLowerCase()}`,
    })
  }

  return { received: true }
})
