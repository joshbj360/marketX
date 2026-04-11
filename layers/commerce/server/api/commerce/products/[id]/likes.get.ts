// GET /api/commerce/products/[id]/likes — users who liked this product
import { UserError } from '~~/layers/profile/server/types/user.types'
export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') || '')
    if (isNaN(id)) throw new UserError('INVALID_ID', 'Invalid product ID', 400)

    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { productId: id },
        select: {
          created_at: true,
          profile: { select: { id: true, username: true, avatar: true } },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.like.count({ where: { productId: id } }),
    ])

    return {
      success: true,
      data: { likes, total, limit, offset, hasMore: offset + likes.length < total },
    }
  } catch (error: unknown) {
    if (error instanceof UserError)
      throw createError({ statusCode: error.status, statusMessage: error.message })
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
