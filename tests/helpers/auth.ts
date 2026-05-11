import type { APIRequestContext, Page } from '@playwright/test'

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
