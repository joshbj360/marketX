// GET /api/user/addresses — list all saved addresses for current user
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { prisma } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const addresses = await prisma.addresses.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { created_at: 'asc' }],
  })
  return { success: true, data: addresses }
})
