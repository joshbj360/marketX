import {
  normalizePost,
  normalizeProduct,
} from '~~/layers/feed/server/utils/feed.utils'
import type { IFeedResponse } from '~~/layers/feed/app/types/feed.types'
import { remember, consumeCreatorBypass } from '~~/server/utils/cache'

export default defineEventHandler(async (event): Promise<IFeedResponse> => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0
  const userId = event.context.user?.id
  const page = Math.floor(offset / limit)
  const cacheKey = `feed:discover:page:${page}:limit:${limit}`

  // Creator bypass — skip cache for 30s after they publish content
  const bypass = userId ? await consumeCreatorBypass(userId) : false

  try {
    const result = await remember(cacheKey, bypass ? 0 : 120, async () => {
      const [posts, products] = await Promise.all([
        prisma.post.findMany({
          take: Math.ceil(limit / 2),
          skip: offset,
          orderBy: { likes: { _count: 'desc' } },
          include: {
            author: {
              select: { id: true, username: true, avatar: true, role: true },
            },
            media: {
              where: { isBgMusic: false },
              select: {
                id: true,
                url: true,
                type: true,
                isBgMusic: true,
                altText: true,
              },
              take: 1,
              orderBy: { created_at: 'asc' as const },
            },
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
        }),
        prisma.products.findMany({
          take: Math.ceil(limit / 2),
          skip: offset,
          where: { status: 'PUBLISHED' },
          orderBy: { soldCount: 'desc' },
          include: {
            seller: {
              select: {
                store_slug: true,
                store_logo: true,
                store_name: true,
                default_currency: true,
              },
            },
            media: {
              where: { isBgMusic: false },
              select: { id: true, url: true, type: true, isBgMusic: true },
              take: 1,
              orderBy: { created_at: 'asc' as const },
            },
            variants: {
              select: { id: true, size: true, stock: true, price: true },
              take: 1,
              orderBy: { price: 'asc' as const },
            },
            _count: { select: { likes: true, comments: true, shares: true } },
          },
        }),
      ])

      const items = [
        ...posts.map(normalizePost),
        ...products.map(normalizeProduct),
      ]
        .sort(
          (a, b) =>
            b.likeCount + b.commentCount - (a.likeCount + a.commentCount),
        )
        .slice(0, limit)

      const [postsCount, productsCount] = await Promise.all([
        prisma.post.count(),
        prisma.products.count({ where: { status: 'PUBLISHED' } }),
      ])

      return {
        items,
        meta: {
          total: postsCount + productsCount,
          limit,
          offset,
          hasMore: items.length === limit,
        },
      }
    })

    if (!bypass) {
      setHeader(
        event,
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=120',
      )
    }

    return result
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch discover feed',
    })
  }
})
