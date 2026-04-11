// server/utils/security/csrf.ts
/**
 * CSRF (Cross-Site Request Forgery) protection
 * Generates and validates CSRF tokens for state-changing operations
 */

import { createError, type H3Event, setCookie, getCookie } from 'h3'
import crypto from 'crypto'

const CSRF_TOKEN_COOKIE_NAME = '__csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 3600, // 1 hour
  path: '/',
}

/**
 * Generate a new CSRF token
 * Should be called on page load (GET requests)
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Set CSRF token cookie
 * Call this in your middleware or on page load endpoint
 */
export function setCsrfToken(event: H3Event): string {
  const token = generateCsrfToken()
  setCookie(event, CSRF_TOKEN_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS)
  return token
}

/**
 * Validate CSRF token from request
 * Call this on all state-changing endpoints (POST, PUT, DELETE)
 */
export function validateCsrfToken(event: H3Event): boolean {
  // Get token from cookie
  const cookieToken = getCookie(event, CSRF_TOKEN_COOKIE_NAME)
  if (!cookieToken) {
    throw createError({
      statusCode: 403,
      message: 'CSRF token missing from cookie',
    })
  }

  // Get token from header or body
  const headerToken = event.node.req.headers[CSRF_HEADER_NAME.toLowerCase()]
  if (!headerToken || headerToken !== cookieToken) {
    throw createError({
      statusCode: 403,
      message: 'CSRF token validation failed',
    })
  }

  return true
}

/**
 * Middleware to validate CSRF on state-changing requests
 * Apply to POST, PUT, DELETE routes
 */
export function csrfProtectionMiddleware(event: H3Event) {
  const method = event.node.req.method

  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return
  }

  // Skip for public endpoints (if needed)
  const publicPaths = ['/api/auth/register', '/api/auth/forgot-password']

  if (publicPaths.some((path) => event.node.req.url?.startsWith(path))) {
    // For public endpoints, still set token for client to use
    if (!getCookie(event, CSRF_TOKEN_COOKIE_NAME)) {
      setCsrfToken(event)
    }
    return
  }

  // Validate token
  validateCsrfToken(event)
}

/**
 * Get CSRF token for client
 * Returns token from cookie or generates new one
 */
export function getCsrfTokenForClient(event: H3Event): string {
  let token = getCookie(event, CSRF_TOKEN_COOKIE_NAME)
  if (!token) {
    token = setCsrfToken(event)
  }
  return token
}
