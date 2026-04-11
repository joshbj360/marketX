// FILE PATH: server/layers/auth/services/auth.service.ts

/**
 * Auth Service
 * Handles authentication business logic
 * Uses in-memory rate limiting (not database)
 */

import RATE_LIMITS from '~~/server/config/rateLimits'
import { authRepository } from '../repositories/auth.repository'
import { AuthError } from '../types/auth.types'
import type { IAuthResponse as AuthResponse } from '~~/shared/types/auth'
import {
  sendVerificationEmail as sendVerifyEmail,
  sendPasswordResetEmail as sendResetEmail,
} from '#imports'

type OAuthProvider = 'google' | 'facebook' | 'tiktok'

const normalizeUsername = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 20)

const createUniqueUsername = async (seed: string) => {
  const fallback = `user_${Math.random().toString(36).slice(2, 8)}`
  let base = normalizeUsername(seed) || fallback
  if (base.length < 3) base = `${base}${Math.random().toString(36).slice(2, 5)}`
  base = base.slice(0, 20)

  let candidate = base
  let attempt = 0
  while (attempt < 10) {
    const exists = await prisma.profile.findFirst({
      where: { username: candidate },
      select: { id: true },
    })
    if (!exists) return candidate
    attempt += 1
    const suffix = Math.random().toString(36).slice(2, 5)
    candidate = `${base.slice(0, Math.max(3, 20 - suffix.length))}${suffix}`
  }

  return `user_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`
}

export const authService = {
  // ==================== REGISTRATION ====================

  /**
   * Handles user registration requests with security best practices.
   *
   * Validates registration credentials, manages rate limiting and account locking,
   * hashes password securely, creates user account, creates email verification token,
   * sends verification email, and audits user registration.
   *
   * @param email - User email address
   * @param username - User username
   * @param password - User password
   * @param ipAddress - User IP address
   * @param userAgent - User agent
   * @param role - User role (user or seller)
   * @returns Promise resolving to registration response with user data
   * @throws {Error} 400 - Invalid input validation error
   * @throws {Error} 401 - Authentication failed (invalid credentials, locked account, etc.)
   * @throws {Error} 429 - Rate limit exceeded
   * @throws {Error} 500 - Unexpected server error
   */
  async register(
    email: string,
    username: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    role: 'user' | 'seller' = 'user',
  ) {
    email = email.toLowerCase()

    // 1. Rate Limit (By IP to prevent bot spam)
    const rateLimit = checkRateLimit(`register:${ipAddress}`, {
      windowMs: RATE_LIMITS.REGISTER.windowMs,
      maxAttempts: RATE_LIMITS.REGISTER.maxAttempts,
      lockoutMs: RATE_LIMITS.REGISTER.lockoutMs,
      keyPrefix: RATE_LIMITS.REGISTER.keyPrefix,
    })

    if (!rateLimit.allowed) {
      const secondsLeft =
        rateLimit.lockedUntilMs ||
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)

      throw new AuthError(
        rateLimit.locked ? 'ACCOUNT_LOCKED' : 'RATE_LIMIT_EXCEEDED',
        rateLimit.locked
          ? `Account is locked. Try again in ${secondsLeft} seconds`
          : `Too many attempts. Try again in ${secondsLeft} seconds`,
        429,
      )
    }

    // 2. Check duplicate user
    const existingUser = await prisma.profile.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username'
      throw new AuthError('USER_EXISTS', `${field} already in use`, 400)
    }

    // 3. Hash password and create user
    const hashedPassword = await hashPassword(password)

    const user = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        email,
        username,
        password_hash: hashedPassword,
        role,
      },
    })

    // 4. Create email verification token, send email, and audit log
    const verificationToken = await authRepository.createEmailVerificationToken(
      user.id,
    )
    const config = useRuntimeConfig()
    const appUrl = (config.public.baseURL as string) || 'http://localhost:3000'
    await sendVerifyEmail(email, verificationToken, appUrl).catch((err) => {
      console.error('Failed to send verification email:', err.message)
    })

    await authRepository.createAuditLog({
      userId: user.id,
      email: user.email,
      eventType: 'USER_REGISTERED',
      reason: 'User account created',
      ipAddress,
      userAgent,
      success: true,
    })

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.email_verified,
    }
  },

  // ==================== LOGIN ====================

  /**
   * Handles user login requests with security best practices.
   *
   * Validates login credentials, manages rate limiting and account locking,
   * sets secure HTTP-only cookies for tokens, and returns user data.
   *
   * @param email - User email address
   * @param password - User password
   * @param ipAddress - User IP address
   * @param userAgent - User agent
   * @param device - User device
   * @returns Promise resolving to login response with tokens and user data
   * @throws {Error} 400 - Invalid input validation error
   * @throws {Error} 401 - Authentication failed (invalid credentials, locked account, etc.)
   * @throws {Error} 429 - Rate limit exceeded
   * @throws {Error} 500 - Unexpected server error
   */
  async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    device: string,
  ): Promise<AuthResponse> {
    const normalizedEmail = email.toLowerCase()

    // 1. Rate Limit (By Email)
    const rateLimit = checkRateLimit(`login:${normalizedEmail}`, {
      windowMs: RATE_LIMITS.LOGIN.windowMs,
      maxAttempts: RATE_LIMITS.LOGIN.maxAttempts,
      lockoutMs: RATE_LIMITS.LOGIN.lockoutMs,
      keyPrefix: RATE_LIMITS.LOGIN.keyPrefix,
    })

    if (!rateLimit.allowed) {
      const secondsLeft =
        rateLimit.lockedUntilMs ||
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)

      throw new AuthError(
        rateLimit.locked ? 'ACCOUNT_LOCKED' : 'RATE_LIMIT_EXCEEDED',
        rateLimit.locked
          ? `Account is locked. Try again in ${secondsLeft} seconds`
          : `Too many attempts. Try again in ${secondsLeft} seconds`,
        429,
      )
    }

    // 2. Find user by email
    const user = await prisma.profile.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      throw new AuthError(
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        401,
      )
    }

    // 3. Enforce email verification (if enabled)
    if (
      process.env.REQUIRE_EMAIL_VERIFICATION === 'true' &&
      !user.email_verified
    ) {
      throw new AuthError(
        'EMAIL_NOT_VERIFIED',
        'Please verify your email address before logging in.',
        403,
      )
    }

    // 4. Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash!)

    if (!isPasswordValid) {
      throw new AuthError(
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        401,
      )
    }

    // 5. Success: Clear rate limit and generate tokens
    clearRateLimit(`login:${normalizedEmail}`, RATE_LIMITS.LOGIN.keyPrefix)

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role,
    )

    // 6. Create session
    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      ip: ipAddress,
      userAgent,
      device,
      country: undefined,
    })

    // 7. Audit log
    await authRepository.createAuditLog({
      userId: user.id,
      email: user.email,
      eventType: 'USER_LOGIN',
      reason: 'User logged in',
      ipAddress,
      userAgent,
      success: true,
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username ?? '',
        emailVerified: user.email_verified,
        role: user.role,
      },
    }
  },

  // ==================== SOCIAL LOGIN ====================

  async loginWithOAuth(
    provider: OAuthProvider,
    oauthProfile: {
      email: string
      name?: string
      avatar?: string
    },
    ipAddress: string,
    userAgent: string,
    device: string,
  ): Promise<AuthResponse> {
    const email = oauthProfile.email.toLowerCase()

    let user = await prisma.profile.findUnique({
      where: { email },
    })

    if (!user) {
      const usernameSeed =
        oauthProfile.name ||
        email.split('@')[0] ||
        `${provider}_${Math.random().toString(36).slice(2, 8)}`
      const username = await createUniqueUsername(usernameSeed)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID()
      const passwordHash = await hashPassword(randomPassword)

      user = await prisma.profile.create({
        data: {
          id: crypto.randomUUID(),
          email,
          username,
          role: 'user',
          password_hash: passwordHash,
          email_verified: true,
          email_verified_at: new Date(),
          avatar: oauthProfile.avatar || null,
        },
      })
    }

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role,
    )

    await authRepository.createSession({
      userId: user.id,
      refreshToken,
      ip: ipAddress,
      userAgent,
      device,
      country: undefined,
    })

    await authRepository.createAuditLog({
      userId: user.id,
      email: user.email,
      eventType: 'USER_LOGIN_OAUTH',
      reason: `User logged in with ${provider}`,
      ipAddress,
      userAgent,
      success: true,
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username ?? '',
        emailVerified: user.email_verified,
        role: user.role,
      },
    }
  },

  // ==================== REFRESH TOKEN ====================

  async refreshAccessToken(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    // 1. Validate refresh token exists in session
    const session = await authRepository.getSessionByRefreshToken(refreshToken)

    if (!session || session.revokedAt) {
      throw new AuthError(
        'INVALID_TOKEN',
        'Invalid or revoked refresh token',
        401,
      )
    }

    if (session.expiresAt < new Date()) {
      throw new AuthError('TOKEN_EXPIRED', 'Refresh token has expired', 401)
    }

    // 2. Rate limit refresh attempts
    const rateLimit = checkRateLimit(`refresh:${session.userId}`, {
      windowMs: RATE_LIMITS.REFRESH_TOKEN.windowMs,
      maxAttempts: RATE_LIMITS.REFRESH_TOKEN.maxAttempts,
      keyPrefix: RATE_LIMITS.REFRESH_TOKEN.keyPrefix,
      lockoutMs: RATE_LIMITS.REFRESH_TOKEN.lockoutMs,
    })

    if (!rateLimit.allowed) {
      const secondsLeft =
        rateLimit.lockedUntilMs ||
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)

      throw new AuthError(
        rateLimit.locked ? 'ACCOUNT_LOCKED' : 'RATE_LIMIT_EXCEEDED',
        rateLimit.locked
          ? `Account is locked. Try again in ${secondsLeft} seconds`
          : `Too many attempts. Try again in ${secondsLeft} seconds`,
        429,
      )
    }

    // 3. Get user for email in token
    const user = await prisma.profile.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      throw new AuthError('USER_NOT_FOUND', 'User not found', 401)
    }

    // 4. Generate new access token
    const { accessToken } = generateTokens(
      session.userId,
      user.email,
      user.role,
    )

    // 5. Audit log
    await authRepository.createAuditLog({
      userId: session.userId,
      email: user.email,
      eventType: 'TOKEN_REFRESHED',
      reason: 'Access token refreshed',
      ipAddress,
      userAgent,
      success: true,
    })

    return { accessToken }
  },

  // ==================== EMAIL VERIFICATION ====================

  async sendVerificationEmail(userId: string, email: string) {
    // Rate limit email sends
    const rateLimit = checkRateLimit(`verify-send:${email}`, {
      windowMs: RATE_LIMITS.VERIFY_EMAIL_SEND.windowMs,
      maxAttempts: RATE_LIMITS.VERIFY_EMAIL_SEND.maxAttempts,
      keyPrefix: RATE_LIMITS.VERIFY_EMAIL_SEND.keyPrefix,
      lockoutMs: RATE_LIMITS.VERIFY_EMAIL_SEND.lockoutMs,
    })

    if (!rateLimit.allowed) {
      const secondsLeft =
        rateLimit.lockedUntilMs ||
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)

      throw new AuthError(
        rateLimit.locked ? 'ACCOUNT_LOCKED' : 'RATE_LIMIT_EXCEEDED',
        rateLimit.locked
          ? `Account is locked. Try again in ${secondsLeft} seconds`
          : `Too many attempts. Try again in ${secondsLeft} seconds`,
        429,
      )
    }

    // Create verification token and send email
    const token = await authRepository.createEmailVerificationToken(userId)
    const config = useRuntimeConfig()
    const appUrl = (config.public.baseURL as string) || 'http://localhost:3000'
    await sendVerifyEmail(email, token, appUrl)

    return { message: 'Verification email sent' }
  },

  async verifyEmail(token: string) {
    // Rate limit verification attempts
    const rateLimit = checkRateLimit(`verify-attempt:${token}`, {
      windowMs: RATE_LIMITS.VERIFY_EMAIL_TOKEN.windowMs,
      maxAttempts: RATE_LIMITS.VERIFY_EMAIL_TOKEN.maxAttempts,
      keyPrefix: RATE_LIMITS.VERIFY_EMAIL_TOKEN.keyPrefix,
      lockoutMs: RATE_LIMITS.VERIFY_EMAIL_TOKEN.lockoutMs,
    })

    if (!rateLimit.allowed) {
      const secondsLeft =
        rateLimit.lockedUntilMs ||
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)

      throw new AuthError(
        rateLimit.locked ? 'ACCOUNT_LOCKED' : 'RATE_LIMIT_EXCEEDED',
        rateLimit.locked
          ? `Account is locked. Try again in ${secondsLeft} seconds`
          : `Too many attempts. Try again in ${secondsLeft} seconds`,
        429,
      )
    }

    // Verify email token
    const userId = await authRepository.verifyEmailToken(token)

    if (!userId) {
      throw new AuthError(
        'INVALID_TOKEN',
        'Invalid or expired verification token',
        400,
      )
    }

    return { message: 'Email verified successfully' }
  },

  // ==================== PASSWORD RESET ====================

  async requestPasswordReset(
    email: string,
    ipAddress: string,
    userAgent: string,
  ) {
    email = email.toLowerCase()

    // Rate limit password reset requests
    const rateLimit = checkRateLimit(`forgot:${email}`, {
      windowMs: RATE_LIMITS.FORGOT_PASSWORD.windowMs,
      maxAttempts: RATE_LIMITS.FORGOT_PASSWORD.maxAttempts,
      keyPrefix: RATE_LIMITS.FORGOT_PASSWORD.keyPrefix,
      lockoutMs: RATE_LIMITS.FORGOT_PASSWORD.lockoutMs,
    })

    if (!rateLimit.allowed) {
      const secondsLeft =
        rateLimit.lockedUntilMs ||
        Math.ceil((rateLimit.resetAt - Date.now()) / 1000)

      throw new AuthError(
        rateLimit.locked ? 'ACCOUNT_LOCKED' : 'RATE_LIMIT_EXCEEDED',
        rateLimit.locked
          ? `Account is locked. Try again in ${secondsLeft} seconds`
          : `Too many attempts. Try again in ${secondsLeft} seconds`,
        429,
      )
    }

    // Find user
    const user = await prisma.profile.findUnique({ where: { email } })

    if (!user) {
      // Don't reveal if user exists (security)
      return { message: 'If email exists, reset link will be sent' }
    }

    // Create password reset token
    const token = await authRepository.createPasswordResetToken(user.id)

    // Audit log
    await authRepository.createAuditLog({
      userId: user.id,
      email: user.email,
      eventType: 'PASSWORD_RESET_REQUESTED',
      reason: 'Password reset requested',
      ipAddress,
      userAgent,
      success: true,
    })

    // Send reset email
    const config = useRuntimeConfig()
    const appUrl = (config.public.baseURL as string) || 'http://localhost:3000'
    await sendResetEmail(email, token, appUrl).catch((err) => {
      console.error('Failed to send password reset email:', err.message)
    })

    return { message: 'If email exists, reset link will be sent' }
  },

  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress: string,
    userAgent: string,
  ) {
    // Validate and use password reset token
    const userId = await authRepository.usePasswordResetToken(token)

    if (!userId) {
      throw new AuthError(
        'INVALID_TOKEN',
        'Invalid or expired password reset token',
        400,
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    const user = await prisma.profile.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    })

    // Revoke all sessions (force re-login on all devices)
    await authRepository.revokeAllSessions(userId)

    // Audit log
    await authRepository.createAuditLog({
      userId,
      email: user.email,
      eventType: 'PASSWORD_RESET',
      reason: 'Password reset successfully',
      ipAddress,
      userAgent,
      success: true,
    })

    return { message: 'Password reset successfully' }
  },

  // ==================== LOGOUT ====================

  async logout(sessionId: string, ipAddress: string, userAgent: string) {
    // Find session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (session) {
      // Revoke session
      await authRepository.revokeSession(sessionId)

      // Audit log
      await authRepository.createAuditLog({
        userId: session.userId,
        email: '',
        eventType: 'USER_LOGOUT',
        reason: 'User logged out',
        ipAddress,
        userAgent,
        success: true,
      })
    }

    return { message: 'Logged out successfully' }
  },

  // ==================== CLEANUP ====================

  async cleanupExpiredTokens() {
    await authRepository.cleanupExpiredTokens()
    return { message: 'Expired tokens cleaned up' }
  },
}
