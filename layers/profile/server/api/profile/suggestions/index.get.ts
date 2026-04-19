// server/api/social/suggestions.get.ts

import { socialService } from '~~/layers/profile/server/services/social.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await requireAuth(event)

    const query = getQuery(event)
    const limit = Number(query.limit) || 10

    // Get suggested users
    const suggestions = await socialService.getSuggestedUsers(user.id, limit)

    return {
      success: true,
      data: suggestions,
    }
  } catch (error: unknown) {
    logger.error('Get suggestions error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch suggestions',
    })
  }
})
