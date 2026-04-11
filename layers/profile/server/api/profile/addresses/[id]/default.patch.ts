// PATCH /api/user/addresses/:id/default — set an address as the default
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { prisma } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Invalid address ID' })

  const existing = await prisma.addresses.findFirst({
    where: { id, userId: user.id },
  })
  if (!existing)
    throw createError({ statusCode: 404, statusMessage: 'Address not found' })

  await prisma.addresses.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  })
  await prisma.addresses.update({ where: { id }, data: { isDefault: true } })

  return { success: true }
})
