/**
 * POST /api/commerce/shipping/rates
 * Get live shipping rate quotes for a given origin/destination/parcel.
 *
 * Accepts either:
 *   { storeSlug, to, parcel }    – server resolves seller's ship-from address
 *   { from, to, parcel }         – explicit origin (fallback / admin use)
 *
 * Called at checkout before the user selects a shipping option.
 */

import { getShippingProvider } from '~~/server/utils/shipping'
import type { IGetRatesPayload, IAddress } from '~~/server/utils/shipping'

interface IRatesBody {
  storeSlug?: string
  from?: IAddress
  to: IAddress
  parcel: IGetRatesPayload['parcel']
}

export default defineEventHandler(async (event) => {
  const body = await readBody<IRatesBody>(event)

  if (!body?.to || !body?.parcel) {
    throw createError({
      statusCode: 400,
      message: 'to and parcel are required',
    })
  }

  let from: IAddress | undefined = body.from

  // Resolve seller ship-from address when storeSlug is provided
  if (body.storeSlug) {
    const seller = await prisma.sellerProfile.findUnique({
      where: { store_slug: body.storeSlug },
      select: {
        store_name: true,
        shipFromName: true,
        shipFromAddress: true,
        shipFromCity: true,
        shipFromState: true,
        shipFromZip: true,
        shipFromCountry: true,
        shipFromPhone: true,
      },
    })

    if (seller?.shipFromAddress && seller?.shipFromCity) {
      from = {
        name: seller.shipFromName || seller.store_name || 'Seller',
        street1: seller.shipFromAddress,
        city: seller.shipFromCity,
        state: seller.shipFromState || seller.shipFromCity,
        zip: seller.shipFromZip || '100001',
        country: seller.shipFromCountry || 'NG',
        phone: seller.shipFromPhone || undefined,
      }
    }
  }

  // Seller hasn't set up their ship-from address yet — return empty so the
  // client falls back to the GlobalShippingZone flat rate automatically.
  if (!from) {
    return { success: true, data: [], fallback: true }
  }

  const payload: IGetRatesPayload = { from, to: body.to, parcel: body.parcel }
  const provider = getShippingProvider(body.to.country)

  try {
    const rates = await provider.getRates(payload)
    return { success: true, data: rates }
  } catch (err: any) {
    // Provider API unavailable or not configured — fall back to flat rates
    console.warn(
      `[shipping/rates] ${provider.name} failed (${err?.message ?? err}), falling back to GlobalShippingZone`,
    )
    return { success: true, data: [], fallback: true }
  }
})
