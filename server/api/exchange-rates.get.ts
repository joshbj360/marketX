/**
 * GET /api/exchange-rates
 *
 * Fetches NGN→X exchange rates from open.er-api.com (free, no key required).
 * Results are cached in memory for 1 hour so we don't hammer the external API
 * every time a product card renders.
 *
 * Returns: { NGN: 1, USD: 0.000625, GBP: 0.000488, EUR: 0.000571, ... }
 * i.e. "1 NGN = X foreign units"
 */

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

let cachedRates: Record<string, number> | null = null
let cacheExpiry = 0

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  // Return in-memory cache if still fresh
  if (cachedRates && Date.now() < cacheExpiry) {
    return { success: true, data: cachedRates, cached: true }
  }

  try {
    const res = await $fetch<any>('https://open.er-api.com/v6/latest/NGN', {
      timeout: 5000,
    })

    if (res && res.result === 'success' && res.rates) {
      cachedRates = res.rates as Record<string, number>
      cacheExpiry = Date.now() + CACHE_TTL
      return { success: true, data: cachedRates, cached: false }
    }

    throw new Error('Bad response from exchange rate API')
  } catch {
    // If the external API fails, return built-in fallback rates
    // so the app never breaks — prices just show approximate values
    const fallback: Record<string, number> = {
      NGN: 1,
      USD: 0.000625, // 1 NGN ≈ 0.000625 USD  (≈ 1600 NGN/USD)
      GBP: 0.000488, // 1 NGN ≈ 0.000488 GBP  (≈ 2050 NGN/GBP)
      EUR: 0.000571, // 1 NGN ≈ 0.000571 EUR  (≈ 1750 NGN/EUR)
      GHS: 0.00952, // 1 NGN ≈ 0.00952 GHS   (≈ 105  NGN/GHS)
      KES: 0.0833, // 1 NGN ≈ 0.0833 KES    (≈ 12   NGN/KES)
      ZAR: 0.01136, // 1 NGN ≈ 0.01136 ZAR   (≈ 88   NGN/ZAR)
      CAD: 0.000856, // 1 NGN ≈ 0.000856 CAD  (≈ 1168 NGN/CAD)
    }
    return { success: true, data: fallback, cached: false, fallback: true }
  }
})
