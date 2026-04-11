// GET /api/user/posts/[id]/comments/[commentId]/replies - Get comment replies

import { UserError } from '~~/layers/profile/server/types/user.types'
import { postRepository } from '~~/layers/social/server/repositories/post.repository'

export default defineEventHandler(async (event) => {
  try {
    const commentId = getRouterParam(event, 'commentId') // ✅ Route param

    if (!commentId) {
      throw new UserError('INVALID_ID', 'Comment ID is required', 400)
    }
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    // Using getPostComments with parentId filter (from repository)
    const result = await postRepository.getCommentReplies(
      commentId,
      limit,
      offset,
    )
    return { success: true, data: result }
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
