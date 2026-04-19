// GET /api/user/conversations - Get my conversations

import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { chatService } from '../../services/chat.service'
import { UserError } from '../../types/user.types'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await chatService.getConversations(user.id, limit, offset)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load conversations right now',
    })
  }
})
