// GET /api/feed/squares/:slug — posts and products from sellers in this Square
import { z, ZodError } from 'zod'
import { normalizePost, normalizeProduct } from '~~/layers/feed/server/utils/feed.utils'
import { remember } from '~~/server/utils/cache'

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  type: z.enum(['all', 'posts', 'products']).default('all').optional(),
})

const PRODUCT_SELECT = {
  id: true,
  title: true,
  price: true,
  discount: true,
  slug: true,
  description: true,
  isThrift: true,
  isDeal: true,
  dealEndsAt: true,
  created_at: true,
  sellerId: true,
  affiliateCommission: true,
  viewCount: true,
  media: {
    where: { isBgMusic: false },
    select: { id: true, url: true, type: true, isBgMusic: true, altText: true },
    take: 4,
  },
  seller: {
    select: { id: true, store_name: true, store_slug: true, store_logo: true },
  },
  variants: {
    select: { id: true, size: true, stock: true, price: true },
    take: 5,
  },
  _count: { select: { likes: true, comments: true } },
} as const

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

    const query = await getValidatedQuery(event, (d) => querySchema.parse(d))
    const { limit, offset, type } = query

    // Resolve the Square
    const square = await prisma.square.findUnique({
      where: { slug, status: 'ACTIVE' },
      select: { id: true, name: true, slug: true },
    })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    const cacheKey = `feed:square:${slug}:offset:${offset}:limit:${limit}:type:${type}`

    const feed = await remember(cacheKey, 90, async () => {
      const productSlots = type === 'posts' ? 0 : Math.floor(limit / 4)
      const postLimit = type === 'products' ? 0 : limit - productSlots
      const productOffset = Math.floor(offset / 4)

      const [posts, postTotal, products] = await Promise.all([
        postLimit > 0
          ? prisma.post.findMany({
              where: { squareId: square.id },
              select: {
                id: true,
                authorId: true,
                caption: true,
                content: true,
                contentType: true,
                created_at: true,
                visibility: true,
                isProductPost: true,
                viewCount: true,
                author: { select: { id: true, username: true, avatar: true, role: true } },
                media: {
                  select: { id: true, url: true, type: true, isBgMusic: true, altText: true,
                    musicTitle: true, musicArtist: true },
                },
                taggedProducts: {
                  select: {
                    product: {
                      select: { id: true, title: true, price: true, slug: true,
                        media: { take: 1, select: { url: true, type: true } } },
                    },
                  },
                },
                _count: { select: { likes: true, comments: true, shares: true } },
              },
              orderBy: { created_at: 'desc' },
              take: postLimit,
              skip: offset,
            })
          : [],
        prisma.post.count({ where: { squareId: square.id } }),
        productSlots > 0
          ? prisma.products.findMany({
              where: {
                squareId: square.id,
                status: 'PUBLISHED',
                showInFeed: true,
              },
              select: PRODUCT_SELECT,
              orderBy: { created_at: 'desc' },
              take: productSlots,
              skip: productOffset,
            })
          : [],
      ])

      const postItems = posts.map(normalizePost)
      const productItems = products.map((p: any) => normalizeProduct(p))

      // Interleave 1 product per 4 posts
      const items: typeof postItems = []
      let pi = 0
      let pri = 0
      while (pi < postItems.length) {
        for (let i = 0; i < 4 && pi < postItems.length; i++) {
          items.push(postItems[pi++])
        }
        if (pri < productItems.length) items.push(productItems[pri++])
      }
      // Append remaining products if products-only mode
      while (pri < productItems.length) items.push(productItems[pri++])

      return {
        items,
        square: { id: square.id, name: square.name, slug: square.slug },
        meta: {
          total: postTotal,
          limit,
          offset,
          nextOffset: offset + postLimit,
          hasMore: offset + postLimit < postTotal,
        },
      }
    })

    setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=90')
    return { success: true, data: feed }
  } catch (e) {
    if (e instanceof ZodError)
      throw createError({ statusCode: 400, statusMessage: 'Invalid query', data: e.errors })
    throw e
  }
})
