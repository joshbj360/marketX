import { contentService } from '~~/layers/social/server/services/post.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await contentService.getSavedPosts(user.id, limit, offset)
    // Repository returns SavedPost records with a nested .post field — extract the actual posts
    const posts = result.posts.map((sp: any) => sp.post).filter(Boolean)
    return {
      success: true,
      data: posts,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + posts.length < result.total,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
