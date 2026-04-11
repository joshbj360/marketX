// POST /api/seller/:id/follow  (id = store slug)
import { socialService } from '~~/layers/profile/server/services/social.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const storeSlug = getRouterParam(event, 'id')

    if (!storeSlug) {
      throw createError({ statusCode: 400, message: 'Store slug is required' })
    }

    const currentUser = await requireAuth(event)

    const ipAddress = getRequestIP(event) || 'unknown'
    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

    const result = await socialService.followSeller(
      currentUser.id,
      storeSlug,
      ipAddress,
      userAgent,
    )

    return {
      success: true,
      message: 'Store followed successfully',
      data: result,
    }
  } catch (error: unknown) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to follow store',
    })
  }
})
