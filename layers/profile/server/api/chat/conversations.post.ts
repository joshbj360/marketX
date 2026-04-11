// POST /api/user/conversations - Create conversation

import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { chatService } from '../../services/chat.service'
import { UserError } from '../../types/user.types'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)

    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // storeId  → buyer messaging a store
    // targetId → user messaging another user
    const result = body.storeId
      ? await chatService.createStoreConversation(
          user.id,
          body.storeId,
          body.productId,
          ipAddress,
          userAgent,
        )
      : await chatService.createConversation(
          user.id,
          body.targetId,
          body.productId,
          ipAddress,
          userAgent,
        )
    return { success: true, data: result }
  } catch (error: unknown) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
