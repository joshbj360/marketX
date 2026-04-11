/**
 * server/utils/queue.ts
 *
 * Shared BullMQ Redis connection.
 * Uses a SEPARATE Redis instance from Upstash (which is cache-only).
 * BullMQ requires a standard Redis TCP connection — not REST/HTTP.
 *
 * Set QUEUE_REDIS_URL in .env (Railway, Redis Cloud, or local Redis).
 * If not set, queues are disabled and jobs run inline as a fallback.
 */

import { ConnectionOptions } from 'bullmq'

const url = process.env.QUEUE_REDIS_URL

if (!url) {
  console.warn(
    '[queue] QUEUE_REDIS_URL not set — BullMQ disabled, jobs run inline',
  )
}

/**
 * Shared connection options for all BullMQ Queues and Workers.
 * `maxRetriesPerRequest: null` is required by BullMQ.
 */
export const queueConnection: ConnectionOptions | null = url
  ? { url, maxRetriesPerRequest: null, enableReadyCheck: false }
  : null
