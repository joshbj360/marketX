// FILE PATH: server/middleware/auth.global.ts

/**
 * Global Auth Middleware
 * Runs on every request and verifies JWT token if present
 * Attaches user to event context for use in handlers
 */

import { H3Event, getHeader, parseCookies } from 'h3'
import { jwtDecode } from '../utils/auth/auth'

export default defineEventHandler(async (event: H3Event) => {
  // Skip middleware for non-API routes
  if (!event.node.req.url?.startsWith('/api')) {
    return
  }

  try {
    // Get token from Authorization header or cookie
    let token = getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      // Try to get from cookies
      const cookies = parseCookies(event)
      token = cookies.accessToken
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwtDecode(token)

        if (decoded) {
          // Attach user info to event context for use in handlers
          event.context.auth = {
            user: {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role,
            },
            token: token,
          }
        }
      } catch (error) {
        // Invalid token - don't attach user
        // Route handlers can check for authentication
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Continue without auth context
  }
})
