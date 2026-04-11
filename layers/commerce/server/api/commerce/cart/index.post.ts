// POST /api/commerce/cart - Add item to cart

import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { cartService } from '../../../services/cart.service'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    const { variantId, quantity = 1 } = body
    if (!variantId)
      throw new UserError('INVALID_INPUT', 'variantId is required', 400)
    const result = await cartService.addToCart(
      user.id,
      Number(variantId),
      Number(quantity),
    )
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
