// GET /api/user/notifications/unread - Get unread count

import { notificationService } from '~~/layers/profile/server/services/notification.service'
import { requireAuth } from '../../../layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const result = await notificationService.getUnreadCount(user.id)
    return { success: true, data: result }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
