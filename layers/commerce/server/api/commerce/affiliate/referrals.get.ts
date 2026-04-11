// GET /api/commerce/affiliate/referrals
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    await requireAuth(event)
    // Return empty referrals pending full affiliate model migration
    return {
      success: true,
      data: {
        referrals: [],
        total: 0,
        limit: 20,
        offset: 0,
      },
    }
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
