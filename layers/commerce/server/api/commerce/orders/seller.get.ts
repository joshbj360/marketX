// GET /api/commerce/orders/seller?storeSlug=xxx — seller's incoming orders
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const storeSlug = query.storeSlug as string
    const status = query.status as string | undefined
    const limit = Math.min(Number(query.limit) || 20, 100)
    const offset = Number(query.offset) || 0

    if (!storeSlug) throw new UserError('INVALID', 'storeSlug is required', 400)

    // Verify ownership
    const seller = await prisma.sellerProfile.findUnique({
      where: { store_slug: storeSlug },
      select: { id: true, profileId: true },
    })
    if (!seller) throw new UserError('NOT_FOUND', 'Store not found', 404)
    if (seller.profileId !== user.id)
      throw new UserError('FORBIDDEN', 'Access denied', 403)

    const where: import('@prisma/client').Prisma.OrdersWhereInput = {
      orderItem: {
        some: { variant: { product: { sellerId: seller.id } } },
      },
      ...(status ? { status: status as import('@prisma/client').OrderStatus } : {}),
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        include: {
          orderItem: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      seller: {
                        select: { store_name: true, store_slug: true },
                      },
                      media: {
                        select: { id: true, url: true, type: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          user: {
            select: { id: true, username: true, avatar: true, email: true },
          },
          affiliate: {
            select: { id: true, username: true, avatar: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.orders.count({ where }),
    ])

    // Enrich each order with seller-specific financial breakdown
    const enriched = orders.map((order) => {
      const sellerItems = order.orderItem.filter(
        (oi) => oi.variant.product.sellerId === seller.id,
      )
      const grossKobo = sellerItems.reduce((s, oi) => s + (oi.price || 0), 0)
      const affiliateCutKobo = sellerItems.reduce(
        (s, oi) => s + (oi.affiliateCut || 0),
        0,
      )
      const netKobo = grossKobo - affiliateCutKobo
      return {
        ...order,
        sellerBreakdown: {
          gross: grossKobo / 100,
          affiliateCut: affiliateCutKobo / 100,
          net: netKobo / 100,
          currency: 'NGN',
        },
      }
    })

    return { success: true, data: { orders: enriched, total, limit, offset } }
  } catch (error: unknown) {
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
