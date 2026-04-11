import { normalizePost } from '~~/layers/feed/server/utils/feed.utils'
import type { IFeedResponse } from '~~/layers/feed/app/types/feed.types'
import { remember } from '~~/server/utils/cache'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event): Promise<IFeedResponse> => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0
  const page = Math.floor(offset / limit)

  // Per-user cache key — busted only when this user creates content
  const cacheKey = `feed:following:user:${user.id}:page:${page}`

  try {
    return await remember(cacheKey, 120, async () => {
      const follows = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      })

      if (follows.length === 0) {
        return { items: [], meta: { total: 0, limit, offset, hasMore: false } }
      }

      const followingIds = follows.map((f) => f.followingId)

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { authorId: { in: followingIds } },
          take: limit,
          skip: offset,
          orderBy: { created_at: 'desc' },
          include: {
            author: true,
            media: true,
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
        prisma.post.count({ where: { authorId: { in: followingIds } } }),
      ])

      return {
        items: posts.map(normalizePost),
        meta: { total, limit, offset, hasMore: posts.length === limit },
      }
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch following feed',
    })
  }
})
