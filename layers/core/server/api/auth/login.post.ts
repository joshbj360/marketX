import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import { getRequestIP, getRequestHeader } from 'h3'
import { loginSchema } from '../../schemas/auth.schemas'
import { authService } from '../../services/auth.service'
import { AuthError } from '../../types/auth.types'

/**
 * Handles user login requests with security best practices.
 *
 * Validates login credentials, manages rate limiting and account locking,
 * sets secure HTTP-only cookies for tokens, and returns user data.
 *
 * @param event - The H3 event object containing request/response context
 * @returns Promise resolving to login response with tokens and user data
 * @throws {Error} 400 - Invalid input validation error
 * @throws {Error} 401 - Authentication failed (invalid credentials, locked account, etc.)
 * @throws {Error} 429 - Rate limit exceeded
 * @throws {Error} 500 - Unexpected server error
 *
 * @example
 * POST /api/auth/login
 * Body: { email: "user@example.com", password: "password123" }
 * Response: { success: true, accessToken: "...", refreshToken: "...", user: {...} }
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. Parse and validate request body
    const body = await readBody(event)
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      const first = validation.error.errors[0]
      const field = first?.path?.[0] ? `${first.path[0]}: ` : ''
      throw createError({
        statusCode: 400,
        statusMessage: `${field}${first?.message ?? 'Invalid input'}`,
      })
    }

    const { email, password } = validation.data

    // 2. Get Client Info
    // Helper to get IP safely (handles proxies/local)
    const ipAddress =
      getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const userAgent = getRequestHeader(event, 'user-agent') || 'Unknown'
    const device = getRequestHeader(event, 'device') || 'Web'

    // 3. Call the Service (No 'new' keyword needed anymore)
    // The Service handles Rate Limiting, Locking, Password Check, and Auditing
    const result = await authService.login(
      email,
      password,
      ipAddress,
      userAgent,
      device,
    )

    // 4. Set Secure Cookies (Best Practice)
    // Access Token (Short lived)
    setCookie(event, 'accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
    })

    // Refresh Token (Long lived)
    setCookie(event, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // 5. Return Public User Data (tokens are in HTTP-only cookies only)
    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    }
  } catch (error: unknown) {
    // AuthError thrown by authService (before throwAuthError sanitises it)
    if (error instanceof AuthError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }
    // Already an H3 error (from throwAuthError inside authService)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    console.error('[Login API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed. Please try again.',
    })
  }
})
