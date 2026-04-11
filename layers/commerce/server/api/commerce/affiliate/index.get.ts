// GET /api/commerce/affiliate — affiliate status and earnings stats
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true, username: true, affiliateCode: true },
    })

    if (!profile) throw new UserError('NOT_FOUND', 'Profile not found', 404)

    if (!profile.affiliateCode) {
      return {
        success: true,
        data: {
          isEnrolled: false,
          affiliateCode: null,
          stats: { totalEarnings: 0, pendingEarnings: 0, totalConversions: 0 },
        },
      }
    }

    // Aggregate earnings from orders where this user is the affiliate
    const [releasedOrders, pendingOrders] = await Promise.all([
      prisma.orders.aggregate({
        where: { affiliateUserId: user.id, status: 'DELIVERED' },
        _sum: { affiliateCut: true },
        _count: { id: true },
      }),
      prisma.orders.aggregate({
        where: {
          affiliateUserId: user.id,
          status: { notIn: ['DELIVERED', 'CANCELLED', 'CANCELED', 'RETURNED'] },
        },
        _sum: { affiliateCut: true },
      }),
    ])

    const totalEarnings = (releasedOrders._sum.affiliateCut ?? 0) / 100
    const pendingEarnings = (pendingOrders._sum.affiliateCut ?? 0) / 100
    const totalConversions = releasedOrders._count.id

    return {
      success: true,
      data: {
        isEnrolled: true,
        affiliateCode: profile.affiliateCode,
        stats: { totalEarnings, pendingEarnings, totalConversions },
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
