/**
 * Home feed tests — covers both the guest (MarketHome) and auth (SocialFeed) views.
 *
 * Guest view:  "Today's deals" shelf + "Browse by market" shelf + "Fresh Drops"
 * Auth view:   personalised social feed rendered inside the same HomeLayout
 */
import { test, expect } from '../../helpers/fixtures'
import { pageLogin, apiLogin, TEST_USER } from '../../helpers/auth'

const T = { timeout: 15000 }

// ── GUEST / UNAUTHENTICATED ──────────────────────────────────────────────────

test.describe('home — guest (MarketHome)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
  })

  test('renders "Today\'s deals" section heading', async ({ page }) => {
    await expect(page.getByText("Today's deals")).toBeVisible(T)
  })

  test('renders "Browse by market" section heading', async ({ page }) => {
    await expect(page.getByText('Browse by market')).toBeVisible(T)
  })

  test('"See all →" links navigate to /discover', async ({ page }) => {
    const seeAll = page.getByRole('link', { name: /see all/i }).first()
    await expect(seeAll).toBeVisible(T)
    await seeAll.click()
    await expect(page).toHaveURL(/\/discover/, T)
  })

  test('"All markets →" link navigates to /squares', async ({ page }) => {
    const link = page.getByRole('link', { name: /all markets/i })
    await expect(link).toBeVisible(T)
    await link.click()
    await expect(page).toHaveURL('/squares', T)
  })

  test('deals section shows products or empty fallback — not stuck loading', async ({ page }) => {
    // Either products rendered OR the "No deals" message — never blank
    await expect(
      page.locator('.feed-product-shelf, [data-testid="product-card"]').first()
        .or(page.getByText(/no deals right now/i)),
    ).toBeVisible(T)
  })

  test('squares section shows square cards or empty fallback — not stuck loading', async ({ page }) => {
    // Either square card links render, or the "No squares yet" fallback appears.
    // Longer timeout: full suite runs after Lighthouse (CPU-intensive) so server may be slower.
    await expect(
      page.locator('a[href^="/squares/"]').first()
        .or(page.getByText('No squares yet')),
    ).toBeVisible({ timeout: 30000 })
  })

  test('sign-in button navigates to /user-login', async ({ page }) => {
    const signIn = page.getByRole('button', { name: /sign in/i })
      .or(page.getByRole('link', { name: /sign in/i }))
    if (await signIn.count() > 0) {
      await signIn.first().click()
      await expect(page).toHaveURL(/user-login/, T)
    }
  })

  test('no accessibility violations on guest home', async ({ page, makeAxeBuilder }) => {
    const results = await makeAxeBuilder().analyze()
    expect(results.violations).toEqual([])
  })
})

// ── AUTHENTICATED / SOCIAL FEED ───────────────────────────────────────────────

test.describe('home — authenticated (SocialFeed)', () => {
  test.beforeEach(async ({ page, request }) => {
    await pageLogin(page, request)
    // SSE/WS connections after login never reach networkidle — use domcontentloaded
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('renders social feed — SplashScreen clears after auth', async ({ page }) => {
    // SplashScreen (fixed inset-0 z-[100]) shows while feed is loading, then hides
    const splash = page.locator('.fixed.inset-0.z-\\[100\\]')
    await expect(splash).not.toBeVisible({ timeout: 30000 })
  })

  test('feed is not stuck on SplashScreen after auth', async ({ page }) => {
    // After SplashScreen clears, the page should not show a fatal error
    const splash = page.locator('.fixed.inset-0.z-\\[100\\]')
    await expect(splash).not.toBeVisible({ timeout: 30000 })
    // "Today's deals" is the guest/MarketHome heading — should NOT be visible when logged in
    // (SocialFeed is shown instead)
    await expect(page.getByText("Today's deals")).not.toBeVisible()
  })
})

// ── VISUAL SNAPSHOT ───────────────────────────────────────────────────────────

test('guest home — visual snapshot', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.getByText("Today's deals")).toBeVisible(T)
  // Hide images + animate elements so layout is stable across runs with dynamic content
  await page.addStyleTag({
    content: `
      img { visibility: hidden !important; }
      * { animation: none !important; transition: none !important; }
    `,
  })
  // maxDiffPixelRatio: 0.1 = 10% tolerance for dynamic text content variation
  await expect(page).toHaveScreenshot('home-guest.png', { maxDiffPixelRatio: 0.1 })
})
