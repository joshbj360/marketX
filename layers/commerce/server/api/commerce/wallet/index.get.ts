// GET /api/commerce/wallet

import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { walletService } from '../../../services/wallet.service'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    // Get ALL seller profiles for this user (not just first)
    const sellerProfiles = await prisma.sellerProfile.findMany({
      where: { profileId: user.id, is_active: true },
      select: { id: true, store_name: true, store_slug: true },
    })

    if (!sellerProfiles.length) {
      // Non-seller: return empty wallet state
      return {
        success: true,
        data: {
          wallet: { balance: 0, pending_balance: 0 },
          stats: { totalEarned: 0, totalSpent: 0 },
          stores: [],
        },
      }
    }

    // Fetch wallet + stats per store in parallel
    const storeWallets = await Promise.all(
      sellerProfiles.map(async (sp) => {
        const { wallet, stats } = await walletService.getWallet(sp.id)
        return {
          storeId: sp.id,
          storeName: sp.store_name,
          storeSlug: sp.store_slug,
          wallet,
          stats,
        }
      }),
    )

    // Aggregate totals across all stores
    const totalBalance = storeWallets.reduce(
      (sum, s) => sum + (s.wallet?.balance ?? 0),
      0,
    )
    const totalPending = storeWallets.reduce(
      (sum, s) => sum + (s.wallet?.pending_balance ?? 0),
      0,
    )
    const totalEarned = storeWallets.reduce(
      (sum, s) => sum + (s.stats?.totalEarned ?? 0),
      0,
    )
    const totalSpent = storeWallets.reduce(
      (sum, s) => sum + (s.stats?.totalSpent ?? 0),
      0,
    )

    return {
      success: true,
      data: {
        wallet: { balance: totalBalance, pending_balance: totalPending },
        stats: { totalEarned, totalSpent },
        stores: storeWallets,
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
