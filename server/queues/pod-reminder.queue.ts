/**
 * server/queues/pod-reminder.queue.ts
 *
 * Runs every hour. Finds POD orders that have been in CONFIRMED or SHIPPED
 * state for more than pod_delivery_days without buyer confirming delivery,
 * then notifies both parties.
 *
 * Also re-pings at the 3-day mark specifically (per business rule).
 */

import { notificationQueue } from './notification.queue'

const CHECK_INTERVAL_MS = 60 * 60 * 1000 // every hour

async function runPodReminders() {
  try {
    const now = new Date()

    // Find POD orders that are CONFIRMED or SHIPPED and past their delivery window
    const staleOrders = await prisma.orders.findMany({
      where: {
        paymentMethod: 'pay_on_delivery',
        paymentStatus: 'SHIPPING_PAID',
        status: { in: ['CONFIRMED', 'SHIPPED'] },
        // At least 3 days since order was placed or shipped
        OR: [
          {
            status: 'SHIPPED',
            shippedAt: {
              lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            },
          },
          {
            status: 'CONFIRMED',
            created_at: {
              lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
      include: {
        orderItem: {
          take: 1,
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    seller: { select: { profileId: true, pod_delivery_days: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    for (const order of staleOrders) {
      const sellerId = order.orderItem[0]?.variant?.product?.seller?.profileId
      const deliveryDays = order.orderItem[0]?.variant?.product?.seller?.pod_delivery_days ?? 3

      const referenceDate = order.status === 'SHIPPED' && order.shippedAt
        ? order.shippedAt
        : order.created_at
      const daysSince = Math.floor(
        (now.getTime() - new Date(referenceDate).getTime()) / (24 * 60 * 60 * 1000),
      )

      // Only notify at the 3-day mark and at the delivery-days mark (avoid spamming)
      if (daysSince !== 3 && daysSince !== deliveryDays) continue

      // Notify buyer
      notificationQueue.enqueue({
        userId: order.userId,
        type: 'ORDER',
        actorId: order.userId,
        orderId: order.id,
        message: order.status === 'SHIPPED'
          ? `📦 Your POD order #${order.id} was shipped ${daysSince} day(s) ago. Have you received it? Please confirm delivery in the app.`
          : `⏳ Your POD order #${order.id} is still being prepared. Expected delivery: ${deliveryDays} day(s). We'll keep you updated.`,
      })

      // Notify seller
      if (sellerId) {
        notificationQueue.enqueue({
          userId: sellerId,
          type: 'ORDER',
          actorId: sellerId,
          orderId: order.id,
          message: order.status === 'CONFIRMED'
            ? `⚠️ POD order #${order.id} has been waiting ${daysSince} day(s) without shipping. Please update the order status.`
            : `⚠️ POD order #${order.id} was shipped ${daysSince} day(s) ago but delivery hasn't been confirmed. Please follow up with your dispatch.`,
        })
      }
    }

    if (staleOrders.length > 0) {
      console.log(`[pod-reminder] Sent reminders for ${staleOrders.length} stale POD order(s)`)
    }
  } catch (e) {
    console.error('[pod-reminder] Error running POD reminders:', e)
  }
}

let _interval: ReturnType<typeof setInterval> | null = null

export function startPodReminderCron() {
  if (_interval) return
  // Run once on startup (with a small delay to let DB connect)
  setTimeout(runPodReminders, 30_000)
  _interval = setInterval(runPodReminders, CHECK_INTERVAL_MS)
  console.log('[pod-reminder] POD reminder cron started (hourly)')
}
