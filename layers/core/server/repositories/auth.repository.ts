/**
 * Auth Repository
 * * Centralizes all authentication-related database operations.
 * Implements secure token generation, session tracking, and audit logging.
 */

import { randomBytes } from 'crypto'

export const authRepository = {
  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  /**
   * Create email verification token
   * Uses cryptographically secure random bytes
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex')

    await prisma.emailVerificationToken.create({
      data: {
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    return token
  },

  /**
   * Verify email token and update user profile
   */
  async verifyEmailToken(token: string): Promise<string | null> {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!record) return null

    // Check if expired
    if (new Date() > record.expires_at) {
      // Clean up expired token
      await prisma.emailVerificationToken
        .delete({ where: { token } })
        .catch(() => null)
      return null
    }

    // Check if already used
    if (record.used_at) return null

    // 1. Mark token as used
    await prisma.emailVerificationToken.update({
      where: { token },
      data: { used_at: new Date() },
    })

    // 2. Mark user profile as verified (Missing method restored)
    await prisma.profile.update({
      where: { id: record.user_id },
      data: { email_verified: true },
    })

    return record.user_id
  },

  // ============================================
  // PASSWORD RESET
  // ============================================

  /**
   * Create password reset token
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex')

    await prisma.passwordResetToken.create({
      data: {
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    })

    return token
  },

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<string | null> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!record) return null
    if (new Date() > record.expires_at) return null
    if (record.used_at) return null

    return record.user_id
  },

  /**
   * Mark password reset token as used and invalidate others
   */
  async usePasswordResetToken(token: string): Promise<string | null> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!record) return null

    // Mark this token as used
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used_at: new Date() },
    })

    // Invalidate other unused tokens for this user (Security Best Practice)
    await prisma.passwordResetToken.updateMany({
      where: {
        user_id: record.user_id,
        id: { not: record.id },
        used_at: null,
      },
      data: { used_at: new Date() },
    })

    return record.user_id
  },

  // ============================================
  // FAILED LOGIN ATTEMPTS & ACCOUNT LOCKOUT
  // ============================================

  // async getFailedAttempts(email: string) {
  //   return prisma.failedLoginAttempt.findUnique({
  //     where: { email: email.toLowerCase() },
  //   })
  // },

  // async incrementFailedAttempts(email: string, user_id?: string, ipAddress?: string) {
  //   // Atomic upsert to prevent race conditions
  //   return prisma.failedLoginAttempt.upsert({
  //     where: { email: email.toLowerCase() },
  //     update: {
  //       attempt_count: { increment: 1 },
  //       last_attempt_at: new Date(),
  //     },
  //     create: {
  //       user_id: user_id,
  //       email: email.toLowerCase(),
  //       ip_address: ipAddress,
  //       attempt_count: 1,
  //       last_attempt_at: new Date(),
  //     },
  //   })
  // },

  // async clearFailedAttempts(email: string) {
  //   return prisma.failedLoginAttempt.delete({
  //     where: { email: email.toLowerCase() },
  //   }).catch(() => null)
  // },

  // async lockAccount(user_id: string, email: string, lockoutUntil: Date) {
  //   return prisma.failedLoginAttempt.upsert({
  //     where: { email: email.toLowerCase() },
  //     update: { locked_until: lockoutUntil },
  //     create: {
  //       user_id: user_id,
  //       email: email.toLowerCase(),
  //       attempt_count: 5,
  //       locked_until: lockoutUntil,
  //       last_attempt_at: new Date(),
  //     },
  //   })
  // },

  // async isAccountLocked(email: string): Promise<boolean> {
  //   const attempt = await prisma.failedLoginAttempt.findUnique({
  //     where: { email: email.toLowerCase() },
  //   })

  //   if (!attempt?.locked_until) return false

  //   // Check if lock has expired
  //   if (new Date() > attempt.locked_until) {
  //     await this.clearFailedAttempts(email)
  //     return false
  //   }

  //   return true
  // },

  // ============================================
  // AUDIT LOGGING
  // ============================================

  /**
   * Create a new audit log entry (Missing method restored)
   */
  async createAuditLog(data: {
    userId: string
    email: string
    eventType: string
    reason?: string
    ipAddress?: string
    userAgent?: string
    success: boolean
  }) {
    return prisma.auditLog.create({
      data: {
        email: data.email,
        user_id: data.userId,
        event_type: data.eventType,
        reason: data.reason,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        success: data.success,
      },
    })
  },

  async getUserAuditLogs(userId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    })
  },

  async getAuditLogsByEvent(eventType: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: { event_type: eventType },
      orderBy: { created_at: 'desc' },
      take: limit,
    })
  },

  // ============================================
  // CLEANUP TASKS
  // ============================================

  async cleanupExpiredTokens() {
    const now = new Date()
    await Promise.all([
      prisma.emailVerificationToken.deleteMany({
        where: { expires_at: { lt: now } },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { expires_at: { lt: now } },
      }),
    ])
  },

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  async createSession(data: {
    userId: string
    refreshToken: string
    ip: string
    userAgent: string
    device?: string
    country?: string
  }) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    return prisma.session.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshToken,
        ip: data.ip,
        userAgent: data.userAgent,
        device: data.device,
        country: data.country,
        expiresAt,
        lastUsedAt: new Date(),
      },
    })
  },

  // Compatibility alias
  async getSession(refreshToken: string) {
    return this.getSessionByRefreshToken(refreshToken)
  },

  async getSessionByRefreshToken(refreshToken: string) {
    return prisma.session.findUnique({
      where: { refreshToken },
    })
  },

  async getSessionById(sessionId: string) {
    return prisma.session.findUnique({
      where: { id: sessionId },
    })
  },

  async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        device: true,
        country: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    })
  },

  async revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    })
  },

  async revokeAllSessions(userId: string) {
    const result = await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    return result.count
  },

  async updateSessionLastUsed(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    })
  },

  async deleteExpiredSessions() {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    return result.count
  },

  async countActiveSessions(userId: string) {
    return prisma.session.count({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    })
  },

  async getOldSessions(daysOld: number = 7) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
    return prisma.session.findMany({
      where: { createdAt: { lt: cutoffDate } },
    })
  },
}
