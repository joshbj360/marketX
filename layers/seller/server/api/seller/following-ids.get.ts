// GET /api/seller/following-ids
// Returns the DB IDs of all sellers the current user follows
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  const follows = await prisma.follow.findMany({
    where: { followerId: currentUser.id, followingType: 'SELLER' },
    select: { followingId: true },
  })

  return {
    success: true,
    data: follows.map((f: { followingId: string }) => f.followingId),
  }
})
