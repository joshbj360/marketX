// POST /api/squares/:slug/activate — admin makes a Square live
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { squareService } from '../../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  const square = await squareService.activateSquare(slug)
  return { success: true, data: square }
})
