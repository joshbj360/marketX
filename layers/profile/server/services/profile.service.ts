// FILE PATH: server/layers/user/services/user.service.ts

import { authRepository } from '~~/layers/core/server/repositories/auth.repository'
import { auditQueue } from '~~/server/queues/audit.queue'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { profileRepository } from '../repositories/profile.repository'

import { UserError } from '../types/user.types'

export const profileService = {
  // ==================== GET PROFILE ====================

  async getProfile(userId: string) {
    const profile = await profileRepository.findByIdFull(userId)

    if (!profile) {
      throw new UserError('USER_NOT_FOUND', 'User not found', 404)
    }

    const links = profile.links as any[] | null
    const websiteUrl = Array.isArray(links)
      ? links.find((l: any) => l.type === 'website')?.url ?? null
      : null

    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      bio: profile.bio || undefined,
      avatar: profile.avatar || undefined,
      location: profile.location || undefined,
      stateOfResidence: profile.location || undefined,
      links: profile.links || undefined,
      profileUrl: websiteUrl || undefined,
      emailVerified: profile.email_verified,
      role: profile.role,
      sellerProfile: profile.sellerProfile?.[0] ?? undefined,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  },

  async getPublicProfile(userId: string) {
    const profile = await profileRepository.getPublicProfile(userId)
    if (!profile) {
      throw new UserError('USER_NOT_FOUND', 'User not found', 404)
    }
    return profile
  },

  /**
   * Get complete profile stats
   */
  async getProfileStats(userId: string) {
    return await profileRepository.getCompleteProfileStats(userId)
  },

  // ==================== UPDATE PROFILE ====================

  async updateProfile(
    userId: string,
    data: {
      username?: string
      bio?: string
      avatar?: string
      location?: string
      links?: any
    },
    ipAddress: string,
    userAgent: string,
  ) {
    if (data.username) {
      const exists = await profileRepository.checkUsernameExists(
        data.username,
        userId,
      )
      if (exists) {
        throw new UserError('USERNAME_EXISTS', 'Username is already taken', 400)
      }
    }

    const updated = await profileRepository.updateProfile(userId, data)

    // ALIGNED: Audit Log (Object Pattern)
    auditQueue.enqueue({
      userId,
      action: 'PROFILE_UPDATED',
      resource: 'Profile',
      resourceId: userId,
      reason: 'User updated profile details',
      changes: data,
      ipAddress,
      userAgent,
    })

    return updated
  },

  // ==================== SETTINGS ====================

  async getSettings(userId: string) {
    return profileRepository.getOrCreateSettings(userId)
  },

  async updateSettings(
    userId: string,
    data: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const updated = await profileRepository.updateSettings(userId, data)

    // ALIGNED: Audit Log
    auditQueue.enqueue({
      userId,
      action: 'SETTINGS_UPDATED',
      resource: 'Settings',
      resourceId: userId,
      reason: 'User updated account settings',
      changes: data,
      ipAddress,
      userAgent,
    })

    return updated
  },

  // ==================== EMAIL MANAGEMENT ====================

  async updateEmail(
    userId: string,
    newEmail: string,
    currentPassword: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await profileRepository.findByIdFull(userId)
    if (!user) throw new UserError('USER_NOT_FOUND', 'User not found', 404)

    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.password_hash!,
    )
    if (!isPasswordValid) {
      throw new UserError(
        'INVALID_PASSWORD',
        'Current password is incorrect',
        401,
      )
    }

    const emailExists = await profileRepository.checkEmailExists(
      newEmail,
      userId,
    )
    if (emailExists)
      throw new UserError('EMAIL_EXISTS', 'Email is already in use', 400)

    // 1. Update Email
    await profileRepository.updateEmail(userId, newEmail.toLowerCase())

    // 2. SECURITY: Trigger verification for the NEW email
    // This was the "TODO" in your previous code—now explicitly included
    await authRepository.createEmailVerificationToken(userId)

    // 3. ALIGNED: Audit Log
    auditQueue.enqueue({
      userId,
      action: 'EMAIL_UPDATED',
      resource: 'Profile',
      resourceId: userId,
      reason: `Email changed from ${user.email} to ${newEmail}`,
      ipAddress,
      userAgent,
    })

    // 4. ALIGNED: Notification
    notificationQueue.enqueue({
      userId,
      type: 'MESSAGE',
      actorId: userId,
      message: `Verification required: We've sent a link to ${newEmail} to confirm your change.`,
    })

    return { message: 'Email updated. Please verify your new email address.' }
  },

  // ==================== PASSWORD MANAGEMENT ====================

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await profileRepository.findByIdFull(userId)
    if (!user) throw new UserError('USER_NOT_FOUND', 'User not found', 404)

    // 1. Verify current password
    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.password_hash!,
    )
    if (!isPasswordValid) {
      throw new UserError(
        'INVALID_PASSWORD',
        'Current password is incorrect',
        401,
      )
    }

    // 2. Hash and Update
    const hashedPassword = await hashPassword(newPassword)
    await profileRepository.updatePassword(userId, hashedPassword)

    // 3. SECURITY: Revoke all existing sessions
    // This forces all other devices to log out immediately
    await authRepository.revokeAllSessions(userId)

    // 4. ALIGNED: Audit Log
    auditQueue.enqueue({
      userId,
      action: 'PASSWORD_CHANGED',
      resource: 'Profile',
      resourceId: userId,
      reason: 'User changed account password and revoked all sessions',
      ipAddress,
      userAgent,
    })

    // 5. ALIGNED: Notification
    notificationQueue.enqueue({
      userId,
      type: 'MESSAGE',
      actorId: userId,
      message: `Security Alert: Your password has been changed. All other sessions have been logged out.`,
    })

    return { message: 'Password changed successfully. Please log in again.' }
  },

  // ==================== ACCOUNT DELETION ====================

  async deleteAccount(
    userId: string,
    password: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await profileRepository.findByIdFull(userId)
    if (!user) throw new UserError('USER_NOT_FOUND', 'User not found', 404)

    const isPasswordValid = await verifyPassword(password, user.password_hash!)
    if (!isPasswordValid) {
      throw new UserError('INVALID_PASSWORD', 'Password is incorrect', 401)
    }

    // 1. Audit Log BEFORE deletion (to maintain FK integrity in the log)
    auditQueue.enqueue({
      userId,
      action: 'ACCOUNT_DELETED',
      resource: 'Profile',
      resourceId: userId,
      reason: 'User permanently deleted their account',
      ipAddress,
      userAgent,
    })

    // 2. SECURITY: Clear sessions and delete
    await authRepository.revokeAllSessions(userId)
    await profileRepository.deleteAccount(userId)

    return { message: 'Account deleted successfully' }
  },
}
