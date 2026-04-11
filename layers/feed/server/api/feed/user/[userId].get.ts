import { normalizePost } from '~~/layers/feed/server/utils/feed.utils'
import type { IFeedResponse } from '~~/layers/feed/app/types/feed.types'

export default defineEventHandler(async (event): Promise<IFeedResponse> => {
  const userId = getRouterParam(event, 'userId')
  const query = getQuery(event)
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    })
  }

  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
      include: {
        author: true,
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    })

    const items = posts.map(normalizePost)
    const total = await prisma.post.count({ where: { authorId: userId } })

    return {
      items,
      meta: { total, limit, offset, hasMore: items.length === limit },
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch user feed',
    })
  }
})
