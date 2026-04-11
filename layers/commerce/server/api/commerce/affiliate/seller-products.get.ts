// GET /api/commerce/affiliate/seller-products
// Returns the authenticated seller's products that have affiliateCommission set,
// along with aggregated order stats (units sold, revenue) for each product.
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    // Get all active seller profiles for this user
    const sellerProfiles = await prisma.sellerProfile.findMany({
      where: { profileId: user.id, is_active: true },
      select: { id: true, store_name: true, store_slug: true },
    })

    if (!sellerProfiles.length) {
      return {
        success: true,
        data: { products: [], totalRevenue: 0, totalUnitsSold: 0 },
      }
    }

    const sellerIds = sellerProfiles.map((s) => s.id)

    // Fetch products that belong to the user's stores with affiliate commission
    const products = await prisma.products.findMany({
      where: {
        sellerId: { in: sellerIds },
        affiliateCommission: { not: null },
      },
      select: {
        id: true,
        title: true,
        affiliateCommission: true,
        sellerId: true,
        media: {
          select: { url: true },
          take: 1,
          orderBy: { created_at: 'asc' },
        },
        variants: {
          select: {
            orderItems: {
              select: {
                quantity: true,
                price: true,
                order: {
                  select: { paymentStatus: true },
                },
              },
            },
          },
        },
      },
    })

    // Enrich with store name and compute stats
    const storeMap = Object.fromEntries(sellerProfiles.map((s) => [s.id, s]))

    const enriched = products.map((p) => {
      const allOrderItems = p.variants.flatMap((v) => v.orderItems)
      const paidItems = allOrderItems.filter(
        (i) => i.order?.paymentStatus === 'PAID',
      )
      const unitsSold = paidItems.reduce((s, i) => s + i.quantity, 0)
      const revenue = paidItems.reduce((s, i) => s + i.price * i.quantity, 0)
      const commissionEarned = Math.round(
        revenue * ((p.affiliateCommission ?? 0) / 100),
      )

      return {
        id: p.id,
        title: p.title,
        imageUrl: p.media[0]?.url ?? null,
        affiliateCommission: p.affiliateCommission,
        storeName: storeMap[p.sellerId]?.store_name ?? '',
        storeSlug: storeMap[p.sellerId]?.store_slug ?? '',
        unitsSold,
        revenue,
        commissionEarned,
      }
    })

    const totalRevenue = enriched.reduce((s, p) => s + p.revenue, 0)
    const totalUnitsSold = enriched.reduce((s, p) => s + p.unitsSold, 0)
    const totalCommission = enriched.reduce((s, p) => s + p.commissionEarned, 0)

    return {
      success: true,
      data: {
        products: enriched,
        totalRevenue,
        totalUnitsSold,
        totalCommission,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Server error',
    })
  }
})
