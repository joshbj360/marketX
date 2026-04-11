// DELETE /api/user/notifications/[id] - Delete notification
import { notificationService } from '~~/layers/profile/server/services/notification.service'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '../../../../layers/shared/middleware/requireAuth'


export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const idParam = getRouterParam(event, 'id')
    if (!idParam) throw new UserError('INVALID_ID', 'ID is required', 400)

    // 2. Safe Parse
    const notificationId = parseInt(idParam, 10)

    // 3. Validate it's a real number (and not NaN)
    if (isNaN(notificationId)) {
      throw new UserError('INVALID_ID', 'ID must be a valid number', 400)
    }

    const result = await notificationService.deleteNotification(
      notificationId,
      user.id,
    )
    return { success: true, data: result }
  } catch (error: unknown) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
