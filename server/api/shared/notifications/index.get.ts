// GET /api/user/notifications - Get notifications
import { notificationService } from '~~/layers/profile/server/services/notification.service'
import { requireAuth } from '../../../layers/shared/middleware/requireAuth'
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await notificationService.getNotifications(
      user.id,
      limit,
      offset,
    )
    return { success: true, data: result }
  } catch (error: unknown) {
    console.error('[GET /notifications]', error)
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
