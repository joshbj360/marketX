// GET /api/feed/shop-today
// Returns a curated mix: active deals first, then fresh drops (last 7 days),
// then latest published products — used for the "Shop Today" home banner.
const MEDIA_SELECT = {
  id: true,
  url: true,
  type: true,
  isBgMusic: true,
  altText: true,
}

const PRODUCT_SELECT = {
  id: true,
  title: true,
  price: true,
  discount: true,
  slug: true,
  isDeal: true,
  dealEndsAt: true,
  isThrift: true,
  created_at: true,
  sellerId: true,
  media: { where: { isBgMusic: false }, select: MEDIA_SELECT, take: 1 },
  seller: { select: { store_name: true, store_slug: true, store_logo: true } },
  variants: { select: { id: true, stock: true, price: true }, take: 1 },
  _count: { select: { likes: true } },
}

export default defineEventHandler(async () => {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const limit = 20

  const [deals, freshDrops, latest] = await Promise.all([
    // Active deals (limited to 6)
    prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
        isDeal: true,
        OR: [{ dealEndsAt: null }, { dealEndsAt: { gte: now } }],
      },
      select: PRODUCT_SELECT,
      orderBy: { created_at: 'desc' },
      take: 6,
    }),
    // Fresh drops last 7 days (limited to 8)
    prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
        created_at: { gte: sevenDaysAgo },
        isDeal: false,
      },
      select: PRODUCT_SELECT,
      orderBy: { created_at: 'desc' },
      take: 8,
    }),
    // Latest published (fill remainder)
    prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
        isDeal: false,
        created_at: { lt: sevenDaysAgo },
      },
      select: PRODUCT_SELECT,
      orderBy: { created_at: 'desc' },
      take: 8,
    }),
  ])

  // Merge + deduplicate by id, keep original order (deals first)
  const seen = new Set<number>()
  const merged: typeof deals = []
  for (const p of [...deals, ...freshDrops, ...latest]) {
    if (!seen.has(p.id)) {
      seen.add(p.id)
      merged.push(p)
    }
    if (merged.length >= limit) break
  }

  return { success: true, data: merged }
})
