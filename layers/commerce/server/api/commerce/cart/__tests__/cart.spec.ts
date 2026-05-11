import { test, expect } from '@playwright/test'
import { apiLogin, clearCart, getFirstVariantId, TEST_USER } from '../../../../../../../tests/helpers/auth'

const CART = '/api/commerce/cart'
const CART_ITEM = (variantId: number) => `/api/commerce/cart/${variantId}`
const VALIDATE = '/api/commerce/cart/validate'

// ─── Auth guards ──────────────────────────────────────────────────────────────

test.describe('Cart — auth guards', () => {
  test('GET /api/commerce/cart requires auth', async ({ request }) => {
    const res = await request.get(CART)
    expect(res.status()).toBe(401)
  })

  test('POST /api/commerce/cart requires auth', async ({ request }) => {
    const res = await request.post(CART, { data: { variantId: 1 } })
    expect(res.status()).toBe(401)
  })

  test('PATCH /api/commerce/cart/:id requires auth', async ({ request }) => {
    const res = await request.patch(CART_ITEM(1), { data: { quantity: 2 } })
    expect(res.status()).toBe(401)
  })

  test('DELETE /api/commerce/cart/:id requires auth', async ({ request }) => {
    const res = await request.delete(CART_ITEM(1))
    expect(res.status()).toBe(401)
  })

  test('GET /api/commerce/cart/validate requires auth', async ({ request }) => {
    const res = await request.get(VALIDATE)
    expect(res.status()).toBe(401)
  })
})

// ─── Input validation ─────────────────────────────────────────────────────────

test.describe('POST /api/commerce/cart — validation', () => {
  test('rejects missing variantId', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.post(CART, {
      data: { quantity: 1 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects non-existent variantId', async ({ request }) => {
    const { token } = await apiLogin(request, TEST_USER)
    const res = await request.post(CART, {
      data: { variantId: 999999999, quantity: 1 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})

// ─── CRUD flow ────────────────────────────────────────────────────────────────

test.describe('Cart — full CRUD flow', () => {
  let token: string
  let variantId: number

  test.beforeAll(async ({ request }) => {
    const login = await apiLogin(request, TEST_USER)
    token = login.token
    variantId = await getFirstVariantId(request)
    // Start clean
    await clearCart(request, token)
  })

  test('add item returns success', async ({ request }) => {
    const res = await request.post(CART, {
      data: { variantId, quantity: 1 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('get cart contains the added item', async ({ request }) => {
    const res = await request.get(CART, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    const items: Array<{ variantId: number }> = body.data?.items ?? []
    expect(items.some((i) => i.variantId === variantId)).toBe(true)
  })

  test('update quantity succeeds', async ({ request }) => {
    const res = await request.patch(CART_ITEM(variantId), {
      data: { quantity: 2 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('validate cart returns item status', async ({ request }) => {
    const res = await request.get(VALIDATE, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data?.items)).toBe(true)
    expect(typeof body.data?.hasIssues).toBe('boolean')
    const item = body.data.items.find((i: any) => i.variantId === variantId)
    expect(item).toBeTruthy()
  })

  test('delete item removes it from cart', async ({ request }) => {
    const res = await request.delete(CART_ITEM(variantId), {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('cart is empty after deletion', async ({ request }) => {
    const res = await request.get(CART, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()
    const items: Array<{ variantId: number }> = body.data?.items ?? []
    expect(items.some((i) => i.variantId === variantId)).toBe(false)
  })

  test.afterAll(async ({ request }) => {
    await clearCart(request, token)
  })
})

// ─── Adding same item twice ───────────────────────────────────────────────────

test.describe('Cart — idempotency', () => {
  let token: string
  let variantId: number

  test.beforeAll(async ({ request }) => {
    const login = await apiLogin(request, TEST_USER)
    token = login.token
    variantId = await getFirstVariantId(request)
    await clearCart(request, token)
  })

  test('adding same variant twice merges or updates quantity', async ({ request }) => {
    await request.post(CART, {
      data: { variantId, quantity: 1 },
      headers: { Authorization: `Bearer ${token}` },
    })
    const res = await request.post(CART, {
      data: { variantId, quantity: 1 },
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    // Cart should not have two separate rows for the same variant
    const cartRes = await request.get(CART, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await cartRes.json()
    const matching = (body.data?.items ?? []).filter(
      (i: any) => i.variantId === variantId,
    )
    expect(matching.length).toBe(1)
  })

  test.afterAll(async ({ request }) => {
    await clearCart(request, token)
  })
})
