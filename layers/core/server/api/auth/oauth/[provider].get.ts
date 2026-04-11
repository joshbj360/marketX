import {
  createError,
  defineEventHandler,
  getQuery,
  sendRedirect,
  setCookie,
} from 'h3'

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
  const redirectTo =
    typeof query.redirectTo === 'string' && query.redirectTo.startsWith('/')
      ? query.redirectTo
      : '/'

  const clientIdByProvider: Record<OAuthProvider, string | undefined> = {
    google: process.env.OAUTH_GOOGLE_CLIENT_ID,
    facebook: process.env.OAUTH_FACEBOOK_CLIENT_ID,
    tiktok: process.env.OAUTH_TIKTOK_CLIENT_KEY,
  }

  if (!clientIdByProvider[provider]) {
    throw createError({
      statusCode: 500,
      statusMessage: `${provider} OAuth is not configured on the server`,
    })
  }

  const config = useRuntimeConfig()
  const appUrl = (config.public.baseURL as string) || 'http://localhost:3000'
  const callback = `${appUrl.replace(/\/$/, '')}/api/auth/oauth/${provider}/callback`
  const state = crypto.randomUUID()
  const authorizeUrl = getOAuthAuthorizeUrl(provider, state, callback)

  setCookie(event, 'oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  })

  setCookie(event, 'oauth_redirect', encodeURIComponent(redirectTo), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  })

  return sendRedirect(event, authorizeUrl)
})
