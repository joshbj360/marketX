// GET /api/posts/chat/conversations/[id] - Get conversation
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { chatService } from '../../../services/chat.service'
import { UserError } from '../../../types/user.types'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)

    const result = await chatService.getConversation(id, user.id)
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
