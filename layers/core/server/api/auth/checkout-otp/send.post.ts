// POST /api/auth/checkout-otp/send
// Step 1 of inline checkout auth — generates and emails a one-time code.
// Business logic lives in checkout-otp.service.ts.

import { z } from 'zod'
import { getRequestIP } from 'h3'
import { sendCheckoutOtp } from '~~/layers/core/server/services/checkout-otp.service'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const parsed = schema.safeParse(await readBody(event))
    if (!parsed.success) {
      const first = parsed.error.errors[0]
      const field = first?.path?.[0] ? `${first.path[0]}: ` : ''
      throw createError({ statusCode: 400, statusMessage: `${field}${first?.message ?? 'Invalid input'}` })
    }

    const body = parsed.data
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'

    const result = await sendCheckoutOtp(
      body.email.toLowerCase(),
      body.name,
      body.phone,
      ipAddress,
    )

    return { success: true, ...result }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to send verification code' })
  }
})
