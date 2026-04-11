// GET /api/commerce/products/[id]/comments
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })

  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { productId: id, parentId: null },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, replies: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.comment.count({ where: { productId: id, parentId: null } }),
  ])

  return {
    success: true,
    data: comments,
    meta: { total, limit, offset, hasMore: offset + comments.length < total },
  }
})
