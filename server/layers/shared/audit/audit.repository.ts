// FILE PATH: server/layers/user/repositories/audit.repository.ts

export const auditRepository = {
  async createAuditLog(data: {
    userId: string
    email: string
    eventType: string
    reason?: string
    ipAddress?: string | null
    userAgent?: string | null
    success: boolean
    meta?: any
  }) {
    return await prisma.auditLog.create({
      data: {
        id: crypto.randomUUID(),
        email: data.email,
        user_id: data.userId,
        event_type: data.eventType,
        reason: data.reason,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        success: data.success,
        metadata: data.meta || null,
      },
    })
  },

  async getAuditLogsByUserId(user_id: string, limit: number, offset: number) {
    return await prisma.auditLog.findMany({
      where: { user_id },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getAuditLogsCountByUserId(user_id: string) {
    return await prisma.auditLog.count({ where: { user_id } })
  },

  async getAuditLogsByResourceId(id: string, limit: number, offset: number) {
    return await prisma.auditLog.findMany({
      where: { id },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getAuditLogsCountByResourceId(id: string) {
    return await prisma.auditLog.count({ where: { id } })
  },

  async getAllAuditLogs(limit: number, offset: number) {
    return await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getAuditLogsCount() {
    return await prisma.auditLog.count()
  },
}
// FILE PATH: server/layers/user/repositories/notification.repository.ts

export const notificationRepository = {
  async createNotification(data: any) {
    return await prisma.notification.create({ data })
  },

  async getNotificationById(notificationId: any) {
    return await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { actor: true },
    })
  },

  async getNotificationsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ) {
    return await prisma.notification.findMany({
      where: { userId },
      include: { actor: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getNotificationsCountByUserId(userId: string) {
    return await prisma.notification.count({ where: { userId } })
  },

  async getUnreadCountByUserId(userId: string) {
    return await prisma.notification.count({ where: { userId, read: false } })
  },

  async updateNotification(notificationId: any, data: any) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data,
      include: { actor: true },
    })
  },

  async markAllAsReadByUserId(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  },

  async deleteNotification(notificationId: any) {
    return await prisma.notification.delete({ where: { id: notificationId } })
  },
}
