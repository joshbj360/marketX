// FILE PATH: server/utils/auth/rateLimiter.ts

/**
 * Production-grade rate limiting for auth endpoints
 * Prevents brute force attacks and DoS
 *
 * Returns allowed flag instead of throwing
 * Service layer decides what to do with it
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // milliseconds
  lockoutMs: number // milliseconds after max attempts exceeded
  keyPrefix: string
}

interface AttemptRecord {
  count: number
  firstAttemptAt: number
  lockedUntil?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  locked: boolean
  lockedUntilMs?: number
}

// In-memory store for rate limiting (use Redis in production cluster)
const attemptStore = new Map<string, AttemptRecord>()

// Cleanup old records every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of attemptStore.entries()) {
    if (now - record.firstAttemptAt > 3600000) {
      attemptStore.delete(key)
    }
  }
}, 3600000)

/**
 * Check rate limit for a key
 * Returns allowed: true/false (doesn't throw)
 * Service layer decides what to do
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const key = `${config.keyPrefix}:${identifier}`
  const now = Date.now()
  let record = attemptStore.get(key)

  // ==================== CHECK LOCKED ====================

  if (record?.lockedUntil && record.lockedUntil > now) {
    const lockedUntilMs = record.lockedUntil - now
    const remaining = Math.ceil(lockedUntilMs / 1000)

    return {
      allowed: false,
      remaining: 0,
      resetAt: record.lockedUntil,
      locked: true,
      lockedUntilMs: remaining,
    }
  }

  // ==================== CLEAR EXPIRED LOCK ====================

  if (record?.lockedUntil && record.lockedUntil <= now) {
    record.lockedUntil = undefined
    record.count = 0
  }

  // ==================== INITIALIZE OR UPDATE ====================

  if (!record) {
    // First attempt
    record = {
      count: 1,
      firstAttemptAt: now,
    }
  } else if (now - record.firstAttemptAt > config.windowMs) {
    // Window expired, reset
    record = {
      count: 1,
      firstAttemptAt: now,
    }
  } else {
    // Within window, increment
    record.count++
  }

  // ==================== CHECK IF EXCEEDED ====================

  if (record.count > config.maxAttempts) {
    // Lock the account
    record.lockedUntil = now + config.lockoutMs
    attemptStore.set(key, record)

    const lockedUntilMs = config.lockoutMs
    const remaining = Math.ceil(lockedUntilMs / 1000)

    return {
      allowed: false,
      remaining: 0,
      resetAt: now + config.lockoutMs,
      locked: true,
      lockedUntilMs: remaining,
    }
  }

  // ==================== ALLOWED ====================

  attemptStore.set(key, record)

  const remaining = config.maxAttempts - record.count
  const resetAt = record.firstAttemptAt + config.windowMs

  return {
    allowed: true,
    remaining,
    resetAt,
    locked: false,
  }
}

/**
 * Clear rate limit for a key (call on successful auth)
 */
export function clearRateLimit(identifier: string, keyPrefix: string): void {
  const key = `${keyPrefix}:${identifier}`
  attemptStore.delete(key)
}

/**
 * Get rate limit status for debugging
 */
export function getRateLimitStatus(
  identifier: string,
  keyPrefix: string,
): AttemptRecord | undefined {
  const key = `${keyPrefix}:${identifier}`
  return attemptStore.get(key)
}

/**
 * Reset all rate limits (for testing)
 */
export function resetAllRateLimits(): void {
  attemptStore.clear()
}

/**
 * Get all rate limit records (for monitoring/debugging)
 */
export function getAllRateLimitRecords(): Map<string, AttemptRecord> {
  return new Map(attemptStore)
}

/**
 * Delete specific rate limit record
 */
export function deleteRateLimitRecord(
  identifier: string,
  keyPrefix: string,
): boolean {
  const key = `${keyPrefix}:${identifier}`
  return attemptStore.delete(key)
}
