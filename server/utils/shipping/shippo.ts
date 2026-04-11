/**
 * Shippo Shipping Provider (International)
 *
 * Docs: https://goshippo.com/docs/
 * Auth: ShippoToken via SHIPPO_API_KEY env var
 * SDK-free — uses Shippo REST API v1 directly
 *
 * Rates flow:
 *   1. POST /shipments → creates a shipment object, triggers rate generation
 *   2. GET  /shipments/:id/rates → retrieve available rates
 *   3. POST /transactions → book a rate, generates label
 */

import type {
  IShippingProvider,
  IGetRatesPayload,
  IShipmentRate,
  ICreateShipmentPayload,
  IShipmentResult,
  ITrackingResult,
  TrackingStatus,
} from './types'

const BASE = 'https://api.goshippo.com'

function headers() {
  const key = useRuntimeConfig().shippoApiKey
  if (!key) throw new Error('SHIPPO_API_KEY is not set')
  return {
    Authorization: `ShippoToken ${key}`,
    'Content-Type': 'application/json',
  }
}

function mapStatus(raw: string): TrackingStatus {
  const s = raw?.toUpperCase()
  if (s === 'DELIVERED') return 'DELIVERED'
  if (s === 'TRANSIT') return 'IN_TRANSIT'
  if (s === 'OUT_FOR_DELIVERY') return 'OUT_FOR_DELIVERY'
  if (s === 'RETURNED') return 'RETURNED'
  if (s === 'FAILURE') return 'FAILURE'
  if (s === 'PRE_TRANSIT') return 'PRE_TRANSIT'
  return 'UNKNOWN'
}

/** Shippo address object shape */
function toShippoAddress(addr: IGetRatesPayload['from']) {
  const obj: Record<string, string | boolean> = {
    name: addr.name,
    street1: addr.street1,
    city: addr.city,
    zip: addr.zip || '000000',
    country: addr.country,
    validate: false, // skip strict validation — let Shippo infer from zip for US
  }
  if (addr.street2) obj.street2 = addr.street2
  if (addr.state) obj.state = addr.state
  if (addr.phone) obj.phone = addr.phone
  if (addr.email) obj.email = addr.email
  return obj
}

/** Convert Shippo amount string (USD) to NGN using a fixed fallback rate.
 *  Real-time conversion is handled by useCurrency on the client.
 *  $1 ≈ ₦1600 (mid-2025 estimate — update as needed) */
const USD_TO_NGN = 1600

function usdToNGN(usdStr: string): number {
  const usd = parseFloat(usdStr) || 0
  return Math.round(usd * USD_TO_NGN)
}

export const shippoProvider: IShippingProvider = {
  name: 'shippo',

  async getRates(payload: IGetRatesPayload): Promise<IShipmentRate[]> {
    const { from, to, parcel } = payload

    // Step 1: Create shipment object (async=false → rates included in response)
    const res: any = await $fetch(`${BASE}/shipments`, {
      method: 'POST',
      headers: headers(),
      body: {
        address_from: toShippoAddress(from),
        address_to: toShippoAddress(to),
        parcels: [
          {
            weight: parcel.weightKg.toString(),
            mass_unit: 'kg',
            length: parcel.lengthCm.toString(),
            width: parcel.widthCm.toString(),
            height: parcel.heightCm.toString(),
            distance_unit: 'cm',
          },
        ],
        async: false,
      },
    })

    const rates: any[] = res?.rates ?? []
    console.log(
      '[Shippo] shipment:',
      JSON.stringify(
        {
          status: res?.status,
          rateCount: rates.length,
          addressFromValidation: res?.address_from?.validation_results,
          addressToValidation: res?.address_to?.validation_results,
          messages: res?.messages,
          rates: rates.map((r) => ({
            state: r.object_state,
            provider: r.provider,
            amount: r.amount,
            service: r.servicelevel?.name,
          })),
        },
        null,
        2,
      ),
    )
    return rates
      .filter((r) => r.object_state !== 'INVALID')
      .map((r) => ({
        rateId: r.object_id,
        carrier: r.provider ?? 'Unknown',
        service: r.servicelevel?.name ?? r.servicelevel_name ?? 'Standard',
        amountNGN: usdToNGN(r.amount),
        estimatedDays:
          r.estimated_days != null
            ? `${r.estimated_days} business day(s)`
            : r.duration_terms ?? 'Varies',
        provider: 'shippo',
      }))
  },

  async createShipment(
    payload: ICreateShipmentPayload,
  ): Promise<IShipmentResult> {
    const { rateId, from, to, parcel, orderId, description, valueNGN } = payload

    // Book the rate → creates a transaction with label
    const tx: any = await $fetch(`${BASE}/transactions`, {
      method: 'POST',
      headers: headers(),
      body: {
        rate: rateId,
        label_file_type: 'PDF',
        async: false,
        metadata: `ORDER-${orderId}`,
      },
    })

    if (tx.status !== 'SUCCESS') {
      const msgs = (tx.messages ?? []).map((m: any) => m.text).join('; ')
      throw new Error(`Shippo label creation failed: ${msgs}`)
    }

    return {
      trackingNumber: tx.tracking_number,
      carrier: tx.rate?.provider ?? 'Carrier',
      labelUrl: tx.label_url,
      provider: 'shippo',
      estimatedDays: tx.rate?.estimated_days
        ? `${tx.rate.estimated_days} business day(s)`
        : 'Varies',
    }
  },

  async trackShipment(
    trackingNumber: string,
    carrier?: string,
  ): Promise<ITrackingResult> {
    // Shippo tracking endpoint: GET /tracks/:carrier/:trackingNumber
    const carrierSlug = carrier?.toLowerCase() ?? 'usps'
    const res: any = await $fetch(
      `${BASE}/tracks/${carrierSlug}/${trackingNumber}`,
      { headers: headers() },
    )

    const events = (res?.tracking_history ?? []).map((e: any) => ({
      timestamp: e.status_date ?? new Date().toISOString(),
      status: mapStatus(e.status),
      description: e.status_details ?? e.status,
      location: e.location?.city
        ? `${e.location.city}, ${e.location.state ?? ''}, ${e.location.country ?? ''}`
        : undefined,
    }))

    return {
      trackingNumber,
      carrier: res?.carrier ?? carrier ?? 'Unknown',
      currentStatus: mapStatus(res?.tracking_status?.status),
      estimatedDelivery: res?.eta ?? undefined,
      events,
    }
  },
}
