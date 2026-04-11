import { defineEventHandler, getRouterParam, getQuery } from 'h3'

/**
 * GET /api/products/:id/reviews?limit=10&offset=0
 */
export default defineEventHandler(async (event) => {
  const productId = parseInt(getRouterParam(event, 'id') || '0')
  const { limit = 10, offset = 0 } = getQuery(event) as Record<string, any>
  const take = Math.min(Number(limit) || 10, 50)
  const skip = Number(offset) || 0

  const [reviews, total, avg] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { created_at: 'desc' },
      take,
      skip,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        verified: true,
        created_at: true,
        author: { select: { username: true, avatar: true } },
      },
    }),
    prisma.review.count({ where: { productId } }),
    prisma.review.aggregate({ where: { productId }, _avg: { rating: true } }),
  ])

  return {
    success: true,
    data: reviews,
    meta: {
      total,
      averageRating: avg._avg.rating,
      limit: take,
      offset: skip,
      hasMore: skip + take < total,
    },
  }
})
