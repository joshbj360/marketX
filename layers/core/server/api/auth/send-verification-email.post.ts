import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { authService } from '../../services/auth.service'
import { AuthError } from '../../types/auth.types'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

/**
 * POST /api/auth/send-verification-email
 *
 * Public endpoint — no auth required.
 * Accepts { email } in the body and resends the verification link.
 * Used by the /resend-verification page for unverified / guest users.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = schema.safeParse(body)

    if (!validation.success) {
      const first = validation.error.errors[0]
      throw createError({
        statusCode: 400,
        statusMessage: first?.message ?? 'Invalid input',
      })
    }

    const email = validation.data.email.toLowerCase()

    // Look up profile by email — respond identically whether found or not
    // to avoid user enumeration
    const profile = await prisma.profile.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    })

    if (profile && !profile.emailVerified) {
      await authService.sendVerificationEmail(profile.id, email)
    }

    return {
      success: true,
      message:
        'If an account with that email exists and is unverified, a verification link has been sent.',
    }
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    console.error('[Send Verification Email API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send verification email',
    })
  }
})
