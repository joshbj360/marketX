// POST /api/squares/:slug/follow — buyer follows a Square (adds it to their home feed)
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { squareService } from '../../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  const result = await squareService.followSquare(user.id, slug)
  return { success: true, data: result }
})
