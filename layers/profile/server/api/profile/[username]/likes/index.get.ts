// GET /api/profile/[username]/likes — posts liked by this user (own profile only)
import { UserError } from '~~/layers/profile/server/types/user.types'
import { postRepository } from '~~/layers/social/server/repositories/post.repository'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const me = await requireAuth(event)
    const username = getRouterParam(event, 'username')

    if (!username) {
      throw new UserError('INVALID_USERNAME', 'Username is required', 400)
    }

    // Only allow authenticated user to see their own liked posts (privacy)
    if (me.username !== username) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only view your own liked posts',
      })
    }

    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const likes = await postRepository.getLikedPostsByUser(me.id, limit, offset)
    const total = await postRepository.getLikedPostsCountByUser(me.id)

    // Flatten PostLike → Post and filter out deleted posts
    const posts = likes.map((l: any) => l.post).filter(Boolean)

    return {
      success: true,
      data: posts,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + posts.length < total,
      },
    }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    throw error
  }
})
