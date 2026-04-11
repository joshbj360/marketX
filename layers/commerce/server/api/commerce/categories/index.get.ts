// GET /api/commerce/categories
export default defineEventHandler(async (event) => {
  const categories = await remember(
    'data:categories',
    3600, // 1 hour — categories almost never change at runtime
    () =>
      prisma.category.findMany({
        select: { id: true, name: true, slug: true, thumbnailCatUrl: true },
        orderBy: { name: 'asc' },
      }),
  )
  // Browser can cache for 10 min; stale-while-revalidate refreshes silently in background
  setHeader(
    event,
    'Cache-Control',
    'public, max-age=600, stale-while-revalidate=3600',
  )
  return { success: true, data: categories }
})
