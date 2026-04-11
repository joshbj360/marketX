/**
 * Audit logging for security events
 * Tracks all auth-related activities for compliance and incident response
 */

export enum AuditEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_FAILED_RATE_LIMITED = 'LOGIN_FAILED_RATE_LIMITED',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILED = 'REGISTER_FAILED',
  REGISTER_FAILED_EMAIL_VERIFICATION_FAILED = 'REGISTER_FAILED_EMAIL_VERIFICATION_FAILED',
  REGISTER_SUCCESS_EMAIL_VERIFICATION_FAILED = 'REGISTER_SUCCESS_EMAIL_VERIFICATION_FAILED',
  REGISTER_SUCCESS_EMAIL_VERIFICATION_SENT = 'REGISTER_SUCCESS_EMAIL_VERIFICATION_SENT',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  SELLER_PROFILE_CREATED = 'SELLER_PROFILE_CREATED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  EMAIL_UPDATED = 'EMAIL_UPDATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ROLE_CHANGED = 'ROLE_CHANGED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Backward compatibility for existing code using the object style
export const AUDIT_EVENTS = {
  USER_REGISTERED: AuditEventType.REGISTER_SUCCESS,
  USER_LOGIN: AuditEventType.LOGIN_SUCCESS,
  USER_LOGOUT: AuditEventType.LOGOUT,
  EMAIL_VERIFIED: AuditEventType.EMAIL_VERIFIED,
  PASSWORD_RESET_REQUESTED: AuditEventType.PASSWORD_RESET_REQUESTED,
  PASSWORD_RESET: AuditEventType.PASSWORD_RESET_SUCCESS,
  PASSWORD_CHANGED: AuditEventType.PASSWORD_CHANGED,
  TOKEN_REFRESHED: AuditEventType.TOKEN_REFRESHED,
  ACCOUNT_LOCKED: AuditEventType.ACCOUNT_LOCKED,
  ACCOUNT_UNLOCKED: AuditEventType.ACCOUNT_UNLOCKED,
  PROFILE_UPDATED: AuditEventType.PROFILE_UPDATED,
  SETTINGS_UPDATED: AuditEventType.SETTINGS_UPDATED,
  EMAIL_UPDATED: AuditEventType.EMAIL_UPDATED,
  ACCOUNT_DELETED: AuditEventType.ACCOUNT_DELETED,
  SUSPICIOUS_ACTIVITY: AuditEventType.SUSPICIOUS_ACTIVITY,
  RATE_LIMIT_EXCEEDED: AuditEventType.RATE_LIMIT_EXCEEDED,
  INVALID_TOKEN: AuditEventType.INVALID_TOKEN,
}

export interface AuditLogEntry {
  eventType: AuditEventType | string
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  success?: boolean
  reason?: string
  metadata?: Record<string, any>
  description?: string // Compatibility field
}

/**
 * Log auth event to database
 * This includes checks for suspicious activity
 */
export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    // 1. Store in database
    const data: any = {
      event_type: entry.eventType,
      success: entry.success ?? true,
    }

    if (entry.userId) data.user_id = entry.userId
    if (entry.email) data.email = entry.email
    if (entry.ipAddress) data.ip_address = entry.ipAddress
    if (entry.userAgent) data.user_agent = entry.userAgent
    if (entry.reason || entry.description)
      data.reason = entry.reason || entry.description
    if (entry.metadata) data.metadata = JSON.stringify(entry.metadata)

    await prisma.auditLog.create({ data })

    // 2. Send to external logging service (Stub)
    if (process.env.EXTERNAL_LOG_SERVICE) {
      await logToExternalService(entry)
    }

    // 3. Alert if suspicious activity (e.g. brute force)
    if (
      entry.success === false &&
      entry.eventType === AuditEventType.LOGIN_FAILED
    ) {
      await checkForSuspiciousActivity(entry)
    }
  } catch (error) {
    // Never let logging errors break the main auth flow
    console.error('Failed to log audit event:', error)
  }
}

// Helper alias to match previous codebase calls if necessary
export const createAuditLog = async (
  _prisma: any, // Ignored, we use singleton
  userId: string,
  eventType: string,
  description: string,
  ipAddress: string,
  userAgent: string,
  metadata?: any,
) => {
  return logAuditEvent({
    userId,
    eventType,
    description,
    ipAddress,
    userAgent,
    metadata,
  })
}

/**
 * Check for suspicious patterns
 * Alert if: multiple failed logins in short time from different IPs
 */
async function checkForSuspiciousActivity(entry: AuditLogEntry) {
  if (!entry.email) return

  try {
    // Get recent failed login attempts
    const recentFailures = await prisma.auditLog.findMany({
      where: {
        event_type: AuditEventType.LOGIN_FAILED,
        // Assuming metadata stores email if not in main column, or adapt query
        created_at: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    })

    // Alert if many failures from different IPs (possible botnet/proxy attack)
    const uniqueIps = new Set(
      recentFailures.map((f) => f.ip_address).filter(Boolean),
    )

    if (uniqueIps.size >= 3) {
      await logAuditEvent({
        eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
        email: entry.email,
        reason: `Multiple failed logins from ${uniqueIps.size} different IPs`,
        metadata: { suspicious_ips: Array.from(uniqueIps) },
        success: false,
      })
    }
  } catch (error) {
    console.error('Failed to check suspicious activity:', error)
  }
}

/**
 * Send to external logging service
 * Example: DataDog, Splunk, Grafana Loki
 */
async function logToExternalService(entry: AuditLogEntry) {
  try {
    const logServiceUrl = process.env.LOG_SERVICE_URL
    if (!logServiceUrl) return

    await fetch(logServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LOG_SERVICE_TOKEN}`,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        service: 'auth',
        ...entry,
      }),
    })
  } catch (error) {
    console.error('Failed to send to external logging service:', error)
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: limit,
  })
}

/**
 * Get suspicious activity logs
 */
export async function getSuspiciousActivityLogs(
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
) {
  return prisma.auditLog.findMany({
    where: {
      event_type: AuditEventType.SUSPICIOUS_ACTIVITY,
      created_at: { gte: since },
    },
    orderBy: { created_at: 'desc' },
  })
}
