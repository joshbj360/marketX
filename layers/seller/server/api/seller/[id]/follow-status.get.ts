// GET /api/seller/:id/follow-status  (id = store slug)
// Returns whether the current user follows this seller
import { socialService } from '~~/layers/profile/server/services/social.service'
import { optionalAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  const storeSlug = getRouterParam(event, 'id')
  if (!storeSlug) {
    throw createError({ statusCode: 400, message: 'Store slug is required' })
  }

  const currentUser = await optionalAuth(event)
  if (!currentUser) {
    return { success: true, data: { isFollowing: false } }
  }

  try {
    const status = await socialService.getFollowStatus(
      currentUser.id,
      storeSlug,
      'SELLER',
    )
    return { success: true, data: status }
  } catch {
    return { success: true, data: { isFollowing: false } }
  }
})
