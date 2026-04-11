// POST /api/commerce/payments/initialize
// Creates an order in PENDING state, then initializes a Paystack transaction.
// The client redirects the user to the Paystack payment page.
import { z } from 'zod'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { orderService } from '../../../services/order.service'


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
  currency: z.string().default('NGN'),
  callback_url: z.string().url().optional(),
  affiliateCode: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = schema.parse(await readBody(event))
    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    // 1. Create the order (PENDING, UNPAID)
    const order = await orderService.placeOrder(
      user.id,
      {
        ...body,
        paymentMethod: 'card',
      },
      ipAddress,
      userAgent,
    )

    // 2. Build a unique Paystack reference
    const reference = `stylex_${order.id}_${Date.now()}`

    // 3. Store the reference on the order
    await prisma.orders.update({
      where: { id: order.id },
      data: { paymentRef: reference },
    })

    // 4. Initialize Paystack transaction
    const config = useRuntimeConfig()
    const ps = await paystack.initializeTransaction({
      email: user.email,
      amount: order.totalAmount + body.shippingCost,
      reference,
      currency: body.currency,
      metadata: { orderId: order.id, userId: user.id },
      callback_url: body.callback_url,
    })

    return {
      success: true,
      data: {
        orderId: order.id,
        reference,
        authorizationUrl: ps.data.authorization_url,
        accessCode: ps.data.access_code,
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
      statusMessage: error.message || 'Payment initialization failed',
    })
  }
})
