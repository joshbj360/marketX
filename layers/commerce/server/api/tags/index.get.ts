export default defineEventHandler(async (event) => {
  // Tags list changes slowly — cache for 5 minutes
  const query = getQuery(event)
  if (!query.search) {
    setHeader(
      event,
      'Cache-Control',
      'public, max-age=300, s-maxage=300, stale-while-revalidate=120',
    )
  }
  const limit = Math.min(Number(query.limit) || 50, 100)
  const search = String(query.search || '').trim()

  const where: unknown = {}
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  // Only return tags used on at least one product OR one post
  where.OR = [{ products: { some: {} } }, { posts: { some: {} } }]

  const tags = await prisma.tag.findMany({
    where,
    select: {
      id: true,
      name: true,
      _count: { select: { products: true, posts: true } },
    },
    orderBy: { products: { _count: 'desc' } },
    take: limit,
  })

  return { success: true, data: tags }
})
