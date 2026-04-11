export default defineEventHandler(async () => {
  return remember('feed:trending', 300, async () => {
    const [trendingProducts, trendingTags, featuredSellers] = await Promise.all(
      [
        prisma.products.findMany({
          where: { status: 'PUBLISHED' },
          include: {
            seller: {
              select: {
                store_name: true,
                store_slug: true,
                default_currency: true,
              },
            },
            media: {
              where: { isBgMusic: false },
              take: 1,
              select: { id: true, url: true, type: true, isBgMusic: true },
              orderBy: { created_at: 'asc' },
            },
            variants: {
              select: { id: true, stock: true, price: true, size: true },
            },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { likes: { _count: 'desc' } },
          take: 10,
        }),

        prisma.tag.findMany({
          where: { products: { some: {} } },
          select: {
            id: true,
            name: true,
            _count: { select: { products: true } },
          },
          orderBy: { products: { _count: 'desc' } },
          take: 20,
        }),

        prisma.sellerProfile.findMany({
          where: { is_active: true },
          select: {
            id: true,
            store_name: true,
            store_slug: true,
            store_logo: true,
            store_banner: true,
            is_verified: true,
            followers_count: true,
            _count: { select: { products: true } },
          },
          orderBy: { followers_count: 'desc' },
          take: 6,
        }),
      ],
    )

    return {
      success: true,
      data: { trendingProducts, trendingTags, featuredSellers },
    }
  })
})
