// POST /api/seller/bank-accounts — add a new bank account
import { z } from 'zod'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

const schema = z.object({
  sellerId: z.string().uuid(),
  bankName: z.string().min(1),
  bankCode: z.string().min(1),
  accountNumber: z.string().min(10).max(10),
  accountName: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = schema.parse(await readBody(event))

    // Verify the seller belongs to this user
    const seller = await prisma.sellerProfile.findFirst({
      where: { id: body.sellerId, profileId: user.id, is_active: true },
    })
    if (!seller)
      throw new UserError('FORBIDDEN', 'Store not found or access denied', 403)

    // If setting as default, unset all other defaults for this seller
    if (body.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { sellerId: body.sellerId },
        data: { isDefault: false },
      })
    }

    // If this is the first account, make it default automatically
    const existingCount = await prisma.bankAccount.count({
      where: { sellerId: body.sellerId },
    })
    const makeDefault = body.isDefault || existingCount === 0

    const account = await prisma.bankAccount.create({
      data: {
        sellerId: body.sellerId,
        bankName: body.bankName,
        bankCode: body.bankCode,
        accountNumber: body.accountNumber,
        accountName: body.accountName,
        isDefault: makeDefault,
      },
    })

    return { success: true, data: account }
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
