// DELETE /api/user/posts/[id]/comments/[commentId] - Delete comment

import { UserError } from '~~/layers/profile/server/types/user.types'
import { contentService } from '~~/layers/social/server/services/post.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const commentId = getRouterParam(event, 'commentId') // ✅ Route param

    if (!commentId) {
      throw new UserError('INVALID_ID', 'Comment ID is required', 400)
    }

    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    const result = await contentService.deleteComment(
      user.id,
      commentId,
      ipAddress,
      userAgent,
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
