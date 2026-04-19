// FILE PATH: server/layers/user/services/notification.service.ts

/**
 * Notification Service
 * Handles: Creating and managing user notifications with Type Mapping
 */

import { UserError } from '../types/user.types'
import { notificationRepository } from '../repositories/notification.repository'
import { sseConnections } from '~~/server/utils/connections'

// Define the interface for the Create Notification object
export interface CreateNotificationArgs {
  userId: string
  type: string
  actorId: string
  message: string
  postId?: string
  commentId?: string
  conversationId?: string
  orderId?: number
  productId?: number
}

// Map internal notification types to Prisma enum values
const typeMap: Record<string, string> = {
  POST_CREATED: 'NEW_POST',
  POST_LIKE: 'POST_LIKE',
  POST_COMMENT: 'NEW_COMMENT',
  COMMENT_LIKE: 'COMMENT_LIKE',
  COMMENT_REPLY: 'REPLY',
  FOLLOW: 'NEW_FOLLOWER',
  MESSAGE: 'GENERAL',
  PRODUCT_SHARE: 'PRODUCT_SHARE',
  PRODUCT_REVIEW: 'REVIEW',
  PRODUCT_COMMENT: 'NEW_COMMENT',
  ORDER: 'ORDER',
}

export const notificationService = {
  /**
   * Creates a notification. Uses an object to avoid positional argument errors.
   */
  async createNotification(args: CreateNotificationArgs) {
    const {
      userId,
      type,
      actorId,
      message,
      postId,
      commentId,
      conversationId,
      orderId,
      productId,
    } = args

    try {
      // Map service type to Prisma enum value
      const mappedType = typeMap[type] || 'GENERAL'

      const notification = await notificationRepository.createNotification({
        userId,
        type: mappedType,
        actorId,
        message: message || `New ${type} notification`,
        postId,
        commentId,
        conversationId,
        orderId,
        productId,
        read: false,
      })

      // Push to the user's open SSE stream if they are currently online
      // This is fire-and-forget — if they're offline the notification is
      // still in the DB and will appear next time they load the app
      sseConnections.send(userId, 'notification', notification)

      return notification
    } catch (error: unknown) {
      // Notifications are non-blocking/non-critical. Log error but don't crash.
      logger.error('Error creating notification:', error)
      return null
    }
  },

  async getNotifications(userId: string, limit = 20, offset = 0) {
    const notifications = await notificationRepository.getNotificationsByUserId(
      userId,
      limit,
      offset,
    )
    const total =
      await notificationRepository.getNotificationsCountByUserId(userId)
    return { notifications, total, limit, offset }
  },

  async getUnreadCount(userId: string) {
    const count = await notificationRepository.getUnreadCountByUserId(userId)
    return { count }
  },

  async getNotificationById(notificationId: number, userId: string) {
    const notification =
      await notificationRepository.getNotificationById(notificationId)
    if (!notification)
      throw new UserError(
        'NOTIFICATION_NOT_FOUND',
        'Notification not found',
        404,
      )

    if (notification.userId !== userId) {
      throw new UserError('FORBIDDEN', 'Access denied', 403)
    }

    return notification
  },

  async markAsRead(notificationId: number, userId: string) {
    // First verify ownership
    await this.getNotificationById(notificationId, userId)

    const updated = await notificationRepository.updateNotification(
      notificationId,
      { read: true },
    )
    return updated
  },

  async markAllAsRead(userId: string) {
    return await notificationRepository.markAllAsReadByUserId(userId)
  },

  async deleteNotification(notificationId: number, userId: string) {
    // First verify ownership
    await this.getNotificationById(notificationId, userId)

    await notificationRepository.deleteNotification(notificationId)
    return { message: 'Notification deleted successfully' }
  },
}
