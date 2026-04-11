// GET /api/commerce/wallet/payout-preview?amount=<kobo>
// Returns a fee breakdown for the requested payout amount.
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    await requireAuth(event)
    const query = getQuery(event)
    const amount = parseInt(String(query.amount ?? '0'))
    if (isNaN(amount) || amount <= 0)
      throw new UserError(
        'INVALID',
        'amount must be a positive integer (kobo)',
        400,
      )

    return { success: true, data: calculatePayout(amount) }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Server error',
    })
  }
})
