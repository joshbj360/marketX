// POST /api/seller/ping — updates lastActiveAt, called on seller dashboard mount

import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  await prisma.sellerProfile.updateMany({
    where: { profileId: user.id, is_active: true },
    data: { lastActiveAt: new Date() },
  })

  // Invalidate the map cache so the online status is visible immediately
  await bust('map:all-geo-sellers')

  return { success: true }
})
