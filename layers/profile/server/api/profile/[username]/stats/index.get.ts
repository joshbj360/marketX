// server/api/profile/[username]/stats.get.ts

import { profileRepository } from '~~/layers/profile/server/repositories/profile.repository'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { profileService } from '~~/layers/profile/server/services/profile.service'

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')

    if (!username) {
      throw new UserError('INVALID_REQUEST', 'Username is required', 400)
    }

    // Get user by username
    const user = await profileRepository.findByUsername(username)

    if (!user) {
      throw new UserError('USER_NOT_FOUND', `User @${username} not found`, 404)
    }

    // ✅ Get COMPLETE stats (posts, likes, followers, following)
    const stats = await profileService.getProfileStats(user.id)

    return {
      success: true,
      data: stats,
    }
  } catch (error: unknown) {
    console.error('Get user stats error:', error)

    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        message: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user stats',
    })
  }
})
