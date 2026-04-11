/**
 * Scheduled task: auto-release seller funds for orders that have been
 * in SHIPPED status for 7+ days with no buyer confirmation.
 *
 * Runs every 6 hours via Nitro scheduled tasks.
 * Register in nuxt.config.ts:
 *   nitro.scheduledTasks: { '0 *\/6 * * *': ['releaseShippedOrders'] }
 */
import { notificationService } from '~~/layers/profile/server/services/notification.service'
import { prisma } from '../utils/db'
import { walletService } from '~~/layers/commerce/server/services/wallet.service'

const AUTO_RELEASE_DAYS = 7

export default defineTask({
  meta: {
    name: 'releaseShippedOrders',
    description:
      'Auto-release seller funds for orders shipped 7+ days ago with no buyer confirmation',
  },
  async run() {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - AUTO_RELEASE_DAYS)

    // Find all SHIPPED, PAID orders where shippedAt is older than 7 days
    const overdueOrders = await prisma.orders.findMany({
      where: {
        status: 'SHIPPED',
        paymentStatus: 'PAID',
        shippedAt: { lte: cutoff },
      },
      select: {
        id: true,
        userId: true,
        orderItem: {
          select: {
            variant: {
              select: {
                product: {
                  select: {
                    seller: { select: { profileId: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!overdueOrders.length) {
      return { result: 'No overdue orders found' }
    }

    let released = 0
    for (const order of overdueOrders) {
      try {
        // Mark as DELIVERED
        await prisma.orders.update({
          where: { id: order.id },
          data: { status: 'DELIVERED' },
        })

        // Release funds
        await walletService.releaseFundsOnDelivery(order.id)

        // Notify buyer
        notificationService
          .createNotification({
            userId: order.userId,
            type: 'ORDER',
            actorId: order.userId,
            message: `Order #${order.id} has been automatically marked as delivered and payment released to the seller after 7 days.`,
          })
          .catch(() => {})

        // Notify each unique seller
        const seen = new Set<string>()
        for (const item of order.orderItem) {
          const sellerId = item.variant?.product?.seller?.profileId
          if (!sellerId || seen.has(sellerId)) continue
          seen.add(sellerId)
          notificationService
            .createNotification({
              userId: sellerId,
              type: 'ORDER',
              actorId: sellerId,
              message: `Order #${order.id} auto-confirmed after 7 days. Funds have been released to your wallet.`,
            })
            .catch(() => {})
        }

        released++
      } catch (e) {
        console.error(`[auto-release] Failed for order #${order.id}:`, e)
      }
    }

    return {
      result: `Released funds for ${released}/${overdueOrders.length} orders`,
    }
  },
})
