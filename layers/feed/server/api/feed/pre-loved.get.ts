import { defineEventHandler, getQuery } from 'h3'

/**
 * GET /api/feed/pre-loved
 * Thrift/pre-loved products, optionally filtered by condition.
 * condition: NEW_WITH_TAGS | LIKE_NEW | GOOD | FAIR | POOR
 */
export default defineEventHandler(async (event) => {
  const { limit = 20, offset = 0, condition } = getQuery(event) as Record<string, any>
  const take = Math.min(Number(limit) || 20, 50)
  const skip = Number(offset) || 0

  const where: any = {
    status: 'PUBLISHED',
    isThrift: true,
  }
  if (condition) where.condition = condition

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        discount: true,
        isThrift: true,
        condition: true,
        created_at: true,
        store_slug: true,
        sellerId: true,
        seller: {
          select: {
            store_name: true,
            store_slug: true,
            store_logo: true,
            locationLabel: true,
          },
        },
        media: {
          where: { isBgMusic: false },
          select: { id: true, url: true, type: true },
          take: 1,
          orderBy: { created_at: 'asc' },
        },
        _count: { select: { likes: true } },
      },
    }),
    prisma.products.count({ where }),
  ])

  return {
    success: true,
    data: products,
    meta: {
      total,
      limit: take,
      offset: skip,
      hasMore: skip + take < total,
    },
  }
})
