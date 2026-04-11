// GET /api/user/follow/following/@[username] - Get user's following

import { socialService } from '~~/layers/profile/server/services/social.service'
import { UserError } from '~~/layers/profile/server/types/user.types'

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    if (!username) {
      throw new UserError('INVALID_USERNAME', 'Username is required', 400)
    }
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await socialService.getUserFollowing(username, limit, offset)
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
