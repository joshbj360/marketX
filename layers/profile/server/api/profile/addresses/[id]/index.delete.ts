// DELETE /api/user/addresses/:id
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

  await prisma.addresses.delete({ where: { id } })

  // If deleted address was default, promote the next one
  if (existing.isDefault) {
    const next = await prisma.addresses.findFirst({
      where: { userId: user.id },
      orderBy: { created_at: 'asc' },
    })
    if (next)
      await prisma.addresses.update({
        where: { id: next.id },
        data: { isDefault: true },
      })
  }

  return { success: true }
})
