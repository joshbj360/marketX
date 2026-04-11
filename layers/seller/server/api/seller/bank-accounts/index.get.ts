// GET /api/seller/bank-accounts — list all saved bank accounts for the seller
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const sellers = await prisma.sellerProfile.findMany({
      where: { profileId: user.id, is_active: true },
      select: { id: true },
    })
    if (!sellers.length) return { success: true, data: [] }

    const sellerIds = sellers.map((s) => s.id)
    const accounts = await prisma.bankAccount.findMany({
      where: { sellerId: { in: sellerIds } },
      orderBy: [{ isDefault: 'desc' }, { created_at: 'asc' }],
    })

    return { success: true, data: accounts }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Server error',
    })
  }
})
