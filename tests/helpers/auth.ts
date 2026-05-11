import type { APIRequestContext, Page } from '@playwright/test'

export const BASE = 'http://localhost:3000'

// Seed credentials — matches prisma/seed.ts
export const TEST_USER = {
  email: 'ada@peppr.test',
  password: 'test1234',
  username: 'ada',
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
 */
export async function uiLogin(
  page: Page,
  credentials = TEST_USER,
) {
  await page.goto('/user-login')
  await page.fill('[name=email]', credentials.email)
  await page.fill('[name=password]', credentials.password)
  await page.click('[type=submit]')
  await page.waitForURL('/', { timeout: 10000 })
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
 * Returns the first variant ID for a seed product.
 * Uses the by-slug endpoint so no hardcoded DB IDs.
 */
export async function getFirstVariantId(
  request: APIRequestContext,
  slug = 'adire-tie-dye-maxi-dress',
): Promise<number> {
  const res = await request.get(`/api/commerce/products/by-slug/${slug}`)
  const body = await res.json()
  const id = body.data?.variants?.[0]?.id
  if (!id) throw new Error(`No variant found for slug "${slug}"`)
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
