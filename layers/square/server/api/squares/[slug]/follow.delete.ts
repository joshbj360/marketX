// DELETE /api/squares/:slug/follow — unfollow a Square
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { squareService } from '../../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  const result = await squareService.unfollowSquare(user.id, slug)
  return { success: true, data: result }
})
