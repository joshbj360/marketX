import { test, expect } from '@playwright/test'
import { apiLogin, TEST_SELLER, TEST_USER, uniqueEmail, uniqueUsername } from '../../../../../../../tests/helpers/auth'

const LIST = '/api/commerce/products'
const BY_SLUG = (slug: string) => `/api/commerce/products/by-slug/${slug}`
const BY_ID = (id: number) => `/api/commerce/products/${id}`

const SEED_SLUG = 'adire-tie-dye-maxi-dress'

// ─── Public read ──────────────────────────────────────────────────────────────

test.describe('GET /api/commerce/products — public listing', () => {
  test('returns product list without auth', async ({ request }) => {
    const res = await request.get(LIST)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data?.products)).toBe(true)
    expect(body.data.products.length).toBeGreaterThan(0)
  })

  test('supports limit and offset pagination', async ({ request }) => {
    const res = await request.get(`${LIST}?limit=2&offset=0`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.products.length).toBeLessThanOrEqual(2)
  })

  test('search filters results', async ({ request }) => {
    const res = await request.get(`${LIST}?search=adire`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})

test.describe('GET /api/commerce/products/by-slug/:slug — public', () => {
  test('returns product for known seed slug', async ({ request }) => {
    const res = await request.get(BY_SLUG(SEED_SLUG))
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.slug).toBe(SEED_SLUG)
    expect(Array.isArray(body.data.variants)).toBe(true)
    expect(body.data.variants.length).toBeGreaterThan(0)
  })

  test('returns 400 for missing slug', async ({ request }) => {
    const res = await request.get('/api/commerce/products/by-slug/')
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('returns 404 for unknown slug', async ({ request }) => {
    const res = await request.get(BY_SLUG('definitely-not-a-real-product-slug'))
    expect(res.status()).toBe(404)
  })
})

test.describe('GET /api/commerce/products/:id — public', () => {
  test('returns product for known seed id', async ({ request }) => {
    // Resolve id via slug first
    const slugRes = await request.get(BY_SLUG(SEED_SLUG))
    const { data: product } = await slugRes.json()
    const res = await request.get(BY_ID(product.id))
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe(product.id)
  })

  test('returns 404 for non-existent id', async ({ request }) => {
    const res = await request.get(BY_ID(999999999))
    expect(res.status()).toBe(404)
  })
})

// ─── Auth guards ──────────────────────────────────────────────────────────────

test.describe('POST /api/commerce/products — auth guard', () => {
  test('rejects unauthenticated request', async ({ request }) => {
    const res = await request.post(LIST, {
      data: { title: 'Unauthorized Product', price: 1000 },
    })
    expect(res.status()).toBe(401)
  })

  test('rejects user with no seller profile', async ({ request }) => {
    // Register a fresh user — guaranteed no seller profile.
    // Skip if rate-limited (register limit is 3/hr by IP; auth suite may exhaust it first).
    const email = uniqueEmail()
    const username = uniqueUsername()
    const regRes = await request.post('/api/auth/register', {
      data: { email, username, password: 'ValidPass123!', confirmPassword: 'ValidPass123!' },
    })
    test.skip(regRes.status() === 429, 'IP register rate-limit exhausted by auth test suite')

    const { token } = await apiLogin(request, { email, password: 'ValidPass123!' })
    const res = await request.post(LIST, {
      data: { title: 'Buyer Product Attempt', price: 1000 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(403)
  })
})

// ─── Seller write ─────────────────────────────────────────────────────────────

test.describe('POST /api/commerce/products — seller create', () => {
  let createdId: number | null = null

  test('seller can create a product', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_SELLER)
    const title = `Test Product ${Date.now()}`
    const res = await request.post(LIST, {
      data: {
        title,
        price: 5000,
        description: 'A test product created by automated tests.',
        variants: [{ size: 'One Size', stock: 10 }],
      },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.title).toBe(title)
    createdId = body.data.id
  })

  test('rejects product with missing title', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_SELLER)
    const res = await request.post(LIST, {
      data: { price: 5000 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  test('rejects product with zero price', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_SELLER)
    const res = await request.post(LIST, {
      data: { title: 'Zero Price', price: 0 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  test.afterAll(async ({ request }) => {
    if (!createdId) return
    const { token } = await apiLogin(request, TEST_SELLER)
    await request.delete(BY_ID(createdId), {
      headers: { Authorization: `Bearer ${token}` },
    })
  })
})

test.describe('PATCH /api/commerce/products/:id — seller update', () => {
  test('rejects unauthenticated update', async ({ request }) => {
    const res = await request.patch(BY_ID(1), { data: { title: 'Hacked' } })
    expect(res.status()).toBe(401)
  })
})

test.describe('DELETE /api/commerce/products/:id — seller delete', () => {
  test('rejects unauthenticated delete', async ({ request }) => {
    const res = await request.delete(BY_ID(1))
    expect(res.status()).toBe(401)
  })
})
