// GET /api/commerce/wallet/store/[storeSlug]
// Returns wallet balance for a specific seller store owned by the authenticated user.

import { walletService } from '~~/layers/commerce/server/services/wallet.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const storeSlug = getRouterParam(event, 'storeSlug')
    if (!storeSlug) throw new UserError('INVALID', 'Store slug required', 400)

    const seller = await prisma.sellerProfile.findFirst({
      where: { store_slug: storeSlug, profileId: user.id },
      select: { id: true, store_name: true, store_slug: true },
    })

    if (!seller)
      throw new UserError('NOT_FOUND', 'Store not found or access denied', 404)

    const { wallet, stats } = await walletService.getWallet(seller.id)

    return {
      success: true,
      data: {
        storeId: seller.id,
        storeName: seller.store_name,
        storeSlug: seller.store_slug,
        balance: wallet?.balance ?? 0,
        pendingBalance: wallet?.pending_balance ?? 0,
        totalEarned: stats?.totalEarned ?? 0,
        totalSpent: stats?.totalSpent ?? 0,
      },
    }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
