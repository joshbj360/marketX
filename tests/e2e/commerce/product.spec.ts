import { test, expect } from '@playwright/test'
import { getFirstProductSlug } from '../../helpers/auth'

let PRODUCT_SLUG = 'adire-tie-dye-maxi-dress'
const T = { timeout: 15000 }

test.describe('Commerce — Product Detail', () => {
  test.beforeAll(async ({ request }) => {
    PRODUCT_SLUG = await getFirstProductSlug(request)
  })
  test('renders title as H1 heading', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    const title = await page.getByRole('heading', { level: 1 }).textContent()
    expect(title?.trim().length).toBeGreaterThan(0)
  })

  test('displays formatted price in brand color', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    // Price span has text-2xl + font-bold + text-brand — more specific than .text-brand.first()
    const priceEl = page.locator('span.text-2xl.font-bold.text-brand')
    await expect(priceEl).toBeVisible(T)
    const priceText = await priceEl.textContent()
    expect(priceText).toMatch(/₦/)
  })

  test('shows "Size / Option" variant selector', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    await expect(page.getByText(/Size \/ Option/i)).toBeVisible(T)
  })

  test('auto-selects a variant and shows stock indicator', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    // Stock indicator appears once a variant is auto-selected
    await expect(
      page.getByText(/in stock|only \d+ left|out of stock/i),
    ).toBeVisible(T)
    // Button is always present; may be disabled when stock=0
    await expect(
      page.locator('button').filter({ hasText: 'Add to Cart' }),
    ).toBeVisible(T)
  })

  test('quantity stepper increments then decrements', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)

    const qtySpan = page.locator('span.w-8.text-center')
    await expect(qtySpan).toHaveText('1', T)

    await page.getByRole('button', { name: '+' }).click()
    await expect(qtySpan).toHaveText('2')

    await page.locator('button').filter({ hasText: '−' }).click()
    await expect(qtySpan).toHaveText('1')
  })

  test('qty cannot go below 1', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)

    const qtySpan = page.locator('span.w-8.text-center')
    await expect(qtySpan).toHaveText('1', T)
    await page.locator('button').filter({ hasText: '−' }).click()
    await expect(qtySpan).toHaveText('1')
  })

  test('"Copy link" button shows "Copied!" feedback', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    await page.locator('button').filter({ hasText: 'Copy link' }).click()
    await expect(
      page.locator('button').filter({ hasText: 'Copied!' }),
    ).toBeVisible()
    // Reverts after timeout (2 s)
    await expect(
      page.locator('button').filter({ hasText: 'Copy link' }),
    ).toBeVisible({ timeout: 5000 })
  })

  test('"Share" button is visible', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    await expect(
      page.locator('button').filter({ hasText: 'Share' }),
    ).toBeVisible()
  })

  test('"Customer Reviews" section heading is present', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    await expect(
      page.getByRole('heading', { name: /customer reviews/i }),
    ).toBeVisible(T)
  })

  test('unknown slug shows "Product not found" with browse link', async ({
    page,
  }) => {
    await page.goto('/product/this-slug-does-not-exist-xyz123abc')
    await expect(page.getByText('Product not found')).toBeVisible(T)
    await expect(
      page.getByRole('link', { name: 'Browse products' }),
    ).toBeVisible()
  })

  test('"Browse products" link on not-found page goes to /discover', async ({
    page,
  }) => {
    await page.goto('/product/this-slug-does-not-exist-xyz123abc')
    await expect(
      page.getByRole('link', { name: 'Browse products' }),
    ).toBeVisible(T)
    await page.getByRole('link', { name: 'Browse products' }).click()
    await expect(page).toHaveURL('/discover')
  })

  test('seller badge links to the seller profile', async ({ page }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    // NuxtLink renders as <a href="/sellers/profile/...">
    const sellerLink = page.locator('a[href*="/sellers/profile/"]').first()
    await expect(sellerLink).toBeVisible(T)
  })

  test('mobile: image gallery and product info both visible', async ({
    page,
  }) => {
    await page.goto(`/product/${PRODUCT_SLUG}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible(T)
    // Main image container uses aspect-square
    await expect(page.locator('.aspect-square').first()).toBeVisible()
    // Price span is always part of the product info column
    await expect(
      page.locator('span.text-2xl.font-bold.text-brand'),
    ).toBeVisible()
  })
})
