/**
 * server/utils/cache.ts
 *
 * Thin Redis wrapper using Upstash.
 *
 * If UPSTASH_REDIS_REST_URL is not set (local dev without Redis),
 * every operation is a no-op and `remember()` always falls through
 * to the DB. Zero crashes, zero config required for dev.
 *
 * Usage:
 *   const data = await remember('feed:posts:page:0', 120, () => db query)
 *   await bust('feed:posts:page:0')
 *   await bust('feed:posts:page:*')   ← pattern bust (scans keys)
 */

import { Redis } from '@upstash/redis'

// ─── Client ──────────────────────────────────────────────────────────────────

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

// Only initialise Redis if credentials are present
const redis = url && token ? new Redis({ url, token }) : null

if (!redis) {
  console.warn(
    '[cache] Upstash not configured — caching disabled (DB fallback active)',
  )
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Get a cached value, or run `fn` to compute it, store it, then return it.
 *
 * @param key   - Redis key (e.g. 'feed:posts:page:0')
 * @param ttl   - Seconds until the key expires
 * @param fn    - Async function that returns the fresh value from DB
 */
export async function remember<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T> {
  if (!redis) return fn()

  try {
    const cached = await redis.get<T>(key)
    if (cached !== null && cached !== undefined) return cached

    const fresh = await fn()
    // Store as JSON string; Upstash SDK handles serialisation
    await redis.set(key, fresh, { ex: ttl })
    return fresh
  } catch (err) {
    // Redis error → fall through to DB, never crash the request
    console.error('[cache] remember error:', err)
    return fn()
  }
}

/**
 * Delete one or more cache keys.
 * Accepts exact keys or a glob pattern (e.g. 'feed:posts:page:*').
 */
export async function bust(...keys: string[]): Promise<void> {
  if (!redis) return

  try {
    const resolved: string[] = []

    for (const key of keys) {
      if (key.includes('*')) {
        // Pattern bust — scan for matching keys then delete them
        let cursor = 0
        do {
          const [nextCursor, found] = await redis.scan(cursor, {
            match: key,
            count: 100,
          })
          cursor = Number(nextCursor)
          resolved.push(...found)
        } while (cursor !== 0)
      } else {
        resolved.push(key)
      }
    }

    if (resolved.length) await redis.del(...resolved)
  } catch (err) {
    console.error('[cache] bust error:', err)
  }
}

/**
 * Set a short-lived flag — used for the "creator bypass" pattern.
 * After creating content, the creator's next feed request skips cache
 * so they see their own post immediately.
 */
export async function setCreatorBypass(userId: string): Promise<void> {
  if (!redis) return
  try {
    await redis.set(`creator:bypass:${userId}`, '1', { ex: 30 })
  } catch (err) {
    console.error('[cache] setCreatorBypass error:', err)
  }
}

/**
 * Check and consume the creator bypass flag.
 * Returns true once then deletes the key (one-shot bypass).
 */
export async function consumeCreatorBypass(userId: string): Promise<boolean> {
  if (!redis) return false
  try {
    const val = await redis.getdel(`creator:bypass:${userId}`)
    return val === '1'
  } catch {
    return false
  }
}
