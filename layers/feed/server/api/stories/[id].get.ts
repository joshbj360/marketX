// GET /api/stories/:id - Get a single story by id

import { UserError } from '~~/layers/profile/server/types/user.types'
import { storyRepository } from '~~/layers/social/server/repositories/story.repository'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id') || ''
    if (!id) throw new UserError('INVALID_ID', 'Story ID is required', 400)
    const story = await storyRepository.getStoryById(id)
    if (!story) throw new UserError('NOT_FOUND', 'Story not found', 404)
    if (story.expiresAt < new Date())
      throw new UserError('EXPIRED', 'Story has expired', 410)
    return { success: true, data: story }
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
