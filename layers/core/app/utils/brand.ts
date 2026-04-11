/**
 * Brand config — SINGLE SOURCE OF TRUTH.
 * To rename the app, update NUXT_PUBLIC_SITE_NAME in .env.
 * All hardcoded fallbacks reference this file — never hardcode the brand name in components.
 *
 * Usage in composables / script setup:
 *   const brand = useBrand()
 *   brand.name        // "MarketX"
 *
 * Usage in templates:
 *   {{ $config.public.siteName }}
 *
 * Usage in server-side code:
 *   import { BRAND } from '~~/layers/core/app/utils/brand'
 */

/** Static brand constants — use in server-side code or where composables can't run */
export const BRAND = {
  name: 'MarketX',
  domain: 'marketx.app',
  storagePrefix: 'marketx',
  twitterHandle: '@marketxapp',
  supportEmail: 'support@marketx.app',
  privacyEmail: 'privacy@marketx.app',
  legalEmail: 'legal@marketx.app',
  tagline: 'Your business, fully alive. Discover stores, buy local, sell globally.',
  shortTagline: 'The market for everyday business.',
  description:
    'MarketX is the all-in-one platform for everyday businesses — social discovery, local map, seamless payments, and smart tools to grow.',
} as const

/** Reactive brand config composable — reads site name from runtime config so .env overrides work */
export const useBrand = () => {
  if (import.meta.server || typeof useRuntimeConfig === 'undefined')
    return BRAND
  const config = useRuntimeConfig()
  return {
    ...BRAND,
    name: (config.public.siteName as string) || BRAND.name,
    domain: (config.public.brandDomain as string) || BRAND.domain,
    supportEmail: (config.public.supportEmail as string) || BRAND.supportEmail,
    privacyEmail: (config.public.privacyEmail as string) || BRAND.privacyEmail,
    legalEmail: (config.public.legalEmail as string) || BRAND.legalEmail,
  }
}