// GET /api/map/sellers?lat=X&lng=Y&radius=50&limit=50&filter=deals&search=ankara&category=fashion
import { defineEventHandler, getQuery, createError } from 'h3'
import { mapService } from '../../map.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, string>

  const lat = parseFloat(query.lat)
  const lng = parseFloat(query.lng)
  const radiusKm = Math.min(parseFloat(query.radius) || 50, 20000)
  const limit = Math.min(parseInt(query.limit) || 100, 200)
  const offset = parseInt(query.offset) || 0
  const filter = (['deals', 'premium', 'verified'].includes(query.filter)
    ? query.filter
    : null) as 'deals' | 'premium' | 'verified' | null
  const search = String(query.search || '').trim().slice(0, 80) || undefined
  const categorySlug = String(query.category || '').trim() || undefined

  if (isNaN(lat) || isNaN(lng)) {
    throw createError({ statusCode: 400, statusMessage: 'lat and lng are required' })
  }

  const result = await mapService.getNearby({
    lat, lng, radiusKm, limit, offset, filter, search, categorySlug,
  })
  return { success: true, ...result }
})
