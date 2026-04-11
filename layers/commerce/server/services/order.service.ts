import { orderRepository } from '../repositories/order.repository'
import { cartRepository } from '../repositories/cart.repository'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditQueue } from '~~/server/queues/audit.queue'


export const orderService = {
  async placeOrder(
    userId: string,
    data: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const {
      items,
      name,
      address,
      zipcode,
      county,
      country,
      paymentMethod,
      affiliateCode,
    } = data

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new UserError(
        'INVALID_ORDER',
        'Order must have at least one item',
        400,
      )
    }

    // Resolve affiliate code → profileId (if provided)
    let affiliateUserId: string | undefined
    if (affiliateCode) {
      const affiliateProfile = await prisma.profile.findUnique({
        where: { affiliateCode },
        select: { id: true },
      })
      // Ignore self-referral
      if (affiliateProfile && affiliateProfile.id !== userId) {
        affiliateUserId = affiliateProfile.id
      }
    }

    // Validate stock for all items and compute prices + affiliate cuts
    let totalAmount = 0
    let totalAffiliateCut = 0
    const enrichedItems: any[] = []

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: {
            include: {
              offers: {
                where: { isActive: true },
                orderBy: { minQuantity: 'desc' },
              },
            },
          },
        },
      })
      if (!variant)
        throw new UserError(
          'VARIANT_NOT_FOUND',
          `Variant ${item.variantId} not found`,
          404,
        )
      if (variant.stock < item.quantity) {
        throw new UserError(
          'INSUFFICIENT_STOCK',
          `Not enough stock for variant ${item.variantId}`,
          400,
        )
      }

      const basePrice = variant.price ?? variant.product.price
      const productDiscount = variant.product.discount ?? 0
      let unitPrice = basePrice * (1 - productDiscount / 100)

      // Apply best active offer that the ordered quantity qualifies for
      const bestOffer = (variant.product.offers ?? [])
        .filter((o) => o.isActive && item.quantity >= o.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0]

      if (bestOffer) {
        unitPrice = unitPrice * (1 - bestOffer.discount / 100)
      }

      const lineTotalKobo = Math.round(unitPrice * item.quantity * 100)
      totalAmount += lineTotalKobo

      // Affiliate cut for this line item — affiliateCommission is a fixed Naira
      // amount (not a percentage), so convert directly to kobo
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

    // Create order
    const order = await orderRepository.createOrder(userId, {
      name,
      address,
      zipcode,
      county: county || '',
      country,
      totalAmount,
      paymentMethod: paymentMethod || 'card',
      affiliateUserId,
      affiliateCut: totalAffiliateCut,
      items: enrichedItems,
    })

    // Decrement stock
    for (const item of enrichedItems) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Clear cart after order
    await cartRepository.clearCart(userId)

    auditQueue.enqueue({
      userId,
      action: 'ORDER_PLACED',
      resource: 'Orders',
      resourceId: String(order.id),
      reason: 'Placed new order',
      changes: {
        totalAmount,
        itemCount: enrichedItems.length,
        affiliateUserId,
      },
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

    // Restore stock
    for (const item of order.orderItem) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      })
    }

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
