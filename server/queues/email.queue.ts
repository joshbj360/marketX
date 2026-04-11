/**
 * server/queues/email.queue.ts — Email domain
 *
 * Producer:  emailQueue.enqueue(data)  — call without await in any service
 * Consumer:  BullMQ Worker started by server/plugins/workers.ts on boot
 *
 * BullMQ guarantees:
 *  - Jobs are persisted in Redis until processed
 *  - Failed jobs retry with exponential backoff (3 attempts)
 *  - If the server crashes mid-job, BullMQ reclaims it on restart (stalled jobs)
 *  - Dead-letter: after 3 failures the job moves to the "failed" set (inspectable)
 */

import { Queue, Worker, type Job } from 'bullmq'
import { Resend } from 'resend'
import { queueConnection } from '../utils/queue'

export interface EmailJob {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  type:
    | 'VERIFICATION'
    | 'PASSWORD_RESET'
    | 'WELCOME'
    | 'ORDER_CONFIRMATION'
    | 'GENERAL'
}

const QUEUE_NAME = 'emails'

// ─── Producer ────────────────────────────────────────────────────────────────

const _queue = queueConnection
  ? new Queue<EmailJob>(QUEUE_NAME, {
      connection: queueConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 200 },
      },
    })
  : null

export const emailQueue = {
  /** Fire-and-forget — never await this. */
  enqueue(data: EmailJob): void {
    if (_queue) {
      _queue.add('send', data).catch((e) =>
        console.error('[email.queue] enqueue error:', e),
      )
    } else {
      // Fallback: run inline when Redis not configured
      _sendEmail(data).catch((e) =>
        console.error('[email.queue] inline fallback error:', e),
      )
    }
  },
}

// ─── Shared send helper ───────────────────────────────────────────────────────

async function _sendEmail(data: EmailJob): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email.queue] RESEND_API_KEY not set — email skipped')
    return
  }

  const resend = new Resend(apiKey)
  const senderEmail = process.env.SENDER_EMAIL || 'noreply@marketx.app'

  await resend.emails.send({
    from: senderEmail,
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text,
    replyTo: data.replyTo,
  })
}

// ─── Consumer (Worker) ───────────────────────────────────────────────────────

export function startEmailWorker() {
  if (!queueConnection) return null

  const worker = new Worker<EmailJob>(
    QUEUE_NAME,
    async (job: Job<EmailJob>) => {
      await _sendEmail(job.data)
    },
    {
      connection: queueConnection,
      concurrency: 5, // lower — external Resend API rate limits
    },
  )

  worker.on('failed', (job, err) =>
    console.error(`[email.queue] job ${job?.id} failed:`, err.message),
  )

  return worker
}
