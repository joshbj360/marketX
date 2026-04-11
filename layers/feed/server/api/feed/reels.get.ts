// GET /api/feed/reels - Video posts + product videos
import { normalizePost, normalizeProduct } from '../../utils/feed.utils'
const MEDIA_SELECT = {
  id: true,
  url: true,
  type: true,
  isBgMusic: true,
  altText: true,
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 20, 50)
  const offset = Math.max(Number(query.offset) || 0, 0)

  // ─── 1. Video posts ────────────────────────────────────────────────────
  const [posts, postCount] = await Promise.all([
    prisma.post.findMany({
      where: {
        visibility: 'PUBLIC',
        media: { some: { type: 'VIDEO', isBgMusic: false } },
      },
      include: {
        author: {
          select: { id: true, username: true, avatar: true, role: true },
        },
        media: { select: MEDIA_SELECT },
        _count: { select: { likes: true, comments: true, shares: true } },
        taggedProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                discount: true,
                slug: true,
                media: {
                  take: 1,
                  where: { isBgMusic: false },
                  select: { url: true, type: true },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.post.count({
      where: {
        visibility: 'PUBLIC',
        media: { some: { type: 'VIDEO', isBgMusic: false } },
      },
    }),
  ])

  // ─── 2. Product videos (≈1 per 3 post reels) ──────────────────────────
  const productLimit = Math.max(1, Math.ceil(limit / 3))
  const productOffset = Math.floor(offset / 3)

  const [products, productCount] = await Promise.all([
    prisma.products.findMany({
      where: {
        status: 'PUBLISHED',
        media: { some: { type: 'VIDEO', isBgMusic: false } },
      },
      include: {
        seller: {
          select: {
            id: true,
            store_name: true,
            store_slug: true,
            store_logo: true,
          },
        },
        media: { select: MEDIA_SELECT },
        _count: { select: { likes: true, comments: true } },
        variants: {
          select: { id: true, size: true, stock: true, price: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: productLimit,
      skip: productOffset,
    }),
    prisma.products.count({
      where: {
        status: 'PUBLISHED',
        media: { some: { type: 'VIDEO', isBgMusic: false } },
      },
    }),
  ])

  // ─── 3. Interleave: 2 post reels → 1 product reel ──────────────────────
  const postReels = posts.map(normalizePost)
  const productReels = products.map(normalizeProduct)
  const mixed: any[] = []
  let pi = 0
  let pri = 0

  while (pi < postReels.length || pri < productReels.length) {
    if (pi < postReels.length) mixed.push(postReels[pi++])
    if (pi < postReels.length) mixed.push(postReels[pi++])
    if (pri < productReels.length) mixed.push(productReels[pri++])
  }

  const total = postCount + productCount

  return {
    success: true,
    data: mixed,
    meta: { total, limit, offset, hasMore: offset + limit < total },
  }
})
