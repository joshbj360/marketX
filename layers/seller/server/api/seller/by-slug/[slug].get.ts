// GET /api/seller/by-slug/:slug

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'slug required' })

  const seller = await prisma.sellerProfile.findUnique({
    where: { store_slug: slug },
    select: {
      id: true,
      store_name: true,
      store_slug: true,
      isPremium: true,
      is_verified: true,
    },
  })

  if (!seller)
    throw createError({ statusCode: 404, statusMessage: 'Store not found' })

  return { success: true, data: seller }
})
