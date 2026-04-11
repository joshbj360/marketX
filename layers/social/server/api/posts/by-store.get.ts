// GET /api/posts/by-store?storeSlug=xxx
// Returns public posts by the seller profile associated with the given store slug
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const storeSlug = query.storeSlug as string
  if (!storeSlug)
    throw createError({
      statusCode: 400,
      statusMessage: 'storeSlug is required',
    })

  const limit = Math.min(Number(query.limit) || 12, 50)
  const offset = Number(query.offset) || 0

  // Resolve store slug → profile ID
  const seller = await prisma.sellerProfile.findUnique({
    where: { store_slug: storeSlug },
    select: { profileId: true },
  })
  if (!seller)
    return { success: true, data: [], meta: { total: 0, hasMore: false } }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: seller.profileId, visibility: 'PUBLIC' },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        caption: true,
        content: true,
        contentType: true,
        created_at: true,
        author: { select: { id: true, username: true, avatar: true } },
        media: {
          where: { isBgMusic: false },
          select: { id: true, url: true, type: true },
          orderBy: { created_at: 'asc' },
        },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count({
      where: { authorId: seller.profileId, visibility: 'PUBLIC' },
    }),
  ])

  // Map media array to mediaItems for consistency
  const normalized = posts.map((p) => ({
    ...p,
    mediaItems: p.media,
  }))

  return {
    success: true,
    data: normalized,
    meta: { total, limit, offset, hasMore: offset + limit < total },
  }
})
