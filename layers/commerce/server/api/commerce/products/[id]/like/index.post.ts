// POST /api/commerce/products/[id]/like
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = Number(getRouterParam(event, 'id'))
    if (!id) throw new UserError('INVALID_ID', 'Product ID is required', 400)

    await prisma.like.upsert({
      where: { userId_productId: { userId: user.id, productId: id } },
      create: { userId: user.id, productId: id },
      update: {},
    })

    const likeCount = await prisma.like.count({ where: { productId: id } })
    return { success: true, data: { liked: true, likeCount } }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    console.error('[POST /api/commerce/products/:id]/like]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
