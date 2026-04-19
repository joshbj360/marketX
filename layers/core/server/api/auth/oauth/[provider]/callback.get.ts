import {
  deleteCookie,
  createError,
  defineEventHandler,
  getCookie,
  getQuery,
  getRequestHeader,
  getRequestIP,
  sendRedirect,
  setCookie,
} from 'h3'
import { authService } from '~~/layers/core/server/services/auth.service'

type OAuthProvider = 'google' | 'facebook' | 'tiktok'

const providers: OAuthProvider[] = ['google', 'facebook', 'tiktok']

export default defineEventHandler(async (event) => {
  const provider = event.context.params?.provider as OAuthProvider | undefined
  if (!provider || !providers.includes(provider)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'OAuth provider not supported',
    })
  }

  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const state = typeof query.state === 'string' ? query.state : ''
  const error = typeof query.error === 'string' ? query.error : ''

  const config = useRuntimeConfig()
  const appUrl = ((config.public.baseURL as string) || 'http://localhost:3000')
    .trim()
    .replace(/\/$/, '')
  const redirectPath = decodeURIComponent(
    getCookie(event, 'oauth_redirect') || '/',
  )
  const safeRedirectPath = redirectPath.startsWith('/') ? redirectPath : '/'

  deleteCookie(event, 'oauth_redirect', { path: '/' })

  if (error) {
    deleteCookie(event, 'oauth_state', { path: '/' })
    return sendRedirect(
      event,
      `${appUrl}/user-login?oauth_error=${encodeURIComponent(error)}`,
    )
  }

  const cookieState = getCookie(event, 'oauth_state')
  deleteCookie(event, 'oauth_state', { path: '/' })

  if (!code || !state || !cookieState || cookieState !== state) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid OAuth state or code',
    })
  }

  const callback = `${appUrl}/api/auth/oauth/${provider}/callback`

  try {
    const oauthProfile = await exchangeCodeForProfile(provider, code, callback)

    const ipAddress =
      getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const userAgent = getRequestHeader(event, 'user-agent') || 'Unknown'
    const device = getRequestHeader(event, 'device') || 'Web'

    const result = await authService.loginWithOAuth(
      provider,
      oauthProfile,
      ipAddress,
      userAgent,
      device,
    )

    setCookie(event, 'accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    })

    setCookie(event, 'refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return sendRedirect(event, `${appUrl}${safeRedirectPath}`)
  } catch (oauthError: unknown) {
    const message =
      oauthError instanceof Error
        ? oauthError.message
        : 'OAuth authentication failed'
    logger.error('[OAuth callback] Error:', oauthError)
    return sendRedirect(
      event,
      `${appUrl}/user-login?oauth_error=${encodeURIComponent(message)}`,
    )
  }
})
