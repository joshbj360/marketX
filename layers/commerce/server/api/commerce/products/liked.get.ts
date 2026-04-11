// GET /api/commerce/products/liked
// Returns products liked by the authenticated user
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'


export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 24, 50)
  const offset = Number(query.offset) || 0

  const [likes, total] = await Promise.all([
    prisma.like.findMany({
      where: { userId: user.id },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
      select: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            affiliateCommission: true,
            seller: {
              select: {
                store_slug: true,
                store_name: true,
                store_logo: true,
                default_currency: true,
              },
            },
            media: {
              select: { id: true, url: true, type: true },
              where: { isBgMusic: false },
              take: 1,
              orderBy: { created_at: 'asc' },
            },
            variants: {
              select: { id: true, size: true, price: true, stock: true },
              take: 1,
            },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    }),
    prisma.like.count({ where: { userId: user.id } }),
  ])

  const products = likes.map((l) => l.product).filter(Boolean)

  return {
    success: true,
    data: products,
    meta: { total, limit, offset, hasMore: offset + limit < total },
  }
})
