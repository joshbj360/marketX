// POST /api/commerce/wallet/withdraw

import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { walletService } from '../../../services/wallet.service'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    const { amount, bankAccount } = body

    if (!amount || isNaN(Number(amount)))
      throw new UserError('INVALID_INPUT', 'amount is required', 400)
    if (!bankAccount)
      throw new UserError(
        'INVALID_INPUT',
        'bankAccount details are required',
        400,
      )

    // Resolve which seller's wallet to withdraw from via the bank account record
    let sellerId: string | null = null
    if (bankAccount.accountId) {
      const saved = await prisma.bankAccount.findUnique({
        where: { id: bankAccount.accountId },
        include: { seller: { select: { id: true, profileId: true } } },
      })
      if (saved && saved.seller.profileId === user.id) {
        sellerId = saved.seller.id
      }
    }

    // Fallback: use the first active seller profile
    if (!sellerId) {
      const first = await prisma.sellerProfile.findFirst({
        where: { profileId: user.id, is_active: true },
        select: { id: true },
      })
      if (!first)
        throw new UserError(
          'SELLER_REQUIRED',
          'No active seller profile found',
          403,
        )
      sellerId = first.id
    }

    // Deduct platform + transfer fees from the requested gross amount
    const gross = Number(amount)
    const { net, platformFee, transferFee } = calculatePayout(gross)

    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // Withdraw the gross from wallet; seller receives net after fees
    const result = await walletService.withdraw(
      sellerId,
      gross,
      { ...bankAccount, netAmount: net, platformFee, transferFee },
      ipAddress,
      userAgent,
    )

    return {
      success: true,
      data: { ...result, breakdown: { gross, net, platformFee, transferFee } },
    }
  } catch (error: unknown) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error ? error.message : 'Internal server error',
    })
  }
})
