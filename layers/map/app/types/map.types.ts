export interface IMapSeller {
  id: string
  store_slug: string
  store_name: string | null
  store_logo: string | null
  locationLabel: string | null
  city: string | null
  state: string | null
  latitude: number
  longitude: number
  distanceKm: number
  isPremium: boolean
  is_verified: boolean
  hasActiveDeal: boolean
  productCount: number
  followerCount: number
  isOnline: boolean
  isOpenNow: boolean
  closesAt: string | null      // e.g. "18:00" when open
  lastSeenLabel: string | null // e.g. "2h ago" when offline, null when online
  businessHours: Record<string, { open?: string; close?: string; closed?: boolean }> | null
}

export interface IMapSellerPreview extends IMapSeller {
  description: string | null
  avgRating: number | null
  totalReviews: number
  categories: string[]
  topProducts: Array<{
    id: number
    title: string
    price: number
    discount: number | null
    media: Array<{ url: string }>
  }>
}

export type MapFilter = 'all' | 'deals' | 'premium' | 'verified'

/** Legacy alias for backwards compat with map.vue */
export type INearbyStore = IMapSeller
