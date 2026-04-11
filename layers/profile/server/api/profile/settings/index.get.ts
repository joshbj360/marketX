// GET /api/profile/settings — return current user's settings (upserts defaults on first call)
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { prisma } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const settings = await prisma.userSettings.upsert({
    where: { user_id: user.id },
    create: { user_id: user.id },
    update: {},
  })

  return { success: true, data: settings }
})
