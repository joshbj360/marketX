// GET /api/commerce/products/by-slug/:slug
import { productService } from '~~/layers/commerce/server/services/product.service'
import { UserError } from '~~/layers/profile/server/types/user.types'


export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug') || ''
    if (!slug) throw new UserError('INVALID_SLUG', 'Slug is required', 400)

    const product = await productService.getProductBySlug(slug)
    return { success: true, data: product }
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
