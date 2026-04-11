// GET /api/posts/chat/conversations/[id]/messages - Get messages
import { chatService } from '~~/layers/profile/server/services/chat.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'


export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)

    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await chatService.getConversationMessages(
      id,
      user.id,
      limit,
      offset,
    )
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
