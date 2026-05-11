// POST /api/__test__/reset-rate-limits
// Dev/test only — resets in-memory rate limit counters between test runs.
// Returns 403 in production so it cannot be called on live infrastructure.

import { resetAllRateLimits } from '~~/server/utils/auth/rateLimiter'

export default defineEventHandler((event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'Not available in production' })
  }
  resetAllRateLimits()
  return { success: true }
})
