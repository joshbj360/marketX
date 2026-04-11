/**
 * GET /api/commerce/shipping/track/:trackingNumber?carrier=DHL&provider=shippo
 * Returns real-time tracking events for a shipment.
 */

import { getShippingProvider } from '~~/server/utils/shipping'

export default defineEventHandler(async (event) => {
  const trackingNumber = getRouterParam(event, 'trackingNumber')
  if (!trackingNumber) {
    throw createError({
      statusCode: 400,
      message: 'trackingNumber is required',
    })
  }

  const query = getQuery(event)
  const carrier = query.carrier as string | undefined
  // provider hint lets us route to the right implementation
  const providerHint = (query.provider as string) ?? 'shippo'

  // Use 'NG' to route to Sendbox, anything else → Shippo
  const country = providerHint === 'sendbox' ? 'NG' : 'US'
  const provider = getShippingProvider(country)

  const result = await provider.trackShipment(trackingNumber, carrier)

  return { success: true, data: result }
})
