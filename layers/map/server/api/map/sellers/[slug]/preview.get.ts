// GET /api/map/sellers/:slug/preview?lat=X&lng=Y
import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3'
import { mapService } from '../../../../map.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const query = getQuery(event) as Record<string, string>
  const lat = parseFloat(query.lat)
  const lng = parseFloat(query.lng)

  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug is required' })
  if (isNaN(lat) || isNaN(lng)) throw createError({ statusCode: 400, statusMessage: 'lat and lng are required' })

  const seller = await mapService.getSellerPreview(slug, lat, lng)
  if (!seller) throw createError({ statusCode: 404, statusMessage: 'Seller not found' })

  return { success: true, data: seller }
})
