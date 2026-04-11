/**
 * POST /api/commerce/shipping/webhook/shippo
 * Receives tracking update events from Shippo.
 * Register this URL in your Shippo dashboard → Webhooks.
 *
 * Shippo signs requests with a X-Shippo-Signature header (HMAC-SHA256).
 * Verify with SHIPPO_WEBHOOK_SECRET.
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '~~/server/utils/db'
import { sseConnections } from '~~/server/utils/connections'

function verify(rawBody: string, signature: string): boolean {
  const secret = useRuntimeConfig().shippoWebhookSecret
  if (!secret) return true // skip in dev
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const rawBody = (await readRawBody(event)) ?? ''
  const signature = getHeader(event, 'x-shippo-signature') ?? ''

  if (!verify(rawBody, signature)) {
    throw createError({ statusCode: 401, message: 'Invalid signature' })
  }

  const payload = JSON.parse(rawBody)

  // Shippo webhook shape:
  // { event: "track_updated", data: { tracking_number, carrier, tracking_status: { status } } }
  const trackingNumber: string = payload?.data?.tracking_number
  const carrier: string = payload?.data?.carrier
  const rawStatus: string =
    payload?.data?.tracking_status?.status?.toUpperCase()
  const description: string =
    payload?.data?.tracking_status?.status_details ?? rawStatus

  if (!trackingNumber) {
    return { received: true }
  }

  // Update order in DB
  const order = await prisma.orders.findFirst({
    where: { trackingNumber },
    select: { id: true, userId: true },
  })

  if (order) {
    const orderStatus = rawStatus === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED'
    await prisma.orders.update({
      where: { id: order.id },
      data: { status: orderStatus as any },
    })

    // Push real-time notification to buyer via SSE
    sseConnections.send(order.userId, 'shipping_update', {
      orderId: order.id,
      trackingNumber,
      carrier,
      status: rawStatus,
      description,
    })
  }

  return { received: true }
})
