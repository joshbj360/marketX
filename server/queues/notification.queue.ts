/**
 * server/queues/notification.queue.ts — Notification domain
 *
 * Producer:  notificationQueue.enqueue(data)  — call without await in any service
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
import {
  CreateNotificationArgs,
  notificationService,
} from '~~/layers/profile/server/services/notification.service'

export type NotificationJob = CreateNotificationArgs & {
  orderId?: number
  productId?: number
}

const QUEUE_NAME = 'notifications'

// ─── Producer ────────────────────────────────────────────────────────────────

const _queue = queueConnection
  ? new Queue<NotificationJob>(QUEUE_NAME, {
      connection: queueConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      },
    })
  : null

export const notificationQueue = {
  /** Fire-and-forget — never await this. */
  enqueue(data: NotificationJob): void {
    if (_queue) {
      _queue.add('notify', data).catch((e) =>
        console.error('[notification.queue] enqueue error:', e),
      )
    } else {
      // Fallback: run inline when Redis not configured
      notificationService.createNotification(data).catch((e) =>
        console.error('[notification.queue] inline fallback error:', e),
      )
    }
  },
}

// ─── Consumer (Worker) ───────────────────────────────────────────────────────

export function startNotificationWorker() {
  if (!queueConnection) return null

  const worker = new Worker<NotificationJob>(
    QUEUE_NAME,
    async (job: Job<NotificationJob>) => {
      await notificationService.createNotification(job.data)
    },
    {
      connection: queueConnection,
      concurrency: 20,
    },
  )

  worker.on('failed', (job, err) =>
    console.error(
      `[notification.queue] job ${job?.id} failed:`,
      err.message,
    ),
  )

  return worker
}
