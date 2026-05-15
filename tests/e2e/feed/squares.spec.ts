/**
 * Squares tests — index page (/squares) + detail page (/squares/[slug])
 *
 * Seed data: relies on at least one square being seeded in the test DB.
 * The smoke test slug is derived dynamically from the first card on the index page.
 */
import { test, expect } from '../../helpers/fixtures'
import { pageLogin } from '../../helpers/auth'

const T = { timeout: 15000 }

// ── SQUARES INDEX ─────────────────────────────────────────────────────────────

test.describe('squares index (/squares)', () => {
  test.beforeEach(async ({ page }) => {
    // networkidle is safe here — /squares (guest) has no SSE/Pusher connections
    await page.goto('/squares', { waitUntil: 'networkidle' })
  })

  test('renders page heading "Market Squares"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /market squares/i })).toBeVisible(T)
  })

  test('renders subtitle text', async ({ page }) => {
    await expect(
      page.getByText(/localised communities of shops and buyers/i),
    ).toBeVisible(T)
  })

  test('search input is present', async ({ page }) => {
    const input = page.locator('input[type="search"]')
    await expect(input).toBeVisible(T)
    await expect(input).toHaveAttribute('placeholder', /search squares/i)
  })

  test('filter tabs render — All, Location, Category', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible(T)
    await expect(page.getByRole('button', { name: /location/i })).toBeVisible(T)
    await expect(page.getByRole('button', { name: /category/i })).toBeVisible(T)
  })

  test('"All" tab is active by default (amber highlight)', async ({ page }) => {
    const allTab = page.getByRole('button', { name: 'All', exact: true })
    await expect(allTab).toHaveClass(/bg-amber-500/, T)
  })

  test('clicking Location tab marks it active', async ({ page }) => {
    const locationTab = page.getByRole('button', { name: /location/i })
    await locationTab.click()
    await expect(locationTab).toHaveClass(/bg-amber-500/, T)
  })

  test('clicking Category tab marks it active', async ({ page }) => {
    const categoryTab = page.getByRole('button', { name: /category/i })
    await categoryTab.click()
    await expect(categoryTab).toHaveClass(/bg-amber-500/, T)
  })

  test('squares load or empty state is shown — no infinite skeleton', async ({ page }) => {
    await expect(
      page.locator('a[href^="/squares/"]').first()
        .or(page.getByText(/try a different search|no squares/i)),
    ).toBeVisible(T)
  })

  test('"View on Map" link navigates to /map', async ({ page }) => {
    const link = page.getByRole('link', { name: /view on map/i })
    await expect(link).toBeVisible(T)
    await link.click()
    await expect(page).toHaveURL('/map', T)
  })

  test('typing in search filters results or shows empty state', async ({ page }) => {
    const input = page.locator('input[type="search"]')
    // Initial content already loaded (networkidle); fill triggers debounce → refetch
    await input.fill('zzz_nomatch_xyz_99999')
    // Debounce is 350ms + API round-trip — allow up to 8s. Use .first() since the
    // empty state renders both a heading and sub-text that match the pattern.
    await expect(
      page.getByText(/no squares found|try a different search/i).first(),
    ).toBeVisible({ timeout: 8000 })
  })

  test('clearing search removes the no-match empty state', async ({ page }) => {
    const input = page.locator('input[type="search"]')
    await input.fill('zzz_nomatch_xyz_99999')
    await expect(page.getByText(/no squares found/i).first()).toBeVisible({ timeout: 8000 })
    await input.fill('')
    // After clearing, useFetch re-fetches immediately (queryParams changes) and shows
    // the loading skeleton, hiding "No squares found". Allow up to 15s for slow CI.
    await expect(page.getByText(/no squares found/i)).not.toBeVisible({ timeout: 15000 })
  })

  test('no accessibility violations on squares index', async ({ page, makeAxeBuilder }) => {
    const results = await makeAxeBuilder().analyze()
    expect(results.violations).toEqual([])
  })
})

// ── SQUARE DETAIL ─────────────────────────────────────────────────────────────

// Known seed square — matches prisma/seed.ts
const SQUARE_SLUG = 'balogun-market-lagos'

test.describe('square detail (/squares/[slug])', () => {
  const squareSlug = SQUARE_SLUG

  // Navigate to blank before each test so lingering connections from other
  // tests don't prevent the detail page from reaching networkidle.
  test.beforeEach(async ({ page }) => {
    await page.goto('about:blank')
  })

  test('renders square banner and name', async ({ page }) => {
    await page.goto(`/squares/${squareSlug}`, { waitUntil: 'networkidle' })
    // Banner area (image or gradient fallback)
    await expect(page.locator('.sq-profile-wrap')).toBeVisible(T)
    // Name heading appears somewhere on the page
    await expect(page.locator('h1, h2').first()).toBeVisible(T)
  })

  test('all five content tabs are visible', async ({ page }) => {
    await page.goto(`/squares/${squareSlug}`, { waitUntil: 'networkidle' })
    for (const label of ['All', 'Posts', 'Products', 'Sellers']) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible(T)
    }
    await expect(page.getByRole('button', { name: /announcements/i })).toBeVisible(T)
  })

  test('"All" tab is active by default', async ({ page }) => {
    await page.goto(`/squares/${squareSlug}`, { waitUntil: 'networkidle' })
    const allTab = page.getByRole('button', { name: 'All', exact: true })
    // Detail page tabs use underline style: border-b-2 border-amber-500
    await expect(allTab).toHaveClass(/border-amber-500/, T)
  })

  test('switching to Sellers tab shows sellers or empty state', async ({ page }) => {
    await page.goto(`/squares/${squareSlug}`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Sellers', exact: true }).click()
    // Either seller cards or "No sellers in this square yet" message
    await expect(
      page.locator('a[href*="/sellers/profile/"]').first()
        .or(page.getByText(/no sellers in this square/i)),
    ).toBeVisible(T)
  })

  test('switching to Products tab marks it active', async ({ page }) => {
    await page.goto(`/squares/${squareSlug}`, { waitUntil: 'networkidle' })
    const productsTab = page.getByRole('button', { name: 'Products', exact: true })
    await productsTab.click()
    // Tab becomes active (underline style)
    await expect(productsTab).toHaveClass(/border-amber-500/, T)
  })

  test('invalid slug shows "Square not found" error', async ({ page }) => {
    await page.goto('/squares/this-square-does-not-exist-xyz', { waitUntil: 'networkidle' })
    await expect(page.getByText(/square not found/i)).toBeVisible(T)
  })

  test('"Browse all squares" link on error page goes to discover squares', async ({ page }) => {
    await page.goto('/squares/this-square-does-not-exist-xyz', { waitUntil: 'networkidle' })
    const link = page.getByRole('link', { name: /browse all squares/i })
    await expect(link).toBeVisible(T)
    await link.click()
    // Link targets /discover?tab=squares
    await expect(page).toHaveURL(/discover.*squares|squares.*discover/, T)
  })

  test('follow button visible on square page (guest sees follow CTA)', async ({ page }) => {
    await page.goto(`/squares/${squareSlug}`, { waitUntil: 'networkidle' })
    // 30s: square data loads inside v-else-if="square"; server may be slower late in the suite
    await expect(page.getByRole('button', { name: /follow|following/i })).toBeVisible({ timeout: 30000 })
  })

  test('authenticated user sees follow/following button on square page', async ({ page, request }) => {
    await pageLogin(page, request)
    await page.goto(`/squares/${squareSlug}`, { waitUntil: 'domcontentloaded' })
    // Follow button is visible for logged-in users (either Follow or Following state)
    await expect(
      page.getByRole('button', { name: /^follow$|^following$/i }),
    ).toBeVisible(T)
  })
})

// ── VISUAL SNAPSHOT ───────────────────────────────────────────────────────────

test('squares index — visual snapshot', async ({ page }) => {
  await page.goto('/squares', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: /market squares/i })).toBeVisible(T)
  // Hide dynamic square images for a layout-stable snapshot
  await page.addStyleTag({ content: 'img { visibility: hidden !important; }' })
  await expect(page).toHaveScreenshot('squares-index.png', { maxDiffPixelRatio: 0.05 })
})
