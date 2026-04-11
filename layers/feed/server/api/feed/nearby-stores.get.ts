import { defineEventHandler, getQuery, createError } from 'h3'
/**
 * GET /api/feed/nearby-stores?lat=X&lng=Y&radius=50&limit=20&offset=0
 * Returns stores that have GPS coordinates set, ordered by distance from
 * the user's location using the Haversine formula in JS.
 * (PostGIS would be faster at scale — keep this for Phase 1.)
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default defineEventHandler(async (event) => {
  const { lat, lng, radius = 50, limit = 20, offset = 0 } = getQuery(event) as Record<string, any>

  const userLat = parseFloat(lat)
  const userLng = parseFloat(lng)
  const radiusKm = Math.min(parseFloat(radius) || 50, 200)
  const take = Math.min(Number(limit) || 20, 50)
  const skip = Number(offset) || 0

  if (isNaN(userLat) || isNaN(userLng)) {
    throw createError({ statusCode: 400, statusMessage: 'lat and lng are required' })
  }

  // Fetch all stores with GPS — cheap at Phase 1 scale
  const stores = await prisma.sellerProfile.findMany({
    where: {
      is_active: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      store_slug: true,
      store_name: true,
      store_logo: true,
      locationLabel: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      _count: { select: { products: true } },
    },
  })

  // Filter by radius and attach distance
  const nearby = stores
    .map((s) => ({
      ...s,
      distanceKm: haversineKm(userLat, userLng, s.latitude!, s.longitude!),
    }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)

  const total = nearby.length
  const paginated = nearby.slice(skip, skip + take)

  return {
    success: true,
    data: paginated,
    meta: {
      total,
      limit: take,
      offset: skip,
      hasMore: skip + take < total,
    },
  }
})
