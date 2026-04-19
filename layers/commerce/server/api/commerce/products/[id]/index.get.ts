// GET /api/commerce/products/:id
import { productService } from '~~/layers/commerce/server/services/product.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { optionalAuth } from '~~/server/layers/shared/middleware/requireAuth'


export default defineEventHandler(async (event) => {
  try {
    await optionalAuth(event)
    const id = parseInt(getRouterParam(event, 'id') || '')
    if (isNaN(id))
      throw new UserError(
        'INVALID_ID',
        'Product ID must be a valid number',
        400,
      )
    const product = await productService.getProductById(id)
    return { success: true, data: product }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    logger.error('[GET /api/commerce/products/:id]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
