// POST /api/posts/chat/conversations/[id]/messages - Send message
import { chatService } from '~~/layers/profile/server/services/chat.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)

    const body = await readBody(event)

    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // chatService.sendMessage handles DB write + Soketi real-time push
    const result = await chatService.sendMessage(
      id,
      user.id,
      body.text,
      body.type,
      ipAddress,
      userAgent,
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
