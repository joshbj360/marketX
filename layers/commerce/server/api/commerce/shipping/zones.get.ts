// GET /api/commerce/shipping/zones — public list of active global shipping zones

export default defineEventHandler(async () => {
  const zones = await prisma.globalShippingZone.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return { success: true, data: zones }
})
