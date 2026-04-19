import {
  defineEventHandler,
  readBody,
  deleteCookie,
  createError,
  getRequestIP,
  getRequestHeader,
} from 'h3'
import { authService } from '../../services/auth.service'
import { resetPasswordSchema } from '../../schemas/auth.schemas'
import { AuthError } from '../../types/auth.types'

export default defineEventHandler(async (event) => {
  try {
    // 1. Parse and validate request body
    const body = await readBody(event)
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.errors,
      })
    }

    const validatedData = validation.data

    // 2. Get client info safely
    const ipAddress =
      getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const userAgent = getRequestHeader(event, 'user-agent') || 'Unknown'

    // 3. Call Singleton Service
    // Logic: Validate Token -> Hash New Password -> Revoke Sessions -> Audit Log
    const result = await authService.resetPassword(
      validatedData.token,
      validatedData.password,
      ipAddress,
      userAgent,
    )

    // 4. Clear cookies
    // Crucial Security Step: Forces the user to log in again with the new password
    deleteCookie(event, 'accessToken')
    deleteCookie(event, 'refreshToken')

    return {
      success: true,
      message: result.message,
    }
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error('[Reset Password API] Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
