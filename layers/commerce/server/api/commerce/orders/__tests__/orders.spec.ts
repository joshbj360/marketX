import { test, expect } from '@playwright/test'
import { apiLogin, TEST_SELLER, TEST_USER } from '../../../../../../../tests/helpers/auth'

const ORDERS = '/api/commerce/orders'
const ORDER = (id: string) => `/api/commerce/orders/${id}`
const SELLER_ORDERS = '/api/commerce/orders/seller'

// ─── Auth guards ──────────────────────────────────────────────────────────────

test.describe('Orders — auth guards', () => {
  test('GET /api/commerce/orders requires auth', async ({ request }) => {
    const res = await request.get(ORDERS)
    expect(res.status()).toBe(401)
  })

  test('POST /api/commerce/orders requires auth', async ({ request }) => {
    const res = await request.post(ORDERS, { data: {} })
    expect(res.status()).toBe(401)
  })

  test('GET /api/commerce/orders/:id requires auth', async ({ request }) => {
    const res = await request.get(ORDER('some-id'))
    expect(res.status()).toBe(401)
  })

  test('POST /api/commerce/orders/:id/cancel requires auth', async ({ request }) => {
    const res = await request.post(`${ORDER('some-id')}/cancel`)
    expect(res.status()).toBe(401)
  })

  test('GET /api/commerce/orders/seller requires auth', async ({ request }) => {
    const res = await request.get(SELLER_ORDERS)
    expect(res.status()).toBe(401)
  })
})

// ─── Buyer order list ─────────────────────────────────────────────────────────

test.describe('GET /api/commerce/orders — buyer', () => {
  test('returns order list for authenticated buyer', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.get(ORDERS, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data?.orders ?? body.data)).toBe(true)
  })

  test('supports pagination params', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.get(`${ORDERS}?limit=5&offset=0`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
  })

  test('returns 4xx for non-existent order id', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.get(ORDER('999999999'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})

// ─── Seller order list ────────────────────────────────────────────────────────

test.describe('GET /api/commerce/orders/seller — seller', () => {
  test('returns seller order list', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_SELLER)
    const res = await request.get(`${SELLER_ORDERS}?storeSlug=${TEST_SELLER.storeSlug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data?.orders)).toBe(true)
  })

  test('returns 400 when storeSlug is missing', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_SELLER)
    const res = await request.get(SELLER_ORDERS, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(400)
  })

  test('returns 403 when requesting another seller\'s orders', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.get(`${SELLER_ORDERS}?storeSlug=${TEST_SELLER.storeSlug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(403)
  })
})

// ─── Order placement validation ───────────────────────────────────────────────

test.describe('POST /api/commerce/orders — validation', () => {
  test('rejects empty cart / missing fields', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.post(ORDERS, {
      data: {},
      headers: { Authorization: `Bearer ${token}` },
    })
    // Empty cart or missing shipping must fail — 400 or 422, never 500
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})

// ─── Cancel order ─────────────────────────────────────────────────────────────

test.describe('POST /api/commerce/orders/:id/cancel', () => {
  test('returns 4xx for unknown order id', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.post(`${ORDER('999999999')}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})
