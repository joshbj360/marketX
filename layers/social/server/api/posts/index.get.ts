// GET /api/user/posts - Get my posts
import { contentService } from '~~/layers/social/server/services/post.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await contentService.getMyPosts(user.id, limit, offset)
    return { success: true, data: result }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
