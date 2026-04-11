import { defineEventHandler, getQuery } from 'h3'
/**
 * GET /api/feed/deals
 * Active flash deals — products with isDeal=true and dealEndsAt in the future
 * (or dealEndsAt null = evergreen deal).
 */
export default defineEventHandler(async (event) => {
  const { limit = 20, offset = 0 } = getQuery(event) as Record<string, unknown>
  const take = Math.min(Number(limit) || 20, 50)
  const skip = Number(offset) || 0
  const now = new Date()

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
        isDeal: true,
        OR: [{ dealEndsAt: null }, { dealEndsAt: { gte: now } }],
      },
      orderBy: [
        { dealEndsAt: { sort: 'asc', nulls: 'last' } },
        { created_at: 'desc' },
      ],
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
    prisma.products.count({
      where: {
        status: 'PUBLISHED',
        isDeal: true,
        OR: [{ dealEndsAt: null }, { dealEndsAt: { gte: now } }],
      },
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
