// GET /api/user/audit-logs - Get user's audit logs
import { auditService } from '../../../layers/shared/audit/audit.service'
import { requireAuth } from '../../../layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await auditService.getUserAuditLogs(
      user.userId,
      limit,
      offset,
    )
    return { success: true, data: result }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
