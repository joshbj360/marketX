/**
 * Reels page tests (/reels)
 *
 * Reels uses a full-screen immersive layout with snap-scroll.
 * We verify the container exists, loading resolves, and at least one reel
 * or an appropriate empty/error state appears.
 */
import { test, expect } from '../../helpers/fixtures'
import { pageLogin } from '../../helpers/auth'

const T = { timeout: 15000 }

test.describe('reels (/reels)', () => {
  test('page loads without crashing', async ({ page }) => {
    await page.goto('/reels', { waitUntil: 'networkidle' })
    // The full-screen container must be present
    await expect(page.locator('.snap-mandatory, .scrollbar-hide').first()).toBeVisible(T)
  })

  test('back button is visible on mobile viewport', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    await page.goto('/reels', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /go back/i })).toBeVisible(T)
    await ctx.close()
  })

  test('loading spinner resolves — at least one reel or empty state appears', async ({ page }) => {
    await page.goto('/reels', { waitUntil: 'networkidle' })
    // Either a reel card, an empty state, or the error state — not stuck on spinner
    await expect(
      page.locator('video, [data-testid="reel-card"]').first()
        .or(page.getByText(/no reels yet|connection error/i)),
    ).toBeVisible(T)
  })

  test('reels page uses black background', async ({ page }) => {
    await page.goto('/reels', { waitUntil: 'networkidle' })
    const container = page.locator('.bg-black').first()
    await expect(container).toBeVisible(T)
  })
})

test.describe('reels — authenticated', () => {
  test.beforeEach(async ({ page, request }) => {
    await pageLogin(page, request)
  })

  test('authenticated user can access reels', async ({ page }) => {
    // SSE/WS connections after login never reach networkidle
    await page.goto('/reels', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.snap-mandatory, .scrollbar-hide').first()).toBeVisible(T)
  })
})
