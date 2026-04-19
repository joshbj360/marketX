// DELETE /api/commerce/products/:id (soft delete - archives)

import { productService } from '~~/layers/commerce/server/services/product.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = parseInt(getRouterParam(event, 'id') || '')
    if (isNaN(id))
      throw new UserError(
        'INVALID_ID',
        'Product ID must be a valid number',
        400,
      )
    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    const sellerProfile = user.sellerProfile
    if (!sellerProfile)
      throw new UserError(
        'SELLER_REQUIRED',
        'A seller profile is required',
        403,
      )

    const result = await productService.archiveProduct(
      id,
      user.id,
      ipAddress,
      userAgent,
    )
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    logger.error('[DELETE /api/commerce/products/:id]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
