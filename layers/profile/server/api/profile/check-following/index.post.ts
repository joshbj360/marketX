// server/api/social/check-following.post.ts

import { socialService } from '~~/layers/profile/server/services/social.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user

    const user = await requireAuth(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const body = await readBody(event)
    const { targetIds, followingType = 'USER' } = body

    if (!targetIds || !Array.isArray(targetIds)) {
      throw createError({
        statusCode: 400,
        message: 'targetIds array is required',
      })
    }

    // Check following batch
    const followingSet = await socialService.checkFollowingBatch(
      user.id,
      targetIds,
      followingType,
    )

    // Convert Set to object for JSON response
    const followingMap: Record<string, boolean> = {}
    targetIds.forEach((id) => {
      followingMap[id] = followingSet.has(id)
    })

    return {
      success: true,
      data: followingMap,
    }
  } catch (error: unknown) {
    console.error('Check following batch error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to check following status',
    })
  }
})
