import {
  defineEventHandler,
  getCookie,
  setCookie,
  createError,
  getRequestIP,
  getRequestHeader,
} from 'h3'
import { authService } from '../../services/auth.service'
import { AuthError } from '../../types/auth.types'

export default defineEventHandler(async (event) => {
  try {
    // 1. Get Refresh Token (Safely from HTTP-Only Cookie)
    const refreshToken = getCookie(event, 'refreshToken')

    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No refresh token provided',
      })
    }

    // 2. Get Client Context
    const ipAddress =
      getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const userAgent = getRequestHeader(event, 'user-agent') || 'Unknown'

    // 3. Call Singleton Service
    // Logic: Validate Token -> Check Expiry/Revocation -> Generate New Access Token -> Audit Log
    const result = await authService.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent,
    )

    // 4. Set New Access Token Cookie
    // We only refresh the short-lived access token here
    setCookie(event, 'accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
    })

    return {
      success: true,
      accessToken: result.accessToken,
    }
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    console.error('[Refresh Token API] Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
