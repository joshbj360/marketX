// GET /api/profile/media
// Returns paginated media uploaded by the authenticated user (own library only).

import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 30, 100)
  const offset = Number(query.offset) || 0
  const typeFilter = query.type as string | undefined // 'IMAGE' | 'VIDEO' | 'AUDIO' | undefined

  const where: any = {
    authorId: user.id,
    isBgMusic: false,
  }
  if (typeFilter && ['IMAGE', 'VIDEO', 'AUDIO'].includes(typeFilter)) {
    where.type = typeFilter
  }

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        url: true,
        public_id: true,
        type: true,
        created_at: true,
        postId: true,
        productId: true,
        altText: true,
      },
    }),
    prisma.media.count({ where }),
  ])

  return {
    success: true,
    data: items,
    meta: { total, limit, offset, hasMore: offset + items.length < total },
  }
})
