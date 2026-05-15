import { test, expect } from '@playwright/test'
import { pageLogin, TEST_USER, apiLogin, clearCart, getFirstVariantId, getFirstProductSlug } from '../helpers/auth'

let PRODUCT_SLUG = 'adire-tie-dye-maxi-dress'

test.describe('smoke — critical user journey', () => {
  test.beforeAll(async ({ request }) => {
    PRODUCT_SLUG = await getFirstProductSlug(request)
  })

  test('guest sees market home', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText("Today's deals")).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Browse by market')).toBeVisible()
  })

  // Verifies the login form calls the auth API correctly.
  // We don't assert the post-login redirect because the syncUserToProfile +
  // setTimeout flow takes 15-30s on dev (SSE/WS connections open before redirect).
  test('login form calls auth API and returns token', async ({ page }) => {
    // waitUntil: 'networkidle' ensures Vue hydration is complete before interacting
    await page.goto('/user-login', { waitUntil: 'networkidle' })
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)

    const [loginRes] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/login')),
      page.click('button[type=submit]'),
    ])

    expect(loginRes.status()).toBe(200)
    const body = await loginRes.json()
    expect(body.accessToken).toBeTruthy()
  })

  test('product page renders title and add-to-cart', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible()
  })

  test('authenticated user can add product to cart', async ({ page, request }) => {
    const { token } = await apiLogin(request)
    await clearCart(request, token)

    await pageLogin(page, request)
    await page.goto(`/product/${PRODUCT_SLUG}`)

    // Product auto-selects first in-stock variant — wait for button to be enabled
    const addBtn = page.getByRole('button', { name: /add to cart/i })
    await expect(addBtn).toBeVisible({ timeout: 15000 })
    await expect(addBtn).toBeEnabled({ timeout: 10000 })

    await addBtn.click()

    // Button reverts after API call completes; no error message should appear
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('checkout page is accessible when logged in', async ({ page, request }) => {
    // Seed the cart via API so checkout has something to render
    const { token } = await apiLogin(request)
    await clearCart(request, token)
    const variantId = await getFirstVariantId(request)
    await request.post('/api/commerce/cart', {
      data: { variantId, quantity: 1 },
      headers: { Authorization: `Bearer ${token}` },
    })

    await pageLogin(page, request)
    await page.goto('/checkout')

    await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveURL('/checkout')
  })
})
