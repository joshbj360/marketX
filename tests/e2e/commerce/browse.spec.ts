import { test, expect } from '@playwright/test'

const T = { timeout: 15000 }

// Stable reference to the single search input inside the sticky header
const stickyInput = (page: any) =>
  page.locator('.discover-sticky-header input[type="text"]')

test.describe('Commerce — Browse & Discovery', () => {
  // ── /discover ─────────────────────────────────────────────────────────────
  test.describe('/discover', () => {
    test('renders heading, search input, and tab bar', async ({ page }) => {
      await page.goto('/discover')
      await expect(page.getByRole('heading', { name: 'Discover' })).toBeVisible(T)
      await expect(stickyInput(page)).toBeVisible()
      for (const tab of ['Trending', 'Products', 'Deals', 'Pre-loved']) {
        await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible()
      }
    })

    test('sticky header stays in viewport on scroll', async ({ page }) => {
      await page.goto('/discover')
      await expect(page.locator('.discover-sticky-header')).toBeVisible(T)
      await page.evaluate(() => window.scrollTo(0, 500))
      await expect(page.locator('.discover-sticky-header')).toBeInViewport()
    })

    test('Products tab: shows grid or empty state, no JS error', async ({ page }) => {
      await page.goto('/discover')
      await page.getByRole('button', { name: 'Products', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
      await expect(page.locator('body')).not.toContainText('Something went wrong')
    })

    test('Deals tab: shows content', async ({ page }) => {
      await page.goto('/discover')
      await page.getByRole('button', { name: 'Deals', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
    })

    test('Pre-loved tab: shows content', async ({ page }) => {
      await page.goto('/discover')
      await page.getByRole('button', { name: 'Pre-loved', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
    })

    test('Fresh Drops tab: shows content', async ({ page }) => {
      await page.goto('/discover')
      await page.getByRole('button', { name: 'Fresh Drops', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
    })

    test('Sellers tab: shows grid or empty state', async ({ page }) => {
      await page.goto('/discover')
      await page.getByRole('button', { name: 'Sellers', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
    })

    test('People tab: prompts to search by username when no input', async ({ page }) => {
      // URL navigation is more reliable than clicking a tab in a scrollable container
      await page.goto('/discover?tab=people')
      await expect(
        page.locator('p').filter({ hasText: 'Search by username or name' }).first(),
      ).toBeVisible(T)
    })

    test('search returns "No products found" for garbage input', async ({ page }) => {
      await page.goto('/discover')
      // networkidle ensures Vue has hydrated tab-button click handlers
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: 'Products', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)

      const input = stickyInput(page)
      await expect(input).toBeVisible(T)
      await input.fill('zzz_nomatch_xyz_12345')
      // 350 ms debounce + network round-trip; give full 15 s on slow dev servers
      await expect(page.getByText(/No products found/i)).toBeVisible(T)
    })

    test('"Clear search" button removes no-results state', async ({ page }) => {
      await page.goto('/discover')
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: 'Products', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)

      const input = stickyInput(page)
      await input.fill('zzz_nomatch_xyz_12345')
      await expect(page.getByText(/No products found/i)).toBeVisible(T)

      await page.getByRole('button', { name: 'Clear search' }).click()
      await expect(page.getByText(/No products found/i)).not.toBeVisible()
    })

    test('tab switch resets search input', async ({ page }) => {
      await page.goto('/discover')
      await page.getByRole('button', { name: 'Products', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)

      const input = stickyInput(page)
      await input.fill('aso-oke')
      // Switch tabs — the watch resets searchInput
      await page.getByRole('button', { name: 'Deals', exact: true }).click()
      await expect(input).toHaveValue('', T)
    })

    test('Squares tab: shows grid or empty state', async ({ page }) => {
      await page.goto('/discover')
      await page.getByRole('button', { name: 'Squares', exact: true }).click()
      await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
    })
  })

  // ── /discover?tab= deep-links ─────────────────────────────────────────────
  test('deep-linking ?tab=fresh loads Fresh Drops content', async ({ page }) => {
    await page.goto('/discover?tab=fresh')
    await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('deep-linking ?tab=deals loads Deals content', async ({ page }) => {
    await page.goto('/discover?tab=deals')
    await expect(page.locator('.grid, [class*="py-24"]').first()).toBeVisible(T)
  })

  // ── Standalone listing pages ───────────────────────────────────────────────
  test('/deals page loads without errors', async ({ page }) => {
    await page.goto('/deals')
    await expect(page.locator('.grid, [class*="py-"]').first()).toBeVisible(T)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/fresh-drops page loads without errors', async ({ page }) => {
    await page.goto('/fresh-drops')
    await expect(page.locator('.grid, [class*="py-"]').first()).toBeVisible(T)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/pre-loved page loads without errors', async ({ page }) => {
    await page.goto('/pre-loved')
    await expect(page.locator('.grid, [class*="py-"]').first()).toBeVisible(T)
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('/thrift permanently redirects to /pre-loved', async ({ page }) => {
    await page.goto('/thrift')
    await expect(page).toHaveURL(/\/pre-loved/)
  })
})

// ── /discover filter sidebar (desktop only) ───────────────────────────────────
test.describe('/discover — filter sidebar', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  // Locate the right sidebar by the h3 "Filters" heading it contains
  const filterSidebar = (page: any) =>
    page.locator('aside').filter({ has: page.locator('h3', { hasText: 'Filters' }) })

  test('filter panel is visible on desktop', async ({ page }) => {
    await page.goto('/discover')
    await expect(filterSidebar(page)).toBeVisible(T)
  })

  test('Trending tab (default) shows Time range section', async ({ page }) => {
    await page.goto('/discover')
    await expect(filterSidebar(page).getByText(/time range/i)).toBeVisible(T)
  })

  test('Products tab shows Sort by and Price range sections', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Products', exact: true }).click()
    await expect(filterSidebar(page).getByText(/sort by/i)).toBeVisible(T)
    await expect(filterSidebar(page).getByText(/price range/i)).toBeVisible(T)
  })

  test('clicking a non-default sort chip activates it and shows filter count badge', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Products', exact: true }).click()
    const popularChip = filterSidebar(page).getByRole('button', { name: 'Popular' })
    await popularChip.click()
    await expect(popularChip).toHaveClass(/filter-chip--active/, T)
    await expect(filterSidebar(page).locator('span.bg-brand.rounded-full')).toBeVisible(T)
  })

  test('"Clear all" button resets active filters', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Products', exact: true }).click()
    await filterSidebar(page).getByRole('button', { name: 'Popular' }).click()
    const clearBtn = filterSidebar(page).getByRole('button', { name: 'Clear all' })
    await expect(clearBtn).toBeVisible(T)
    await clearBtn.click()
    await expect(clearBtn).not.toBeVisible(T)
  })

  test('Deals tab shows Minimum discount section', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Deals', exact: true }).click()
    await expect(filterSidebar(page).getByText(/minimum discount/i)).toBeVisible(T)
  })

  test('Pre-loved tab shows eco badge note', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Pre-loved', exact: true }).click()
    await expect(filterSidebar(page).getByText(/pre-loved items/i)).toBeVisible(T)
  })

  test('Sellers tab shows "Has active deals" toggle', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Sellers', exact: true }).click()
    await expect(filterSidebar(page).getByText('Has active deals')).toBeVisible(T)
  })

  test('Tags tab shows "Sort tags by" section', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Tags', exact: true }).click()
    await expect(filterSidebar(page).getByText(/sort tags by/i)).toBeVisible(T)
  })

  test('People tab shows no-filters placeholder', async ({ page }) => {
    await page.goto('/discover?tab=people')
    await expect(filterSidebar(page).getByText(/use the search bar/i)).toBeVisible(T)
  })

  test('filter sidebar "Browsing" hint updates when tab changes', async ({ page }) => {
    await page.goto('/discover')
    await page.getByRole('button', { name: 'Products', exact: true }).click()
    await expect(filterSidebar(page).getByText('Products')).toBeVisible(T)
    await page.getByRole('button', { name: 'Deals', exact: true }).click()
    await expect(filterSidebar(page).getByText('Deals')).toBeVisible(T)
  })
})
