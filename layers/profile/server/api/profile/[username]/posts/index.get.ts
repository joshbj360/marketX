import { UserError } from '~~/layers/profile/server/types/user.types'
import { contentService } from '~~/layers/social/server/services/post.service'

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    if (!username) {
      throw new UserError('INVALID_USERNAME', 'Username is required', 400)
    }
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    // Optional auth: set by global auth middleware when token is present
    const viewerId: string | undefined = (event.context.auth as any)?.user
      ?.userId

    const { posts, total } = await contentService.getUserPosts(
      username,
      limit,
      offset,
      viewerId,
    )

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
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
