/**
 * Checkout OTP Service
 *
 * Handles the two-step inline checkout authentication flow:
 *   Step 1 — sendOtp:   generate & email a one-time code
 *   Step 2 — verifyOtp: validate code, auto-register new users, issue session tokens
 *
 * Route handlers delegate here; they only parse input and set cookies.
 */

import { randomBytes } from 'crypto'
import { authRepository } from '../repositories/auth.repository'

// ── Username helpers (shared with auth.service for OAuth registration) ────────

const normalizeUsername = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20)

export async function createUniqueUsername(seed: string): Promise<string> {
  const fallback = `user_${Math.random().toString(36).slice(2, 8)}`
  let base = normalizeUsername(seed) || fallback
  if (base.length < 3) base = `${base}${Math.random().toString(36).slice(2, 5)}`
  base = base.slice(0, 20)

  let candidate = base
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.profile.findFirst({
      where: { username: candidate },
      select: { id: true },
    })
    if (!exists) return candidate
    const suffix = Math.random().toString(36).slice(2, 5)
    candidate = `${base.slice(0, Math.max(3, 20 - suffix.length))}${suffix}`
  }
  return `user_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`
}

// ── OTP rate-limit key ────────────────────────────────────────────────────────

const OTP_RATE_KEY = 'checkout-otp'

// ── Step 1: Send OTP ─────────────────────────────────────────────────────────

export interface SendOtpResult {
  isNewUser: boolean
}

export async function sendCheckoutOtp(
  email: string,
  name: string | undefined,
  phone: string | undefined,
  ipAddress: string,
): Promise<SendOtpResult> {
  const rateLimit = checkRateLimit(`${OTP_RATE_KEY}:${ipAddress}`, {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    lockoutMs: 15 * 60 * 1000,
    keyPrefix: OTP_RATE_KEY,
  })
  if (!rateLimit.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Try again later.' })
  }

  const existing = await prisma.profile.findUnique({
    where: { email },
    select: { id: true },
  })
  const isNewUser = !existing

  const code = String(Math.floor(100000 + Math.random() * 900000))
  otpStore.set(email, { code, isNewUser, name, phone })

  const config = useRuntimeConfig()
  const appName = (config.public.appName as string) || 'MarketX'

  sendOtpEmail(email, code, isNewUser, appName).catch((err: Error) =>
    logger.warn('Checkout OTP email failed', { email, error: err.message }),
  )

  return { isNewUser }
}

// ── Step 2: Verify OTP ────────────────────────────────────────────────────────

export interface VerifyOtpResult {
  isNewUser: boolean
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    username: string
    emailVerified: boolean
    role: string
  }
}

export async function verifyCheckoutOtp(
  email: string,
  code: string,
  bodyName: string | undefined,
  ipAddress: string,
  userAgent: string,
): Promise<VerifyOtpResult> {
  // 1. Validate OTP (one-time use — consumed on verify)
  const entry = otpStore.verify(email, code)
  if (!entry) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired verification code' })
  }

  // 2. Resolve or create user
  let user = await prisma.profile.findUnique({ where: { email } })

  if (!user) {
    const displayName = entry.name || bodyName || email.split('@')[0]!
    const username = await createUniqueUsername(displayName.split(' ')[0] || email.split('@')[0]!)
    const passwordHash = await hashPassword(crypto.randomUUID() + crypto.randomUUID())

    user = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        email,
        username,
        password_hash: passwordHash,
        role: 'user',
        email_verified: true,
        email_verified_at: new Date(),
      },
    })

    // Give new users a 7-day window to set a real password
    const resetToken = randomBytes(32).toString('hex')
    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const config = useRuntimeConfig()
    const appUrl = (config.public.baseURL as string) || 'http://localhost:3000'
    const appName = (config.public.appName as string) || 'MarketX'

    sendPasswordResetEmail(email, resetToken, appUrl).catch((err: Error) =>
      logger.warn('Checkout OTP password-setup email failed', { email, error: err.message }),
    )
    sendWelcomeEmail(email, user.username!, appName).catch((err: Error) =>
      logger.warn('Checkout OTP welcome email failed', { email, error: err.message }),
    )
  } else if (!user.email_verified) {
    user = await prisma.profile.update({
      where: { id: user.id },
      data: { email_verified: true, email_verified_at: new Date() },
    })
  }

  // 3. Create session
  const sessionId = crypto.randomUUID()
  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role, sessionId)

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshToken,
      ip: ipAddress,
      userAgent,
      device: 'Web',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(),
    },
  })

  // 4. Audit log
  await authRepository.createAuditLog({
    userId: user.id,
    email: user.email,
    eventType: 'CHECKOUT_OTP_LOGIN',
    reason: entry.isNewUser ? 'Auto-registered via checkout OTP' : 'Logged in via checkout OTP',
    ipAddress,
    userAgent,
    success: true,
  })

  return {
    isNewUser: entry.isNewUser ?? false,
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
}
