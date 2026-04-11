export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Invalid tag ID' })

  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 20, 50)
  const offset = Number(query.offset) || 0

  const tag = await prisma.tag.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!tag)
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where: { status: 'PUBLISHED', tags: { some: { tagId: id } } },
      include: {
        seller: {
          select: {
            store_name: true,
            store_slug: true,
            default_currency: true,
          },
        },
        media: {
          where: { isBgMusic: false },
          take: 1,
          select: { url: true, type: true },
        },
        variants: {
          select: { id: true, stock: true, price: true, size: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    }),
    prisma.products.count({
      where: { status: 'PUBLISHED', tags: { some: { tagId: id } } },
    }),
  ])

  return { success: true, data: { tag, products, total } }
})
