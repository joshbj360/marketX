// FILE PATH: server/layers/user/services/audit.service.ts

/**
 * Audit Service
 * Logs all user actions for compliance and security
 */

import { auditRepository } from './audit.repository'

interface LogActionArgs {
  userId: string
  action: string
  resource: string
  resourceId: string
  email?: string
  reason?: string
  changes?: any
  ipAddress?: string
  userAgent?: string
}
export const auditService = {
  async logUserAction({
    userId,
    action,
    resource,
    resourceId,
    email,
    reason,
    changes,
    ipAddress,
    userAgent,
  }: LogActionArgs) {
    const auditLog = await auditRepository.createAuditLog({
      userId,
      email: email || '',
      eventType: action,
      reason: reason || '',
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      success: true,
      meta: {
        resource,
        resourceId,
        changes: changes ? JSON.stringify(changes) : null,
      },
    })
    return auditLog
  },

  async getUserAuditLogs(userId: string, limit = 50, offset = 0) {
    const logs = await auditRepository.getAuditLogsByUserId(
      userId,
      limit,
      offset,
    )
    const total = await auditRepository.getAuditLogsCountByUserId(userId)
    return { logs, total, limit, offset }
  },

  async getResourceAuditLogs(resourceId: string, limit = 50, offset = 0) {
    const logs = await auditRepository.getAuditLogsByResourceId(
      resourceId,
      limit,
      offset,
    )
    const total =
      await auditRepository.getAuditLogsCountByResourceId(resourceId)
    return { logs, total, limit, offset }
  },

  async getSystemAuditLogs(limit = 50, offset = 0) {
    const logs = await auditRepository.getAllAuditLogs(limit, offset)
    const total = await auditRepository.getAuditLogsCount()
    return { logs, total, limit, offset }
  },
}
