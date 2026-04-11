// GET /api/seller/[id]/messages?limit=20&offset=0
// Returns all conversations for a specific store (seller inbox)

import { chatService } from '~~/layers/profile/server/services/chat.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { prisma } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const sellerId = getRouterParam(event, 'id')
    if (!sellerId) throw new UserError('INVALID_ID', 'Seller ID required', 400)

    // Verify the requesting user owns this store
    const store = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      select: { profileId: true },
    })
    if (!store) throw new UserError('NOT_FOUND', 'Store not found', 404)
    if (store.profileId !== user.id)
      throw new UserError('FORBIDDEN', 'Access denied', 403)

    const query = getQuery(event)
    const limit = Math.min(Number(query.limit) || 20, 50)
    const offset = Number(query.offset) || 0

    const result = await chatService.getStoreConversations(
      sellerId,
      limit,
      offset,
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
