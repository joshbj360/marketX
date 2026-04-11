const LOCALE_MAP: Record<string, string> = {
  NGN: 'en-NG',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'de-DE',
  GHS: 'en-GH',
  KES: 'sw-KE',
  ZAR: 'en-ZA',
}

export const SUPPORTED_CURRENCIES = [
  'NGN',
  'USD',
  'GBP',
  'EUR',
  'GHS',
  'KES',
  'ZAR',
] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

/**
 * Country code → display currency.
 * Used to auto-detect the right currency when a customer selects their country.
 */
export const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrency> = {
  // West Africa
  NG: 'NGN',
  GH: 'GHS',
  SN: 'NGN',
  CI: 'NGN',
  CM: 'NGN',
  BJ: 'NGN',
  TG: 'NGN',
  ML: 'NGN',
  BF: 'NGN',
  NE: 'NGN',
  GN: 'NGN',
  SL: 'NGN',
  LR: 'NGN',
  GM: 'NGN',
  GW: 'NGN',
  CV: 'NGN',
  MR: 'NGN',
  // East & Central Africa
  KE: 'KES',
  TZ: 'KES',
  UG: 'KES',
  RW: 'KES',
  ET: 'KES',
  ZM: 'USD',
  ZW: 'USD',
  MW: 'USD',
  MZ: 'USD',
  AO: 'USD',
  CD: 'USD',
  CG: 'USD',
  GA: 'USD',
  CF: 'USD',
  TD: 'USD',
  BI: 'USD',
  DJ: 'USD',
  ER: 'USD',
  SO: 'USD',
  SD: 'USD',
  SS: 'USD',
  // Southern Africa
  ZA: 'ZAR',
  NA: 'ZAR',
  BW: 'ZAR',
  LS: 'ZAR',
  SZ: 'ZAR',
  MG: 'USD',
  MU: 'USD',
  SC: 'USD',
  // North Africa & Middle East
  EG: 'USD',
  MA: 'USD',
  DZ: 'USD',
  TN: 'USD',
  LY: 'USD',
  AE: 'USD',
  SA: 'USD',
  QA: 'USD',
  KW: 'USD',
  BH: 'USD',
  OM: 'USD',
  JO: 'USD',
  LB: 'USD',
  IL: 'USD',
  IQ: 'USD',
  IR: 'USD',
  SY: 'USD',
  YE: 'USD',
  // Europe
  GB: 'GBP',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  SE: 'EUR',
  NO: 'EUR',
  DK: 'EUR',
  FI: 'EUR',
  PL: 'EUR',
  CZ: 'EUR',
  AT: 'EUR',
  CH: 'EUR',
  GR: 'EUR',
  RO: 'EUR',
  HU: 'EUR',
  SK: 'EUR',
  HR: 'EUR',
  BG: 'EUR',
  RS: 'EUR',
  SI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  LU: 'EUR',
  IS: 'EUR',
  AL: 'EUR',
  MK: 'EUR',
  ME: 'EUR',
  BA: 'EUR',
  MD: 'EUR',
  UA: 'EUR',
  BY: 'EUR',
  GE: 'USD',
  AM: 'USD',
  AZ: 'USD',
  TR: 'USD',
  // Americas
  US: 'USD',
  CA: 'USD',
  MX: 'USD',
  // Asia Pacific
  CN: 'USD',
  JP: 'USD',
  KR: 'USD',
  IN: 'USD',
  AU: 'USD',
  NZ: 'USD',
  SG: 'USD',
  MY: 'USD',
  TH: 'USD',
  ID: 'USD',
  PH: 'USD',
  VN: 'USD',
  PK: 'USD',
  BD: 'USD',
  LK: 'USD',
  NP: 'USD',
  MM: 'USD',
  KH: 'USD',
  LA: 'USD',
  BN: 'USD',
  MN: 'USD',
  TW: 'USD',
  HK: 'USD',
  MO: 'USD',
}

/**
 * Static fallback exchange rates: how many NGN = 1 unit of the given currency.
 * Update these periodically, or swap for a live rates endpoint.
 */
export const DEFAULT_RATES_TO_NGN: Record<SupportedCurrency, number> = {
  NGN: 1,
  USD: 1600,
  GBP: 2050,
  EUR: 1750,
  GHS: 105,
  KES: 12,
  ZAR: 88,
}

/** Returns the display currency for a given ISO country code. */
export function getCurrencyForCountry(countryCode: string): SupportedCurrency {
  return COUNTRY_TO_CURRENCY[countryCode?.toUpperCase()] ?? 'USD'
}

/**
 * Convert NGN kobo to major units of the target currency.
 * e.g. convertNGNKobo(500000, 'GBP') → ~2.44 (£2.44 at 2050 NGN/GBP)
 */
export function convertNGNKobo(
  kobo: number,
  toCurrency: SupportedCurrency,
  rates: Partial<Record<SupportedCurrency, number>> = {},
): number {
  if (toCurrency === 'NGN') return kobo / 100
  const rate = rates[toCurrency] ?? DEFAULT_RATES_TO_NGN[toCurrency]
  return kobo / 100 / rate
}

/**
 * Format NGN kobo as a currency string in the target currency.
 * e.g. formatInCurrency(500000, 'GBP') → "£2.44"
 */
export function formatInCurrency(
  kobo: number,
  toCurrency: SupportedCurrency = 'NGN',
  rates: Partial<Record<SupportedCurrency, number>> = {},
): string {
  const amount = convertNGNKobo(kobo, toCurrency, rates)
  const locale = LOCALE_MAP[toCurrency] ?? 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: toCurrency,
    minimumFractionDigits: toCurrency === 'NGN' ? 0 : 2,
    maximumFractionDigits: toCurrency === 'NGN' ? 0 : 2,
  }).format(amount)
}

/**
 * Format a product price stored as a major NGN unit (e.g. 5000 → ₦5,000).
 * Converts to the target display currency using exchange rates.
 *
 * Use this for: product.price, variant.price, cart totals
 */
export function formatProductPrice(
  majorNGN: number,
  toCurrency: SupportedCurrency = 'NGN',
  rates: Partial<Record<SupportedCurrency, number>> = {},
): string {
  let amount = majorNGN
  if (toCurrency !== 'NGN') {
    const rate = rates[toCurrency] ?? DEFAULT_RATES_TO_NGN[toCurrency]
    amount = majorNGN / rate
  }
  const locale = LOCALE_MAP[toCurrency] ?? 'en-NG'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: toCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** @deprecated use formatProductPrice or formatInCurrency explicitly */
export function formatPrice(amount: number, currency: string = 'NGN'): string {
  const locale = LOCALE_MAP[currency] ?? 'en-NG'
  const cur = SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)
    ? (currency as SupportedCurrency)
    : 'NGN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
