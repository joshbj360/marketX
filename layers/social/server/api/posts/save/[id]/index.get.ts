// GET /api/user/posts/[id] - Get post by ID

import { UserError } from '~~/layers/profile/server/types/user.types'
import { contentService } from '~~/layers/social/server/services/post.service'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw new UserError('INVALID_POST_ID', 'ID is required', 400)
    const result = await contentService.getSavedPost(id)
    return { success: true, data: result }
  } catch (error: unknown) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
