// POST /api/commerce/orders/:id/cancel

import { orderService } from '~~/layers/commerce/server/services/order.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { emailQueue } from '~~/server/queues/email.queue'
import { buildOrderCancelledSellerEmail } from '~~/server/utils/email/emailService'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = parseInt(getRouterParam(event, 'id') || '')
    if (isNaN(id))
      throw new UserError('INVALID_ID', 'Order ID must be a number', 400)
    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    const result = await orderService.cancelOrder(
      id,
      user.id,
      ipAddress,
      userAgent,
    )

    // Notify each unique seller (non-blocking)
    prisma.orders.findUnique({
      where: { id },
      select: {
        orderItem: {
          select: {
            variant: {
              select: {
                product: {
                  select: {
                    seller: { select: { profileId: true, store_name: true } },
                  },
                },
              },
            },
          },
        },
      },
    }).then(async (o) => {
      if (!o) return
      const sellers = new Map<string, string>()
      for (const item of o.orderItem) {
        const s = item.variant.product.seller
        if (s?.profileId) sellers.set(s.profileId, s.store_name || 'your store')
      }
      if (!sellers.size) return

      const sellerUsers = await prisma.user.findMany({
        where: { id: { in: [...sellers.keys()] } },
        select: { id: true, email: true },
      })

      for (const su of sellerUsers) {
        const storeName = sellers.get(su.id) || 'your store'
        notificationQueue.enqueue({
          userId: su.id,
          type: 'ORDER',
          actorId: user.id,
          orderId: id,
          message: `Order #${id} has been cancelled by the buyer.`,
        })
        const { subject, html, text } = buildOrderCancelledSellerEmail(id, storeName)
        emailQueue.enqueue({ to: su.email, subject, html, text, type: 'GENERAL' })
      }
    }).catch((e) => logger.logError('[cancel notify sellers]', e))

    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({ statusCode: error.status, statusMessage: error.message })
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
