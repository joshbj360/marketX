// GET /api/commerce/cart

import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { cartService } from '../../../services/cart.service'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const result = await cartService.getCart(user.id)
    return { success: true, data: result }
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
