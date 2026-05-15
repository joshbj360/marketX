import { orderRepository, type CreateOrderData } from '../repositories/order.repository'
import { cartRepository } from '../repositories/cart.repository'
import { affiliateRepository } from '../repositories/affiliate.repository'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditQueue } from '~~/server/queues/audit.queue'

export interface PlaceOrderInput {
  items: Array<{ variantId: number; quantity: number }>
  name: string
  address: string
  zipcode: string
  county?: string
  country: string
  paymentMethod?: string
  affiliateCode?: string
}

export const orderService = {
  async placeOrder(
    userId: string,
    data: PlaceOrderInput,
    ipAddress: string,
    userAgent: string,
  ) {
    const { items, name, address, zipcode, county, country, paymentMethod, affiliateCode } = data

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new UserError('INVALID_ORDER', 'Order must have at least one item', 400)
    }

    // Resolve affiliate code → profileId (ignore self-referral)
    let affiliateUserId: string | undefined
    if (affiliateCode) {
      const affiliateProfile = await affiliateRepository.findByCode(affiliateCode)
      if (affiliateProfile && affiliateProfile.id !== userId) {
        affiliateUserId = affiliateProfile.id
      }
    }

    // ── Pre-validate all variants BEFORE entering the transaction ────────────
    // Fetch every variant + product so we can compute prices and check stock.
    const variantRows = await Promise.all(
      items.map((item) =>
        prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: {
              include: {
                offers: { where: { isActive: true }, orderBy: { minQuantity: 'desc' } },
                seller: { select: { id: true } },
              },
            },
          },
        }),
      ),
    )

    const sellerIds = new Set(variantRows.map((v) => v?.product.seller?.id).filter(Boolean))
    if (sellerIds.size > 1) {
      throw new UserError('MULTI_SELLER_ORDER', 'All items must be from the same store', 400)
    }

    let totalAmount = 0
    let totalAffiliateCut = 0
    const enrichedItems: CreateOrderData['items'] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const variant = variantRows[i]
      if (!variant) {
        throw new UserError('VARIANT_NOT_FOUND', `Variant ${item.variantId} not found`, 404)
      }
      if (variant.stock < item.quantity) {
        throw new UserError('INSUFFICIENT_STOCK', `Not enough stock for variant ${item.variantId}`, 400)
      }

      const basePrice = variant.price ?? variant.product.price
      const productDiscount = variant.product.discount ?? 0
      let unitPrice = basePrice * (1 - productDiscount / 100)

      const bestOffer = (variant.product.offers ?? [])
        .filter((o) => o.isActive && item.quantity >= o.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0]
      if (bestOffer) {
        unitPrice = unitPrice * (1 - bestOffer.discount / 100)
      }

      const lineTotalKobo = Math.round(unitPrice * item.quantity * 100)
      totalAmount += lineTotalKobo

      let itemAffiliateCut = 0
      if (affiliateUserId && variant.product.affiliateCommission) {
        itemAffiliateCut = Math.round(variant.product.affiliateCommission * 100)
        totalAffiliateCut += itemAffiliateCut
      }

      enrichedItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        price: lineTotalKobo,
        affiliateCut: itemAffiliateCut,
      })
    }

    // ── Atomic transaction: create order + decrement stock together ───────────
    const order = await prisma.$transaction(async (tx) => {
      // Re-check stock inside the transaction to prevent race conditions
      for (const item of enrichedItems) {
        const locked = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        })
        if (!locked || locked.stock < item.quantity) {
          throw new UserError('INSUFFICIENT_STOCK', `Stock changed for variant ${item.variantId}`, 400)
        }
      }

      const created = await tx.orders.create({
        data: {
          userId,
          stripeId: `order_${Date.now()}_${userId.slice(0, 8)}`,
          name,
          address,
          zipcode,
          county: county || '',
          country,
          totalAmount,
          paymentMethod: paymentMethod || 'card',
          ...(affiliateUserId ? { affiliateUserId } : {}),
          ...(totalAffiliateCut ? { affiliateCut: totalAffiliateCut } : {}),
          orderItem: {
            create: enrichedItems.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              affiliateCut: item.affiliateCut,
            })),
          },
        },
        include: {
          orderItem: {
            include: {
              variant: {
                select: {
                  id: true,
                  size: true,
                  price: true,
                  product: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                      price: true,
                      seller: { select: { store_slug: true, store_name: true } },
                      media: { take: 1, where: { isBgMusic: false }, select: { id: true, url: true, type: true } },
                    },
                  },
                },
              },
            },
          },
        },
      })

      // Decrement stock atomically with the order creation
      await Promise.all(
        enrichedItems.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      )

      return created
    })

    // Clear cart and fire audit outside the transaction (non-critical)
    await cartRepository.clearCart(userId)

    auditQueue.enqueue({
      userId,
      action: 'ORDER_PLACED',
      resource: 'Orders',
      resourceId: String(order.id),
      reason: 'Placed new order',
      changes: { totalAmount, itemCount: enrichedItems.length, affiliateUserId },
      ipAddress,
      userAgent,
    })

    return order
  },

  async getUserOrders(userId: string, limit = 20, offset = 0) {
    const [orders, total] = await Promise.all([
      orderRepository.getUserOrders(userId, limit, offset),
      orderRepository.countUserOrders(userId),
    ])
    return { orders, total, limit, offset }
  },

  async getOrderById(id: number, userId: string) {
    const order = await orderRepository.getOrderById(id)
    if (!order) throw new UserError('ORDER_NOT_FOUND', 'Order not found', 404)
    if (order.userId !== userId)
      throw new UserError('FORBIDDEN', 'Access denied', 403)
    return order
  },

  async cancelOrder(
    id: number,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const order = await orderRepository.getOrderById(id)
    if (!order) throw new UserError('ORDER_NOT_FOUND', 'Order not found', 404)
    if (order.userId !== userId)
      throw new UserError('FORBIDDEN', 'Access denied', 403)
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new UserError(
        'CANNOT_CANCEL',
        'Order cannot be cancelled at this stage',
        400,
      )
    }

    const updated = await orderRepository.updateOrderStatus(id, 'CANCELLED')
    await orderRepository.restoreStock(order.orderItem)

    auditQueue.enqueue({
      userId,
      action: 'ORDER_CANCELLED',
      resource: 'Orders',
      resourceId: String(id),
      reason: 'Order cancelled by user',
      ipAddress,
      userAgent,
    })

    return updated
  },
}
