/**
 * Sendbox Shipping Provider (Nigeria domestic)
 *
 * Docs: https://developer.sendbox.co
 * Auth: Bearer token via SENDBOX_API_KEY env var
 *
 * To replace with your own logistics platform:
 *   1. Create a new file (e.g. myplatform.ts) implementing IShippingProvider
 *   2. Update server/utils/shipping/index.ts to import + return it for Nigerian routes
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

const BASE = 'https://live.sendbox.co'

function headers() {
  const token = useRuntimeConfig().sendboxAccessToken
  if (!token) throw new Error('SENDBOX_ACCESS_TOKEN is not set')
  return {
    'Authorization-key': token,
    'Content-Type': 'application/json',
  }
}

/** Sendbox uses weight in grams */
function kgToGrams(kg: number) {
  return Math.round(kg * 1000)
}

/** Map Sendbox status codes to our unified TrackingStatus */
function mapStatus(raw: string): TrackingStatus {
  const s = raw?.toUpperCase()
  if (s === 'DELIVERED') return 'DELIVERED'
  if (s === 'IN_TRANSIT' || s === 'PICKED_UP') return 'IN_TRANSIT'
  if (s === 'OUT_FOR_DELIVERY') return 'OUT_FOR_DELIVERY'
  if (s === 'RETURNED') return 'RETURNED'
  if (s === 'FAILED' || s === 'CANCELLED') return 'FAILURE'
  if (s === 'CREATED' || s === 'PENDING') return 'PRE_TRANSIT'
  return 'UNKNOWN'
}

export const sendboxProvider: IShippingProvider = {
  name: 'sendbox',

  async getRates(payload: IGetRatesPayload): Promise<IShipmentRate[]> {
    const { from, to, parcel } = payload

    const body = {
      origin: {
        name: from.name,
        address: from.street1,
        city: from.city,
        state: from.state,
        country: from.country ?? 'NG',
        phone: from.phone,
      },
      destination: {
        name: to.name,
        address: to.street1,
        city: to.city,
        state: to.state,
        country: to.country ?? 'NG',
        phone: to.phone,
      },
      weight: parcel.weightKg,
      service_code: to.country === 'NG' ? 'local' : 'international',
      channel_code: 'api',
    }

    const res: any = await $fetch(`${BASE}/shipping/shipment_delivery_quote`, {
      method: 'POST',
      headers: headers(),
      body,
    })

    const rates: any[] = res?.data ?? res?.rates ?? res?.quotes ?? []
    if (!Array.isArray(rates) || rates.length === 0) {
      // Single quote response
      const q = res?.data ?? res
      if (q?.total_cost ?? q?.amount) {
        return [{
          rateId: q.service_code ?? 'sendbox-standard',
          carrier: 'Sendbox',
          service: q.service_name ?? q.service_code ?? 'Standard',
          amountNGN: Math.round((q.total_cost ?? q.amount ?? 0) * 100) / 100,
          estimatedDays: q.estimated_days ? `${q.estimated_days} business day(s)` : '2-5 business days',
          provider: 'sendbox',
        }]
      }
      return []
    }
    return rates.map((r) => ({
      rateId: r.id ?? r.service_code ?? 'sendbox-standard',
      carrier: r.carrier ?? r.courier_name ?? 'Sendbox',
      service: r.service_name ?? r.service_type ?? 'Standard',
      amountNGN: Math.round((r.total_cost ?? r.fee ?? r.amount ?? r.price ?? 0) * 100) / 100,
      estimatedDays: r.estimated_days
        ? `${r.estimated_days} business day(s)`
        : '2-5 business days',
      provider: 'sendbox',
    }))
  },

  async createShipment(
    payload: ICreateShipmentPayload,
  ): Promise<IShipmentResult> {
    const { rateId, from, to, parcel, orderId, description, valueNGN } = payload

    const body = {
      origin: {
        name: from.name,
        address: from.street1,
        city: from.city,
        state: from.state,
        country: from.country ?? 'NG',
        phone: from.phone,
        email: from.email,
      },
      destination: {
        name: to.name,
        address: to.street1,
        city: to.city,
        state: to.state,
        country: to.country ?? 'NG',
        phone: to.phone,
        email: to.email,
      },
      weight: parcel.weightKg,
      items: [
        {
          name: description ?? 'Merchandise',
          weight: parcel.weightKg,
          quantity: 1,
          value: valueNGN ?? 0,
          description: description ?? 'Merchandise',
        },
      ],
      total_value: valueNGN ?? 0,
      service_code: to.country === 'NG' ? 'local' : 'international',
      incoming_option: 'pickup',
      channel_code: 'api',
      package_type: 'parcel',
      callback_url: `${useRuntimeConfig().public.baseURL}/api/commerce/shipping/webhook/sendbox`,
    }

    const res: any = await $fetch(`${BASE}/shipping/shipments`, {
      method: 'POST',
      headers: headers(),
      body,
    })

    const shipment = res?.data ?? res
    return {
      trackingNumber: shipment.tracking_number ?? shipment.trackingNumber,
      carrier: shipment.carrier ?? 'Sendbox',
      labelUrl: shipment.label_url ?? shipment.labelUrl ?? '',
      provider: 'sendbox',
      estimatedDays: shipment.estimated_days
        ? `${shipment.estimated_days} business day(s)`
        : '2-5 business days',
    }
  },

  async trackShipment(trackingNumber: string): Promise<ITrackingResult> {
    const res: any = await $fetch(
      `${BASE}/shipping/shipments/${trackingNumber}`,
      { headers: headers() },
    )

    const data = res?.data ?? res
    const events = (data?.events ?? data?.history ?? []).map((e: any) => ({
      timestamp: e.created_at ?? e.timestamp ?? new Date().toISOString(),
      status: mapStatus(e.status),
      description: e.description ?? e.message ?? e.status,
      location: e.location ?? undefined,
    }))

    return {
      trackingNumber,
      carrier: data?.carrier ?? 'Sendbox',
      currentStatus: mapStatus(data?.status),
      estimatedDelivery: data?.estimated_delivery ?? undefined,
      events,
    }
  },
}
