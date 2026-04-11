/**
 * useCurrency — single source of truth for all price display
 *
 * Usage in any component:
 *   const { formatPrice, formatKobo, displayCurrency } = useCurrency()
 *   // In template: {{ formatPrice(product.price) }}
 *
 * - Reads the user's preferred currency from useSettings()
 * - Fetches live exchange rates once per session (cached 1hr server-side)
 * - Re-converts all prices instantly when the user changes currency in Settings
 * - Falls back to built-in static rates if the API is unreachable
 */

import {
  formatProductPrice,
  formatInCurrency,
  getCurrencyForCountry,
  type SupportedCurrency,
} from '~~/shared/utils/currency'

// ── Module-level singletons ───────────────────────────────────────────────────
// Shared across ALL components — rates are fetched once, not per component
const rates = ref<Record<string, number>>({})
const isFetchingRates = ref(false)
let ratesFetchedAt = 0
const REFETCH_INTERVAL = 60 * 60 * 1000 // 1 hour

const fetchRates = async () => {
  if (isFetchingRates.value) return
  if (
    rates.value &&
    Object.keys(rates.value).length > 0 &&
    Date.now() - ratesFetchedAt < REFETCH_INTERVAL
  )
    return

  isFetchingRates.value = true
  try {
    const res = await $fetch<{
      success: boolean
      data: Record<string, number>
    }>('/api/exchange-rates')
    if (res?.data) {
      rates.value = res.data
      ratesFetchedAt = Date.now()
    }
  } catch {
    // Server fallback rates will be used via DEFAULT_RATES_TO_NGN in currency.ts
  } finally {
    isFetchingRates.value = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const useCurrency = () => {
  const { settings } = useSettings()

  // The currency the user wants to see prices in
  const displayCurrency = computed(
    () => settings.value.currency as SupportedCurrency,
  )

  // Fetch rates on first use, and whenever currency changes
  if (import.meta.client) {
    fetchRates()
    watch(displayCurrency, () => fetchRates())
  }

  // Build inverted rates map (formatProductPrice expects 1 USD = X NGN)
  const ratesForFormatter = (): Partial<Record<SupportedCurrency, number>> => {
    const r: Partial<Record<SupportedCurrency, number>> = {}
    for (const [cur, rate] of Object.entries(rates.value)) {
      if (rate > 0) r[cur as SupportedCurrency] = 1 / rate
    }
    return r
  }

  /**
   * Format a product price stored in major NGN units (e.g. product.price = 5000 → ₦5,000 or $3.13).
   * Pass an explicit `currency` to override the user's display currency (e.g. checkout).
   */
  const formatPrice = (
    amountNGN: number | undefined | null,
    currency?: SupportedCurrency,
  ): string => {
    if (amountNGN == null || isNaN(amountNGN)) return '—'
    const to = currency ?? displayCurrency.value
    if (to === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountNGN)
    }
    return formatProductPrice(amountNGN, to, ratesForFormatter())
  }

  /** Format a product price always in NGN (e.g. secondary "charged as" line). */
  const formatProductNGN = (amountNGN: number | undefined | null): string =>
    formatPrice(amountNGN, 'NGN')

  /**
   * Format a shipping/order amount stored in NGN kobo (smallest unit, e.g. 50000 = ₦500).
   * Pass an explicit `currency` to override the user's display currency.
   */
  const formatKobo = (
    koboNGN: number | undefined | null,
    currency?: SupportedCurrency,
  ): string => {
    if (koboNGN == null || isNaN(koboNGN)) return '—'
    const to = currency ?? displayCurrency.value
    return formatInCurrency(koboNGN, to, ratesForFormatter())
  }

  /** Format a kobo amount always in NGN. */
  const formatNGN = (koboNGN: number | undefined | null): string =>
    formatKobo(koboNGN, 'NGN')

  /**
   * Just the currency symbol for the current display currency
   */
  const currencySymbol = computed(() => {
    const symbols: Record<string, string> = {
      NGN: '₦',
      USD: '$',
      GBP: '£',
      EUR: '€',
      GHS: '₵',
      KES: 'KSh',
      ZAR: 'R',
      CAD: 'C$',
    }
    return symbols[displayCurrency.value] ?? displayCurrency.value
  })

  return {
    displayCurrency,
    currencySymbol,
    getCurrencyForCountry,
    formatPrice,
    formatProductNGN,
    formatKobo,
    formatNGN,
    isFetchingRates: readonly(isFetchingRates),
  }
}
