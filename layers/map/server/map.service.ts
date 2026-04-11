import { mapRepository } from './map.repository'
import { haversineKm } from './haversine'
import { remember } from '../../../server/utils/cache'

export type MapFilter = 'deals' | 'premium' | 'verified' | null

export const mapService = {
  async getNearby(opts: {
    lat: number
    lng: number
    radiusKm: number
    limit: number
    offset: number
    filter: MapFilter
    search?: string
    categorySlug?: string
  }) {
    let all: Awaited<ReturnType<typeof mapRepository.getAllGeoSellers>>

    if (opts.search) {
      // Search bypasses cache (targeted, infrequent)
      all = await mapRepository.searchSellers(opts.search)
    } else if (opts.categorySlug) {
      // Category-scoped cache
      all = await remember(
        `map:geo-sellers:${opts.categorySlug}`,
        300,
        () => mapRepository.getAllGeoSellers(opts.categorySlug),
      )
    } else {
      all = await remember('map:geo-sellers:all', 300, () => mapRepository.getAllGeoSellers())
    }

    let filtered = all
      .map((s) => ({ ...s, distanceKm: haversineKm(opts.lat, opts.lng, s.latitude, s.longitude) }))
      .filter((s) => s.distanceKm <= opts.radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)

    if (opts.filter === 'deals')    filtered = filtered.filter((s) => s.hasActiveDeal)
    if (opts.filter === 'premium')  filtered = filtered.filter((s) => s.isPremium)
    if (opts.filter === 'verified') filtered = filtered.filter((s) => s.is_verified)

    const total = filtered.length
    const data = filtered.slice(opts.offset, opts.offset + opts.limit)

    return {
      data,
      meta: { total, limit: opts.limit, offset: opts.offset, hasMore: opts.offset + opts.limit < total },
    }
  },

  async getSellerPreview(storeSlug: string, userLat: number, userLng: number) {
    const s = await mapRepository.getSellerPreview(storeSlug)
    if (!s || !s.latitude || !s.longitude) return null

    const nowMs = Date.now()
    const nowDate = new Date()
    const hasActiveDeal = s.products.some(
      (p: any) => p.isDeal && p.dealEndsAt && p.dealEndsAt > nowDate,
    )
    const isOnline = s.lastActiveAt
      ? nowMs - s.lastActiveAt.getTime() < 30 * 60 * 1000
      : false

    // Compute open status
    let isOpenNow = false
    let closesAt: string | null = null
    if (s.businessHours) {
      try {
        const tz = s.timezone ?? 'Africa/Lagos'
        const fmt = new Intl.DateTimeFormat('en-US', {
          timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
        })
        const parts = fmt.formatToParts(nowDate)
        const day = (parts.find((p) => p.type === 'weekday')?.value ?? '').toLowerCase().slice(0, 3)
        const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
        const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10)
        const dh: any = (s.businessHours as any)[day]
        if (dh && !dh.closed) {
          const [oh, om] = (dh.open ?? '00:00').split(':').map(Number)
          const [ch, cm] = (dh.close ?? '00:00').split(':').map(Number)
          const nowMins = h * 60 + m
          if (nowMins >= oh * 60 + om && nowMins < ch * 60 + cm) {
            isOpenNow = true
            closesAt = dh.close ?? null
          }
        }
      } catch {}
    }

    const lastSeenLabel = isOnline ? null : (() => {
      if (!s.lastActiveAt) return null
      const d = nowMs - s.lastActiveAt.getTime()
      const mins = Math.floor(d / 60_000)
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      return `${Math.floor(hrs / 24)}d ago`
    })()

    return {
      id: s.id,
      store_slug: s.store_slug,
      store_name: s.store_name,
      store_logo: s.store_logo,
      description: s.store_description ?? null,
      locationLabel: s.locationLabel,
      city: s.city,
      state: s.state,
      latitude: s.latitude,
      longitude: s.longitude,
      isPremium: s.isPremium,
      is_verified: s.is_verified,
      hasActiveDeal,
      isOnline,
      isOpenNow,
      closesAt,
      lastSeenLabel,
      businessHours: (s.businessHours as any) ?? null,
      productCount: s._count.products,
      followerCount: s.followers_count,
      distanceKm: haversineKm(userLat, userLng, s.latitude, s.longitude),
      avgRating: null,
      totalReviews: 0,
      categories: [] as string[],
      topProducts: s.products.map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        discount: p.discount,
        media: p.media,
      })),
    }
  },
}
