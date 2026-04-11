/**
 * POST /api/commerce/shipping/create
 * Book a shipment after an order is confirmed + paid.
 * Creates label, stores tracking info on the Order record.
 */

import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { prisma } from '~~/server/utils/db'
import { getShippingProvider } from '~~/server/utils/shipping'
import type { ICreateShipmentPayload } from '~~/server/utils/shipping'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody<ICreateShipmentPayload & { orderId: number }>(
    event,
  )

  if (!body?.orderId || !body?.rateId || !body?.from || !body?.to) {
    throw createError({
      statusCode: 400,
      message: 'orderId, rateId, from, and to are required',
    })
  }

  // Verify order belongs to this user (or seller managing the order)
  const order = await prisma.orders.findUnique({
    where: { id: body.orderId },
    select: { id: true, userId: true, status: true },
  })

  if (!order) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }

  // Allow buyer or any seller (sellers ship on behalf of orders they fulfil)
  // TODO: add seller ownership check when multi-seller orders are split
  if (order.userId !== user.id) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const provider = getShippingProvider(body.to.country)
  const result = await provider.createShipment(body)

  // Persist tracking info on the order
  await prisma.orders.update({
    where: { id: body.orderId },
    data: {
      trackingNumber: result.trackingNumber,
      shipper: result.carrier,
      labelUrl: result.labelUrl,
      shippingProvider: result.provider,
      status: 'SHIPPED',
    },
  })

  return { success: true, data: result }
})
