import { defineEventHandler, readBody, createError } from 'h3'
import { authService } from '../../services/auth.service'
import { registerSchema } from '../../schemas/auth.schemas'
import { AuthError } from '../../types/auth.types'
import { getClientIP } from '~~/server/layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      const first = validation.error.errors[0]
      const field = first?.path?.[0] ? `${first.path[0]}: ` : ''
      throw createError({
        statusCode: 400,
        statusMessage: `${field}${first?.message ?? 'Invalid input'}`,
      })
    }

    const { email, username, password } = validation.data
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    const result = await authService.register(
      email,
      username,
      password,
      ipAddress,
      userAgent,
      'user',
    )

    return {
      success: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      user: result,
    }
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error('[Register API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed. Please try again.',
    })
  }
})
