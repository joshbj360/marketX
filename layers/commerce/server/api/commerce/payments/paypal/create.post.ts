// POST /api/commerce/payments/paypal/create
// Creates a PENDING internal order then a PayPal order.
// Returns the PayPal approval URL for redirect.
import { z } from 'zod'
import { orderService } from '~~/layers/commerce/server/services/order.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'

const schema = z.object({
  items: z
    .array(z.object({ variantId: z.number(), quantity: z.number().positive() }))
    .min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  zipcode: z.string().min(1),
  county: z.string().optional().default(''),
  country: z.string().min(2).max(2),
  shippingCost: z.number().int().min(0).default(0),
  shippingZone: z.string().optional(),
  estimatedDays: z.string().optional(),
  callback_url: z.string().url().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = schema.parse(await readBody(event))
    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // 1. Create internal order (PENDING, UNPAID)
    const order = await orderService.placeOrder(
      user.id,
      { ...body, paymentMethod: 'paypal' },
      ipAddress,
      userAgent,
    )

    // 2. Total in kobo (order.totalAmount) + shipping
    const totalKobo = order.totalAmount + body.shippingCost
    const amountUSD = koboToUSD(totalKobo)

    const config = useRuntimeConfig()
    const baseURL = config.public.baseURL || 'http://localhost:3000'
    const returnUrl = `${baseURL}/buyer/orders?paypal=success&orderId=${order.id}`
    const cancelUrl = `${baseURL}/checkout`

    // 3. Create PayPal order
    const pp = await paypal.createOrder({
      amountUSD,
      internalOrderId: order.id,
      description: `stylex Order #${order.id}`,
      returnUrl,
      cancelUrl,
    })

    // 4. Store PayPal order ID as paymentRef
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentRef: pp.id },
    })

    return {
      success: true,
      data: {
        orderId: order.id,
        paypalOrderId: pp.id,
        approvalUrl: pp.approvalUrl,
        amountUSD,
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
      statusMessage: error.message || 'PayPal order creation failed',
    })
  }
})
