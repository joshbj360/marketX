// GET /api/user/audit-logs/resource/[id] - Get resource audit logs
import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditService } from '../../../layers/shared/audit/audit.service'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)

    const result = await auditService.getResourceAuditLogs(id, limit, offset)
    return { success: true, data: result }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
