import type { APIRequestContext, Page } from '@playwright/test'

export const BASE = 'http://localhost:3000'

// Seed credentials — matches prisma/seed.ts
export const TEST_USER = {
  email: 'ada@peppr.test',
  password: 'test1234',
  username: 'ada_styles',
}

export const TEST_SELLER = {
  email: 'balogun@peppr.test',
  password: 'test1234',
  username: 'balogun_fabrics',
  storeSlug: 'balogun-fabrics',
}

// Unique email for registration tests — avoids seed conflicts
export const uniqueEmail = () =>
  `test_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`

export const uniqueUsername = () =>
  `user_${Date.now().toString(36)}`

/**
 * Login via API and return the access token.
 * Reuse this in any test that needs an authenticated request.
 */
export async function apiLogin(
  request: APIRequestContext,
  credentials = TEST_USER,
) {
  const res = await request.post('/api/auth/login', {
    data: { email: credentials.email, password: credentials.password },
  })
  const body = await res.json()
  return { res, token: body.accessToken as string, user: body.user }
}

/**
 * Login via the UI login form.
 * Returns after the redirect to / completes.
 *
 * NOTE: The redirect to / takes 15-30s on a cold server because
 * syncUserToProfile opens SSE/WS connections before the setTimeout fires.
 * Prefer pageLogin() for e2e tests — it seeds localStorage directly.
 */
export async function uiLogin(
  page: Page,
  credentials = TEST_USER,
) {
  await page.goto('/user-login')
  await page.fill('input[type="email"]', credentials.email)
  await page.fill('input[type="password"]', credentials.password)
  await page.click('button[type=submit]')
  await page.waitForURL('/', { timeout: 30000 })
}

/**
 * Fast browser login: seeds localStorage with API tokens then navigates to /.
 * The auth-init plugin reads the tokens and hydrates the profile store.
 * Much faster than uiLogin — avoids the syncUserToProfile + setTimeout delay.
 */
export async function pageLogin(
  page: Page,
  request: APIRequestContext,
  credentials = TEST_USER,
) {
  const res = await request.post('/api/auth/login', {
    data: { email: credentials.email, password: credentials.password },
  })
  const body = await res.json()
  const accessToken: string = body.accessToken
  const refreshToken: string = body.refreshToken

  // Navigate to the app to get access to the origin's localStorage
  await page.goto('/')
  await page.evaluate(
    ({ at, rt }) => {
      localStorage.setItem('accessToken', at)
      if (rt) localStorage.setItem('refreshToken', rt)
    },
    { at: accessToken, rt: refreshToken ?? '' },
  )

  // Reload and wait for auth-init to fetch /api/profile (proves hydration complete).
  // Cannot use 'networkidle' — SSE connections keep the network permanently active.
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/profile') && r.request().method() === 'GET',
      { timeout: 15000 },
    ),
    page.reload({ waitUntil: 'load' }),
  ])
}

/**
 * Resets all in-memory rate limit counters on the server.
 * Only works in dev/test — safe to call at the start of any spec that creates users.
 */
export async function resetRateLimits(
  request: APIRequestContext,
): Promise<void> {
  await request.post('/api/__test__/reset-rate-limits')
}

/**
 * Resolves a product slug that exists in the test DB.
 * Tries the seed slug first (fast path), then falls back to the first product in the list.
 */
export async function getFirstProductSlug(
  request: APIRequestContext,
  preferred = 'adire-tie-dye-maxi-dress',
): Promise<string> {
  const probe = await request.get(`/api/commerce/products/by-slug/${preferred}`)
  if (probe.ok()) return preferred

  const listRes = await request.get('/api/commerce/products?limit=1')
  const body = await listRes.json()
  const slug = body.data?.products?.[0]?.slug as string | undefined
  if (!slug) throw new Error('No products in test DB — run: npx prisma db seed')
  return slug
}

/**
 * Returns the first variant ID for a product that exists in the test DB.
 * Uses getFirstProductSlug so the slug is always valid.
 */
export async function getFirstVariantId(
  request: APIRequestContext,
  slug?: string,
): Promise<number> {
  const resolvedSlug = slug ?? await getFirstProductSlug(request)
  const res = await request.get(`/api/commerce/products/by-slug/${resolvedSlug}`)
  const body = await res.json()
  const id = body.data?.variants?.[0]?.id
  if (!id) throw new Error(`No variant found for slug "${resolvedSlug}"`)
  return id as number
}

/**
 * Clears all cart items for the currently authenticated user.
 * Token must be passed as Authorization header — use after apiLogin.
 */
export async function clearCart(
  request: APIRequestContext,
  token: string,
): Promise<void> {
  const res = await request.get('/api/commerce/cart', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.json()
  const items: Array<{ variantId: number }> = body.data?.items ?? []
  await Promise.all(
    items.map((item) =>
      request.delete(`/api/commerce/cart/${item.variantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ),
  )
}
