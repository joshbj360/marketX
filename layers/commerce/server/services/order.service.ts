import {
  orderRepository,
  type CreateOrderData,
} from '../repositories/order.repository'
import { cartRepository } from '../repositories/cart.repository'
import { affiliateRepository } from '../repositories/affiliate.repository'
import { walletService } from './wallet.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditQueue } from '~~/server/queues/audit.queue'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { emailQueue } from '~~/server/queues/email.queue'
import { buildNewOrderSellerEmail } from '~~/server/utils/email/emailService'

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

    // Resolve affiliate code → profileId (ignore self-referral)
    let affiliateUserId: string | undefined
    if (affiliateCode) {
      const affiliateProfile =
        await affiliateRepository.findByCode(affiliateCode)
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
                offers: {
                  where: { isActive: true },
                  orderBy: { minQuantity: 'desc' },
                },
                seller: { select: { id: true, profileId: true, store_name: true } },
              },
            },
          },
        }),
      ),
    )

    let totalAmount = 0
    let totalAffiliateCut = 0
    const enrichedItems: CreateOrderData['items'] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const variant = variantRows[i]
      if (!variant) {
        throw new UserError(
          'VARIANT_NOT_FOUND',
          `Variant ${item.variantId} not found`,
          404,
        )
      }
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
        itemAffiliateCut = Math.round(variant.product.affiliateCommission * item.quantity * 100)
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
      // Decrement stock with a conditional UPDATE — single atomic operation that
      // eliminates the read-check-decrement race. If another concurrent order already
      // claimed the last unit, stock drops below quantity and updateMany returns count=0.
      for (const item of enrichedItems) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
        if (result.count === 0) {
          throw new UserError(
            'INSUFFICIENT_STOCK',
            `Stock unavailable for variant ${item.variantId}`,
            400,
          )
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
                      seller: {
                        select: {
                          id: true,
                          profileId: true,
                          store_slug: true,
                          store_name: true,
                        },
                      },
                      media: {
                        take: 1,
                        where: { isBgMusic: false },
                        select: { id: true, url: true, type: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

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
      changes: {
        totalAmount,
        itemCount: enrichedItems.length,
        affiliateUserId,
      },
      ipAddress,
      userAgent,
    })

    // Notify each seller of their portion of the order — fire-and-forget
    type SellerInfo = {
      profileId: string
      storeName: string
      itemCount: number
      subtotal: number
    }
    const sellerMap = new Map<string, SellerInfo>()
    for (let i = 0; i < variantRows.length; i++) {
      const seller = variantRows[i]?.product.seller
      if (!seller?.profileId) continue
      const profileId = seller.profileId
      const existing = sellerMap.get(profileId)
      const lineTotal = enrichedItems[i]?.price ?? 0
      const qty = enrichedItems[i]?.quantity ?? 1
      if (existing) {
        existing.itemCount += qty
        existing.subtotal += lineTotal
      } else {
        sellerMap.set(profileId, {
          profileId,
          storeName: seller.store_name ?? 'Your Store',
          itemCount: qty,
          subtotal: lineTotal,
        })
      }
    }

    for (const s of sellerMap.values()) {
      notificationQueue.enqueue({
        userId: s.profileId,
        type: 'ORDER',
        message: `New order #${order.id} received — ${s.itemCount} item${s.itemCount !== 1 ? 's' : ''}, ₦${(s.subtotal / 100).toLocaleString('en-NG')}`,
        orderId: order.id,
      })
      prisma.profile
        .findUnique({ where: { id: s.profileId }, select: { email: true } })
        .then((profile) => {
          if (!profile?.email) return
          const { subject, html, text } = buildNewOrderSellerEmail(
            order.id,
            s.itemCount,
            s.subtotal,
            s.storeName,
          )
          emailQueue.enqueue({
            to: profile.email,
            subject,
            html,
            text,
            type: 'ORDER_CONFIRMATION',
          })
        })
        .catch(() => {})
    }

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

    // If the order was already paid, reverse any pending seller credit so the
    // seller's pending_balance stays accurate. A Paystack refund to the buyer
    // must be issued separately (manual or via admin tooling).
    if (order.paymentStatus === 'PAID') {
      walletService.reverseOrderCredit(id).catch((e) =>
        logger.logError('[cancelOrder wallet reverse]', e),
      )
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
