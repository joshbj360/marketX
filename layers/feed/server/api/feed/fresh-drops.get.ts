import { defineEventHandler, getQuery } from 'h3'
/**
 * GET /api/feed/fresh-drops
 * Products created in the last 7 days, PUBLISHED, ordered newest first.
 * Optionally filtered by stores the user follows (if authenticated).
 */
export default defineEventHandler(async (event) => {
  const { limit = 20, offset = 0 } = getQuery(event) as Record<string, unknown>
  const take = Math.min(Number(limit) || 20, 50)
  const skip = Number(offset) || 0

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
        created_at: { gte: sevenDaysAgo },
      },
      orderBy: { created_at: 'desc' },
      take,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        discount: true,
        isDeal: true,
        dealEndsAt: true,
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
            city: true,
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
    prisma.products.count({
      where: { status: 'PUBLISHED', created_at: { gte: sevenDaysAgo } },
    }),
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
