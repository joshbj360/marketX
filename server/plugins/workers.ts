/**
 * server/plugins/workers.ts
 *
 * Starts all BullMQ domain workers when Nitro boots.
 * Each worker runs in-process and processes jobs as they arrive.
 *
 * Workers only start when QUEUE_REDIS_URL is set.
 * If Redis is not configured, queues fall back to inline execution automatically.
 */

import { startAuditWorker } from '../queues/audit.queue'
import { startNotificationWorker } from '../queues/notification.queue'
import { startEmailWorker } from '../queues/email.queue'
import { startPodReminderCron } from '../queues/pod-reminder.queue'

export default defineNitroPlugin(() => {
  const audit = startAuditWorker()
  const notification = startNotificationWorker()
  const email = startEmailWorker()

  if (audit || notification || email) {
    console.log('[workers] BullMQ workers started:', [
      audit && 'audit',
      notification && 'notification',
      email && 'email',
    ]
      .filter(Boolean)
      .join(', '))
  } else {
    console.log(
      '[workers] QUEUE_REDIS_URL not set — workers disabled, jobs run inline',
    )
  }

  // POD reminder cron runs regardless of Redis (uses setInterval + inline notifications)
  startPodReminderCron()
})
