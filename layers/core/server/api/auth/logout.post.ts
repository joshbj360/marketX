import {
  defineEventHandler,
  deleteCookie,
  getCookie,
  getRequestIP,
  getRequestHeader,
  createError,
} from 'h3'
import { authService } from '../../services/auth.service'
import { authRepository } from '../../repositories/auth.repository'

export default defineEventHandler(async (event) => {
  try {
    // 1. Get Client Info
    const ipAddress =
      getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const userAgent = getRequestHeader(event, 'user-agent') || 'Unknown'

    // 2. Get Refresh Token from Cookie
    // This is safer than relying on a client-provided header
    const refreshToken = getCookie(event, 'refreshToken')

    if (refreshToken) {
      // 3. Find the Session ID associated with this token
      // We use the repo helper here to bridge the gap
      const session =
        await authRepository.getSessionByRefreshToken(refreshToken)

      if (session) {
        // 4. Perform Logout (Revoke Session & Audit Log)
        await authService.logout(session.id, ipAddress, userAgent)
      }
    }

    // 5. Clear Cookies (Always do this, even if session lookup failed)
    deleteCookie(event, 'accessToken')
    deleteCookie(event, 'refreshToken')

    return {
      success: true,
      message: 'Logged out successfully',
    }
  } catch (error: unknown) {
    logger.error('[Logout API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
