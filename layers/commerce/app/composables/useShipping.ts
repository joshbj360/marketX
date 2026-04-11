import type {
  IShipmentRate,
  ITrackingResult,
} from '~~/server/utils/shipping/types'

export type { IShipmentRate, ITrackingResult }

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  baseRate: number
  perKgRate: number
  estimatedDays: string
}

export interface ShippingCalculation {
  cost: number // NGN kobo
  zoneId: string
  zoneName: string
  estimatedDays: string
}

export const useShipping = () => {
  const zones = ref<ShippingZone[]>([])
  const isLoading = ref(false)
  const calculation = ref<ShippingCalculation | null>(null)

  const fetchZones = async () => {
    if (zones.value.length) return
    isLoading.value = true
    try {
      const res = await $fetch<{ success: boolean; data: ShippingZone[] }>(
        '/api/commerce/shipping/zones',
      )
      zones.value = res.data || []
    } catch {
      /* non-fatal */
    } finally {
      isLoading.value = false
    }
  }

  const calculateShipping = async (countryCode: string, weightKg = 0.5) => {
    if (!countryCode) {
      calculation.value = null
      return
    }
    isLoading.value = true
    try {
      const res = await $fetch<{ success: boolean; data: ShippingCalculation }>(
        '/api/commerce/shipping/calculate',
        { method: 'POST', body: { countryCode, weightKg } },
      )
      calculation.value = res.data
      return res.data
    } catch {
      calculation.value = null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Format a shipping cost (NGN kobo) in the customer's display currency.
   * Falls back to NGN if currency not provided.
   */
  const formatShippingCost = (
    kobo: number,
    currency: SupportedCurrency = 'NGN',
    rates?: Record<SupportedCurrency, number>,
  ): string => {
    if (kobo === 0) return 'Free'
    return formatInCurrency(kobo, currency, rates)
  }

  // ─── Live carrier rates (Sendbox / Shippo) ──────────────────────────────
  const liveRates = ref<IShipmentRate[]>([])
  const selectedRate = ref<IShipmentRate | null>(null)
  const isLoadingRates = ref(false)
  const ratesError = ref<string | null>(null)

  const fetchLiveRates = async (payload: {
    from: Record<string, string>
    to: Record<string, string>
    parcel: Record<string, number>
  }) => {
    isLoadingRates.value = true
    ratesError.value = null
    liveRates.value = []
    selectedRate.value = null
    try {
      const res = await $fetch<{ success: boolean; data: IShipmentRate[] }>(
        '/api/commerce/shipping/rates',
        { method: 'POST', body: payload },
      )
      liveRates.value = res.data
      // Auto-select cheapest
      if (liveRates.value.length > 0) {
        selectedRate.value = liveRates.value.reduce((a, b) =>
          a.amountNGN <= b.amountNGN ? a : b,
        )
      }
    } catch (e: unknown) {
      const err = e as Error & { data?: { message?: string } }
      ratesError.value = err?.data?.message ?? 'Could not fetch shipping rates'
    } finally {
      isLoadingRates.value = false
    }
  }

  const trackShipment = async (
    trackingNumber: string,
    carrier?: string,
    provider?: 'sendbox' | 'shippo',
  ): Promise<ITrackingResult | null> => {
    try {
      const params = new URLSearchParams()
      if (carrier) params.set('carrier', carrier)
      if (provider) params.set('provider', provider)
      const res = await $fetch<{ success: boolean; data: ITrackingResult }>(
        `/api/commerce/shipping/track/${trackingNumber}?${params.toString()}`,
      )
      return res.data
    } catch {
      return null
    }
  }

  return {
    zones,
    calculation,
    isLoading,
    fetchZones,
    calculateShipping,
    formatShippingCost,
    // Live carrier rates
    liveRates,
    selectedRate,
    isLoadingRates,
    ratesError,
    fetchLiveRates,
    trackShipment,
  }
}
