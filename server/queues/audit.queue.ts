/**
 * server/queues/audit.queue.ts — Audit log domain
 *
 * Producer:  auditQueue.enqueue(data)  — call without await in any service
 * Consumer:  BullMQ Worker started by server/plugins/workers.ts on boot
 *
 * BullMQ guarantees:
 *  - Jobs are persisted in Redis until processed
 *  - Failed jobs retry with exponential backoff (3 attempts)
 *  - If the server crashes mid-job, BullMQ reclaims it on restart (stalled jobs)
 *  - Dead-letter: after 3 failures the job moves to the "failed" set (inspectable)
 */

import { Queue, Worker, type Job } from 'bullmq'
import { queueConnection } from '../utils/queue'
import { auditService } from '../layers/shared/audit/audit.service'

export interface AuditJob {
  userId: string
  action: string
  resource: string
  resourceId: string
  email?: string
  reason?: string
  changes?: any
  ipAddress?: string
  userAgent?: string
}

const QUEUE_NAME = 'audit'

// ─── Producer ────────────────────────────────────────────────────────────────

const _queue = queueConnection
  ? new Queue<AuditJob>(QUEUE_NAME, {
      connection: queueConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      },
    })
  : null

export const auditQueue = {
  /** Fire-and-forget — never await this. */
  enqueue(data: AuditJob): void {
    if (_queue) {
      _queue.add('log', data).catch((e) =>
        console.error('[audit.queue] enqueue error:', e),
      )
    } else {
      // Fallback: run inline when Redis not configured
      auditService.logUserAction(data).catch((e) =>
        console.error('[audit.queue] inline fallback error:', e),
      )
    }
  },
}

// ─── Consumer (Worker) ───────────────────────────────────────────────────────

export function startAuditWorker() {
  if (!queueConnection) return null

  const worker = new Worker<AuditJob>(
    QUEUE_NAME,
    async (job: Job<AuditJob>) => {
      await auditService.logUserAction(job.data)
    },
    {
      connection: queueConnection,
      concurrency: 10,
    },
  )

  worker.on('completed', (job) =>
    console.log(`[audit.queue] ✓ job ${job.id} (${job.data.action})`),
  )

  worker.on('failed', (job, err) =>
    console.error(`[audit.queue] job ${job?.id} failed:`, err.message),
  )

  return worker
}
