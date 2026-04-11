// GET /api/commerce/wallet/transactions
// Returns transactions across ALL seller profiles owned by the user, sorted newest first.
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'


export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Number(query.limit) || 20, 100)
    const offset = Number(query.offset) || 0

    // Get all active seller profiles for this user
    const sellerProfiles = await prisma.sellerProfile.findMany({
      where: { profileId: user.id, is_active: true },
      select: { id: true },
    })

    if (!sellerProfiles.length) {
      return { success: true, data: { transactions: [], total: 0 } }
    }

    const sellerIds = sellerProfiles.map((s) => s.id)

    // Get wallet IDs for all stores
    const wallets = await prisma.sellerWallet.findMany({
      where: { sellerId: { in: sellerIds } },
      select: { id: true },
    })

    if (!wallets.length) {
      return { success: true, data: { transactions: [], total: 0 } }
    }

    const walletIds = wallets.map((w) => w.id)

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId: { in: walletIds } },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where: { walletId: { in: walletIds } } }),
    ])

    return { success: true, data: { transactions, total } }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error',
    })
  }
})
