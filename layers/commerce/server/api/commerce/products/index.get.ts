// GET /api/commerce/products
import { productService } from '~~/layers/commerce/server/services/product.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { optionalAuth } from '~~/server/layers/shared/middleware/requireAuth'
export default defineEventHandler(async (event) => {
  try {
    await optionalAuth(event)
    const query = getQuery(event)
    const minDiscount = query.minDiscount ? Number(query.minDiscount) : undefined
    const minPrice    = query.minPrice    ? Number(query.minPrice)    : undefined
    const maxPrice    = query.maxPrice    ? Number(query.maxPrice)    : undefined
    const sortBy      = query.sortBy as 'newest' | 'price_asc' | 'price_desc' | 'popular' | undefined

    const result = await productService.getProducts(
      {
        status: query.status as string,
        search: query.search as string,
        sellerId: query.sellerId as string,
        isThrift: query.isThrift,
        categorySlug: query.categorySlug as string,
        minDiscount,
        minPrice,
        maxPrice,
        sortBy,
      },
      { limit: query.limit, offset: query.offset },
    )
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    logger.logError('[GET /api/commerce/products]', error, { requestId: event.context?.requestId })
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
