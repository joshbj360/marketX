/**
 * API-wide rate limiting middleware
 * Applied to every /api/* request before route handlers run.
 *
 * Tiers:
 *  - Auth endpoints (/api/auth/*): handled by existing auth rateLimiter — skipped here
 *  - Upload endpoints (/api/upload/*): 10 req/min (expensive)
 *  - Public read endpoints: 120 req/min per IP
 *  - Authenticated requests: 300 req/min per userId
 */

interface WindowRecord {
  count: number
  windowStart: number
}

const store = new Map<string, WindowRecord>()

// Clean up stale keys every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, rec] of store.entries()) {
      if (now - rec.windowStart > 120_000) store.delete(key)
    }
  },
  5 * 60 * 1000,
)

function check(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  let rec = store.get(key)

  if (!rec || now - rec.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return true
  }

  rec.count++
  if (rec.count > limit) return false
  return true
}

export default defineEventHandler((event) => {
  try {
  const path = event.node.req.url ?? ''

  // Only apply to API routes
  if (!path.startsWith('/api/')) return

  // Auth endpoints have their own fine-grained limiter
  if (path.startsWith('/api/auth/')) return

  // Paystack webhook must never be rate-limited
  if (path.startsWith('/api/commerce/payments/webhook')) return

  const ip =
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getHeader(event, 'x-real-ip') ||
    'unknown'

  // Upload: 10 req/min
  if (path.startsWith('/api/upload')) {
    if (!check(`upload:${ip}`, 10, 60_000)) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many uploads. Please wait a moment.',
        headers: { 'Retry-After': '60' },
      })
    }
    return
  }

  // Authenticated users get a higher limit keyed by userId
  const userId = event.context?.user?.id || event.context?.auth?.user?.userId
  if (userId) {
    if (!check(`user:${userId}`, 300, 60_000)) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please slow down.',
        headers: { 'Retry-After': '60' },
      })
    }
    return
  }

  // Anonymous / public: 120 req/min per IP
  if (!check(`ip:${ip}`, 120, 60_000)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please slow down.',
      headers: { 'Retry-After': '60' },
    })
  }
  } catch (err) {
    // Never let rate limiter errors block legitimate requests
    if ((err as any)?.statusCode === 429) throw err
    console.error('[rate-limit]', err)
  }
})
