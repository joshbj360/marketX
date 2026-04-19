// GET /api/map/squares — returns all ACTIVE GEOGRAPHIC squares with coordinates
import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  const squares = await prisma.square.findMany({
    where: {
      status: 'ACTIVE',
      type: 'GEOGRAPHIC',
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      iconUrl: true,
      accentColor: true,
      latitude: true,
      longitude: true,
      city: true,
      state: true,
      memberCount: true,
      followerCount: true,
      type: true,
    },
    orderBy: { memberCount: 'desc' },
  })

  return {
    success: true,
    data: squares.filter((s) => s.latitude !== null && s.longitude !== null),
  }
})
