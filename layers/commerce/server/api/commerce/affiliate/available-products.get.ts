// GET /api/commerce/affiliate/available-products
// Returns products from OTHER sellers that have affiliate commission set — products the user can promote
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 20, 50)
  const offset = Number(query.offset) || 0

  // Optionally exclude the user's own products when authenticated
  let mySellerIdSet: string[] = []
  const authHeader = getHeader(event, 'authorization')
  if (authHeader) {
    try {
      const { requireAuth } = await import(
        '~~/server/layers/shared/middleware/requireAuth'
      )
      const user = await requireAuth(event)
      const mySellerIds = await prisma.sellerProfile.findMany({
        where: { profileId: user.id, is_active: true },
        select: { id: true },
      })
      mySellerIdSet = mySellerIds.map((s) => s.id)
    } catch {
      // unauthenticated — show all affiliate products
    }
  }

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: {
        affiliateCommission: { not: null, gt: 0 },
        status: 'PUBLISHED',
        ...(mySellerIdSet.length ? { sellerId: { notIn: mySellerIdSet } } : {}),
      },
      orderBy: { affiliateCommission: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
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
          select: { url: true },
          where: { isBgMusic: false },
          take: 1,
          orderBy: { created_at: 'asc' },
        },
        variants: {
          select: { price: true },
          take: 1,
          orderBy: { id: 'asc' },
        },
        _count: { select: { likes: true } },
      },
    }),
    prisma.products.count({
      where: {
        affiliateCommission: { not: null, gt: 0 },
        status: 'PUBLISHED',
        ...(mySellerIdSet.length ? { sellerId: { notIn: mySellerIdSet } } : {}),
      },
    }),
  ])

  return {
    success: true,
    data: products,
    meta: { total, limit, offset, hasMore: offset + limit < total },
  }
})
