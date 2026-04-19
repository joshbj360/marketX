// GET /api/seller/featured - Public list of sellers by follower count (paginated)

import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 6, 1), 50)
    const offset = Math.max(Number(query.offset) || 0, 0)
    const search = String(query.search || '').trim()
    const categorySlug = String(query.categorySlug || '').trim()
    const page = Math.floor(offset / limit)

    const where: Prisma.SellerProfileWhereInput = {
      is_active: true,
      ...(search
        ? {
            OR: [
              { store_name: { contains: search, mode: 'insensitive' } },
              { store_slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      // Filter to sellers who have at least one published product in this category
      ...(categorySlug
        ? {
            products: {
              some: {
                status: 'PUBLISHED',
                category: { some: { category: { slug: categorySlug } } },
              },
            },
          }
        : {}),
    }

    // Don't cache search or category-filtered results
    const cacheKey = (search || categorySlug) ? null : `feed:sellers:featured:page:${page}:limit:${limit}`

    const fetchFresh = async () => {
      const [sellers, total] = await Promise.all([
        prisma.sellerProfile.findMany({
          where,
          select: {
            id: true,
            store_name: true,
            store_slug: true,
            store_logo: true,
            store_banner: true,
            store_description: true,
            is_verified: true,
            followers_count: true,
            _count: { select: { products: true } },
          },
          orderBy: { followers_count: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.sellerProfile.count({ where }),
      ])

      // Compute real follow counts from the Follow table
      const sellerIds = sellers.map((s) => s.id)
      const followCounts = sellerIds.length
        ? await prisma.follow.groupBy({
            by: ['followingId'],
            where: { followingId: { in: sellerIds }, followingType: 'SELLER' },
            _count: { followerId: true },
          })
        : []

      const countMap = new Map(followCounts.map((f) => [f.followingId, f._count.followerId]))

      const sellersWithRealCounts = sellers.map((s) => {
        const realCount = countMap.get(s.id) ?? 0
        if (s.followers_count !== realCount) {
          prisma.sellerProfile
            .update({ where: { id: s.id }, data: { followers_count: realCount } })
            .catch(() => {})
        }
        return { ...s, followers_count: realCount }
      })

      return {
        success: true,
        data: sellersWithRealCounts,
        meta: {
          total,
          limit,
          offset,
          hasMore: offset + sellers.length < total,
        },
      }
    }

    if (!cacheKey) return fetchFresh()

    const result = await remember(cacheKey, 300, fetchFresh) // 5 min
    setHeader(
      event,
      'Cache-Control',
      'public, max-age=120, stale-while-revalidate=300',
    )
    return result
  } catch (error: unknown) {
    logger.error('[GET /api/seller/featured]', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch featured sellers' })
  }
})
