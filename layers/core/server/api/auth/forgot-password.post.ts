import { defineEventHandler, readBody, createError } from 'h3'
import { forgotPasswordSchema } from '../../schemas/auth.schemas'
import { authService } from '../../services/auth.service'
import { AuthError } from '../../types/auth.types'
import { getClientIP } from '~~/server/layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      const first = validation.error.errors[0]
      throw createError({
        statusCode: 400,
        statusMessage: first?.message ?? 'Invalid input',
      })
    }

    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    const result = await authService.requestPasswordReset(
      validation.data.email,
      ipAddress,
      userAgent,
    )

    return { success: true, message: result.message }
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error('[Forgot Password API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
