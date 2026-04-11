// FILE PATH: server/layers/user/repositories/notification.repository.ts

/**
 * Notification Repository
 * Database queries for notifications
 */

import type { NotificationType } from '@prisma/client'

export interface CreateNotificationData {
  userId: string
  type: NotificationType | string
  actorId?: string | null
  message: string
  postId?: string | null
  commentId?: string | null
  conversationId?: string | null
  orderId?: number | null
  productId?: number | null
  read?: boolean
}

// Shared include block so every query returns the same shape
const notificationInclude = {
  actor: { select: { id: true, username: true, avatar: true } },
  product: { select: { id: true, slug: true, title: true } },
  order: { select: { id: true } },
  conversation: { select: { id: true } },
} as const

export const notificationRepository = {
  async createNotification(data: CreateNotificationData) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as NotificationType,
        actorId: data.actorId ?? undefined,
        message: data.message,
        postId: data.postId ?? undefined,
        commentId: data.commentId ?? undefined,
        conversationId: data.conversationId ?? undefined,
        orderId: data.orderId ?? undefined,
        productId: data.productId ?? undefined,
        read: data.read ?? false,
      },
      include: notificationInclude,
    })
  },

  async getNotificationById(notificationId: number) {
    return await prisma.notification.findUnique({
      where: { id: notificationId },
      include: notificationInclude,
    })
  },

  async getNotificationsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ) {
    return await prisma.notification.findMany({
      where: { userId },
      include: notificationInclude,
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getNotificationsCountByUserId(userId: string) {
    return await prisma.notification.count({
      where: { userId },
    })
  },

  async getUnreadCountByUserId(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false },
    })
  },

  async updateNotification(notificationId: number, data: { read?: boolean }) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data,
      include: notificationInclude,
    })
  },

  async markAllAsReadByUserId(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  },

  async deleteNotification(notificationId: number) {
    return await prisma.notification.delete({
      where: { id: notificationId },
    })
  },
}
