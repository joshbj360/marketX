// GET /api/stories - Get active stories

import { UserError } from '~~/layers/profile/server/types/user.types'
import { storyService } from '~~/layers/social/server/services/story.service'
import { optionalAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await optionalAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Number(query.limit) || 50, 100)
    const stories = await storyService.getStories(user?.id, limit)
    return { success: true, data: stories }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
