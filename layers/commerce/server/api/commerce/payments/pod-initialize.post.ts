// POST /api/commerce/payments/pod-initialize
// Pay-on-Delivery flow: creates the order and charges ONLY the shipping fee
// upfront via Paystack as a commitment deposit.
// The product amount is collected in cash on delivery.
// Returns a Paystack authorization URL for the shipping fee payment.

import { z } from 'zod'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { orderService } from '../../../services/order.service'
import { orderRepository } from '../../../repositories/order.repository'
import { notificationQueue } from '~~/server/queues/notification.queue'

const schema = z.object({
  items: z
    .array(z.object({ variantId: z.number(), quantity: z.number().positive() }))
    .min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  zipcode: z.string().min(1),
  county: z.string().optional().default(''),
  country: z.string().min(2).max(2),
  shippingCost: z.number().int().min(1, 'Shipping fee is required for Pay on Delivery'),
  shippingZone: z.string().optional(),
  estimatedDays: z.string().optional(),
  callback_url: z.string().url().optional(),
  affiliateCode: z.string().optional(),
})

/** Notify each unique seller of a new POD order */
async function notifySellersPOD(orderId: number, buyerName: string, totalAmount: number) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      variant: {
        include: {
          product: {
            include: { seller: { select: { profileId: true, store_name: true } } },
          },
        },
      },
    },
  })

  const seen = new Set<string>()
  for (const item of items) {
    const sellerId = item.variant?.product?.seller?.profileId
    if (!sellerId || seen.has(sellerId)) continue
    seen.add(sellerId)

    const amountNGN = (totalAmount / 100).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    })

    notificationQueue.enqueue({
      userId: sellerId,
      type: 'ORDER',
      actorId: sellerId,
      orderId,
      message: `📦 New Pay-on-Delivery order #${orderId} from ${buyerName} · ${amountNGN} to collect on delivery. Shipping fee secured.`,
    })
  }
}

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = schema.parse(await readBody(event))
    const ipAddress = getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // 1. Verify seller supports POD for this zone
    // Derive state from shippingZone (format "State · Zone" or just "State")
    const buyerState = body.shippingZone?.split('·')[0]?.trim() || body.county || ''

    if (buyerState) {
      // Find sellers for items in this order and check POD eligibility
      const variantIds = body.items.map((i) => i.variantId)
      const sellers = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: {
          product: {
            select: {
              seller: {
                select: { pod_enabled: true, pod_zones: true },
              },
            },
          },
        },
      })

      const anySellerDisablesPOD = sellers.some((v) => {
        const s = v.product?.seller
        if (!s?.pod_enabled) return true
        if (!s.pod_zones) return false // no zone restriction = all zones allowed
        const zones = s.pod_zones as string[]
        return !zones.some((z) => buyerState.toLowerCase().includes(z.toLowerCase()))
      })

      if (anySellerDisablesPOD) {
        throw new UserError(
          'POD_NOT_AVAILABLE',
          'Pay on Delivery is not available for your location or one of the sellers in your cart.',
          400,
        )
      }
    }

    // 2. Create the order (PENDING, UNPAID, paymentMethod: pay_on_delivery)
    const order = await orderService.placeOrder(
      user.id,
      {
        ...body,
        paymentMethod: 'pay_on_delivery',
      },
      ipAddress,
      userAgent,
    )

    // 3. Build Paystack reference for SHIPPING FEE ONLY
    const reference = `pod_ship_${order.id}_${Date.now()}`
    await orderRepository.setPaymentRef(order.id, reference)

    // 4. Initialize Paystack for shipping fee only
    const ps = await paystack.initializeTransaction({
      email: user.email,
      amount: body.shippingCost, // shipping fee only — in kobo
      reference,
      currency: 'NGN',
      metadata: {
        orderId: order.id,
        userId: user.id,
        type: 'pod_shipping',
      },
      callback_url: body.callback_url,
    })

    return {
      success: true,
      data: {
        orderId: order.id,
        reference,
        authorizationUrl: ps.data.authorization_url,
        accessCode: ps.data.access_code,
        shippingCost: body.shippingCost,
        productAmount: order.totalAmount,
      },
    }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({ statusCode: error.status, statusMessage: error.message })
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'POD initialization failed',
    })
  }
})
