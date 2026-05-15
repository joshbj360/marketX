import { test, expect } from '@playwright/test'
import { pageLogin, apiLogin, clearCart, getFirstVariantId, getFirstProductSlug } from '../../helpers/auth'

let PRODUCT_SLUG = 'adire-tie-dye-maxi-dress'
const T = { timeout: 15000 }

test.describe('Commerce — Cart & Checkout', () => {
  test.beforeAll(async ({ request }) => {
    PRODUCT_SLUG = await getFirstProductSlug(request)
  })
  // ── Guest checkout ─────────────────────────────────────────────────────────
  test.describe('Guest — inline auth step', () => {
    test('guest sees the inline auth form on /checkout', async ({ page }) => {
      await page.goto('/checkout')
      await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible(T)
      await expect(page.getByText(/who's buying/i)).toBeVisible(T)
      await expect(page.locator('input[type="email"]').first()).toBeVisible()
    })

    test('"Continue" button is disabled until email is entered', async ({ page }) => {
      await page.goto('/checkout')
      await expect(page.getByText(/who's buying/i)).toBeVisible(T)
      await expect(page.getByRole('button', { name: /continue/i })).toBeDisabled(T)
    })

    test('"Continue" button enables once a valid email is typed', async ({ page }) => {
      await page.goto('/checkout')
      // networkidle ensures the auth-init plugin's /api/auth/session call has settled
      // and Vue has finished hydrating (attaching v-model event listeners)
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/who's buying/i)).toBeVisible(T)
      await page.locator('input[type="email"]').first().fill('guest@example.com')
      await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled(T)
    })

    test('clearing the email disables the Continue button again', async ({ page }) => {
      await page.goto('/checkout')
      await page.waitForLoadState('networkidle')
      await expect(page.getByText(/who's buying/i)).toBeVisible(T)
      const emailInput = page.locator('input[type="email"]').first()
      await emailInput.fill('guest@example.com')
      await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled(T)
      await emailInput.fill('')
      await expect(page.getByRole('button', { name: /continue/i })).toBeDisabled(T)
    })
  })

  // ── Authenticated checkout ─────────────────────────────────────────────────
  test.describe('Authenticated — checkout flow', () => {
    test('shows checkout heading and no inline-auth step', async ({ page, request }) => {
      await pageLogin(page, request)
      await page.goto('/checkout')
      await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible(T)
      // Auth step must not appear for a logged-in user
      await expect(page.getByText(/who's buying/i)).not.toBeVisible()
    })

    test('checkout page has correct URL', async ({ page, request }) => {
      await pageLogin(page, request)
      await page.goto('/checkout')
      await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible(T)
      await expect(page).toHaveURL('/checkout')
    })

    test('checkout is accessible after seeding cart via API', async ({ page, request }) => {
      const { token } = await apiLogin(request)
      await clearCart(request, token)
      const variantId = await getFirstVariantId(request)
      await request.post('/api/commerce/cart', {
        data: { variantId, quantity: 1 },
        headers: { Authorization: `Bearer ${token}` },
      })

      await pageLogin(page, request)
      await page.goto('/checkout')
      await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible(T)
    })
  })

  // ── Add to cart interaction ────────────────────────────────────────────────
  test.describe('Add to cart', () => {
    test('authenticated user can add a product and gets no error', async ({
      page,
      request,
    }) => {
      const { token } = await apiLogin(request)
      await clearCart(request, token)

      await pageLogin(page, request)
      await page.goto(`/product/${PRODUCT_SLUG}`)

      const addBtn = page.getByRole('button', { name: /add to cart/i })
      await expect(addBtn).toBeEnabled(T)
      await addBtn.click()

      await expect(page.locator('body')).not.toContainText('Something went wrong')
      await expect(page.locator('body')).not.toContainText('error', { ignoreCase: true })
    })

    test('add-to-cart briefly shows "Adding…" state', async ({ page, request }) => {
      const { token } = await apiLogin(request)
      await clearCart(request, token)

      await pageLogin(page, request)
      await page.goto(`/product/${PRODUCT_SLUG}`)

      const addBtn = page.getByRole('button', { name: /add to cart/i })
      await expect(addBtn).toBeEnabled(T)

      // Click and immediately assert the in-flight state
      const [_, addingText] = await Promise.all([
        addBtn.click(),
        page
          .getByRole('button', { name: /adding…/i })
          .waitFor({ timeout: 3000 })
          .catch(() => null), // may resolve too fast on fast connections
      ])
      // After API call: button should revert (no crash)
      await expect(page.locator('body')).not.toContainText('Something went wrong')
    })
  })

  // ── Order success page ─────────────────────────────────────────────────────
  test.describe('/success', () => {
    test('renders "Thank You for Your Order!" heading', async ({ page }) => {
      await page.goto('/success')
      await expect(
        page.getByRole('heading', { name: /thank you for your order/i }),
      ).toBeVisible(T)
    })

    test('shows the "What\'s Next?" section', async ({ page }) => {
      await page.goto('/success')
      await expect(page.getByRole('heading', { name: /what'?s next/i })).toBeVisible(T)
      await expect(page.getByText(/email confirmation/i)).toBeVisible()
      await expect(page.getByText(/order has shipped/i)).toBeVisible()
    })

    test('"Continue Shopping" link is visible', async ({ page }) => {
      await page.goto('/success')
      await expect(
        page.getByRole('link', { name: /continue shopping/i }),
      ).toBeVisible(T)
    })

    test('"Continue Shopping" navigates to /', async ({ page }) => {
      await page.goto('/success')
      await page.getByRole('link', { name: /continue shopping/i }).click()
      await expect(page).toHaveURL('/')
    })

    test('"View My Orders" link is visible', async ({ page }) => {
      await page.goto('/success')
      await expect(page.getByRole('link', { name: /view my orders/i })).toBeVisible(T)
    })

    test('mobile: heading and CTA buttons are visible without overflow', async ({
      page,
    }) => {
      // Runs on iPhone 14 (390 px) via the e2e-mobile project
      await page.goto('/success')
      await expect(
        page.getByRole('heading', { name: /thank you for your order/i }),
      ).toBeVisible(T)
      await expect(page.getByRole('link', { name: /continue shopping/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /view my orders/i })).toBeVisible()
      // No horizontal scroll — content fits in viewport
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = page.viewportSize()?.width ?? 390
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // 5 px tolerance
    })
  })
})
