/**
 * Shipping Router
 *
 * Single point of truth for provider selection.
 * ─────────────────────────────────────────────────────────────
 *  Nigeria (NG) → Sendbox   (domestic Nigerian logistics)
 *  Everything else → Shippo (international)
 * ─────────────────────────────────────────────────────────────
 *
 * To swap providers:
 *   1. Implement IShippingProvider in a new file
 *   2. Replace the import below and update the condition
 *   3. Done — zero other changes needed
 */

import { sendboxProvider } from './sendbox'
import { shippoProvider } from './shippo'
import type { IShippingProvider } from './types'

export function getShippingProvider(
  destinationCountry: string,
): IShippingProvider {
  if (destinationCountry?.toUpperCase() === 'NG') {
    return sendboxProvider
  }
  return shippoProvider
}
