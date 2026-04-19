// POST /api/auth/checkout-otp/verify
// Step 2 of inline checkout auth — verifies the OTP, auto-registers new users,
// issues JWT tokens, sets httpOnly cookies identical to /api/auth/login.
// Business logic lives in checkout-otp.service.ts.

import { z } from 'zod'
import { getRequestIP, getRequestHeader, setCookie } from 'h3'
import { verifyCheckoutOtp } from '~~/layers/core/server/services/checkout-otp.service'

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  name: z.string().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = schema.parse(await readBody(event))
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const userAgent = getRequestHeader(event, 'user-agent') || 'Unknown'

    const result = await verifyCheckoutOtp(
      body.email.toLowerCase(),
      body.code,
      body.name,
      ipAddress,
      userAgent,
    )

    const isProd = process.env.NODE_ENV === 'production'
    setCookie(event, 'accessToken', result.accessToken, {
      httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 24 * 60 * 60,
    })
    setCookie(event, 'refreshToken', result.refreshToken, {
      httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60,
    })

    return { success: true, ...result }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({ statusCode: 500, statusMessage: 'Verification failed. Please try again.' })
  }
})
