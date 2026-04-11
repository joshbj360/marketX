// DELETE /api/stories/:id

import { UserError } from '~~/layers/profile/server/types/user.types'
import { storyService } from '~~/layers/social/server/services/story.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id') || ''
    if (!id) throw new UserError('INVALID_ID', 'Story ID is required', 400)
    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    await storyService.deleteStory(id, user.id, ipAddress, userAgent)
    return { success: true }
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
