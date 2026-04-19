// POST /api/auth/register-seller
// Registers a new user account AND creates their store in one atomic flow.
// On success the user is immediately logged in (tokens set as HTTP-only cookies)
// so they can continue straight to adding products.

import { getClientIP } from '~~/server/layers/shared/utils/security'
import { AuthError } from '../../types/auth.types'
import { SellerError } from '~~/layers/seller/server/types/seller.types'
import { sellerService } from '~~/layers/seller/server/services/seller.services'

const RESERVED_SLUGS = new Set([
  'discover', 'thrift', 'checkout', 'cart', 'sellers', 'seller',
  'user-login', 'user-register', 'profile', 'map', 'reels', 'api',
  'offline', 'landing', 'about', 'help', 'privacy', 'terms',
  'forgot-password', 'reset-password', 'verify-email', 'resend-verification',
  'feed', 'search', 'explore', 'settings', 'notifications', 'messages',
  'admin', 'static', '_nuxt',
])

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    // Account fields
    email, username, password, confirmPassword,
    // Store fields
    store_name, store_slug, store_description,
    store_logo, store_banner, store_location,
    store_phone, store_currency,
  } = body

  // ── Basic validation ────────────────────────────────────────────────────────
  if (!email || !username || !password || !confirmPassword)
    throw createError({ statusCode: 400, statusMessage: 'All account fields are required' })

  if (password !== confirmPassword)
    throw createError({ statusCode: 400, statusMessage: 'Passwords do not match' })

  if (password.length < 8)
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })

  if (!store_name || store_name.trim().length < 3)
    throw createError({ statusCode: 400, statusMessage: 'Store name must be at least 3 characters' })

  if (!store_slug || store_slug.trim().length < 3)
    throw createError({ statusCode: 400, statusMessage: 'Store URL must be at least 3 characters' })

  const slug = store_slug.toLowerCase().trim()

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw createError({ statusCode: 400, statusMessage: 'Store URL can only contain lowercase letters, numbers, and hyphens' })

  if (RESERVED_SLUGS.has(slug))
    throw createError({ statusCode: 400, statusMessage: `"${slug}" is a reserved name — choose a different store URL` })

  const ipAddress = getClientIP(event)
  const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

  try {
    // ── 1. Rate limit ────────────────────────────────────────────────────────
    const rateLimit = checkRateLimit(`register:${ipAddress}`, {
      windowMs: 15 * 60 * 1000,
      maxAttempts: 5,
      lockoutMs: 15 * 60 * 1000,
      keyPrefix: 'reg',
    })
    if (!rateLimit.allowed) {
      const secs = Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      throw createError({ statusCode: 429, statusMessage: `Too many attempts. Try again in ${secs} seconds` })
    }

    // ── 2. Check duplicate user ──────────────────────────────────────────────
    const existing = await prisma.profile.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
      select: { email: true },
    })
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username'
      throw createError({ statusCode: 400, statusMessage: `${field} already in use` })
    }

    // ── 3. Check slug availability ───────────────────────────────────────────
    const slugTaken = await prisma.sellerProfile.findUnique({
      where: { store_slug: slug },
      select: { id: true },
    })
    if (slugTaken)
      throw createError({ statusCode: 409, statusMessage: `Store URL "${slug}" is already taken` })

    // ── 4. Create user + seller in a transaction ─────────────────────────────
    const userId = crypto.randomUUID()
    const hashedPassword = await hashPassword(password)

    const [user] = await prisma.$transaction(async (tx) => {
      const newUser = await tx.profile.create({
        data: {
          id: userId,
          email: email.toLowerCase(),
          username: username.trim(),
          password_hash: hashedPassword,
          role: 'seller',
        },
      })

      await tx.sellerProfile.create({
        data: {
          profileId: newUser.id,
          store_name: store_name.trim(),
          store_slug: slug,
          store_description: store_description?.trim() || undefined,
          store_logo: store_logo || undefined,
          store_banner: store_banner || undefined,
          store_location: store_location?.trim() || undefined,
          store_phone: store_phone?.trim() || undefined,
          default_currency: store_currency || 'NGN',
          is_active: true,
        },
      })

      return [newUser]
    })

    // ── 5. Issue tokens → auto-login ─────────────────────────────────────────
    const sessionId = crypto.randomUUID()
    const tokens = generateTokens(user.id, user.email, 'seller', sessionId)

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshToken: tokens.refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }).catch((e: Error) => logger.warn('Session create failed after seller registration', { userId: user.id, error: e.message }))

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        email: user.email,
        event_type: 'SELLER_REGISTERED',
        reason: 'Account + store created via onboarding wizard',
        ip_address: ipAddress,
        user_agent: userAgent,
        success: true,
      },
    }).catch((e: Error) => logger.warn('Audit log failed after seller registration', { userId: user.id, error: e.message }))

    // ── 6. Set HTTP-only cookies (same shape as /api/auth/login) ─────────────
    setCookie(event, 'accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
    })
    setCookie(event, 'refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    })

    // ── 7. Send verification email async (non-blocking) ──────────────────────
    ;(async () => {
      try {
        const { authRepository } = await import('../../repositories/auth.repository')
        const config = useRuntimeConfig()
        const appUrl = (config.public.baseURL as string) || 'http://localhost:3000'
        const token = await authRepository.createEmailVerificationToken(user.id)
        await sendVerificationEmail(user.email, token, appUrl)
      } catch { /* swallow — account is created, email is non-critical */ }
    })()

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: 'seller',
      },
      store: { store_slug: slug, store_name: store_name.trim() },
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    if (error instanceof AuthError)
      throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    if (error instanceof SellerError)
      throw createError({ statusCode: error.statusCode || 400, statusMessage: error.message })
    logger.error('Seller registration failed', { error: error instanceof Error ? error.message : String(error) })
    throw createError({ statusCode: 500, statusMessage: 'Registration failed. Please try again.' })
  }
})
