import { test, expect } from '@playwright/test'
import { apiLogin, TEST_USER, TEST_SELLER, uniqueEmail, uniqueUsername, resetRateLimits } from '../../../../../../tests/helpers/auth'

const SELLER = '/api/seller'
const SEED_SLUG = TEST_SELLER.storeSlug // 'balogun-fabrics'

// ─── Public endpoints ──────────────────────────────────────────────────────────

test.describe('seller — public endpoints', () => {
  test('GET /api/seller/featured returns paginated sellers', async ({ request }) => {
    const res = await request.get(`${SELLER}/featured`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.meta).toBeTruthy()
  })

  test('GET /api/seller/featured respects limit param', async ({ request }) => {
    const res = await request.get(`${SELLER}/featured?limit=2`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.length).toBeLessThanOrEqual(2)
  })

  test('GET /api/seller/featured supports search param', async ({ request }) => {
    const res = await request.get(`${SELLER}/featured?search=balogun`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('GET /api/seller/by-slug/:slug returns seed seller', async ({ request }) => {
    const res = await request.get(`${SELLER}/by-slug/${SEED_SLUG}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.store_slug).toBe(SEED_SLUG)
  })

  test('GET /api/seller/by-slug with unknown slug returns 404', async ({ request }) => {
    const res = await request.get(`${SELLER}/by-slug/this-store-does-not-exist-99999`)
    expect(res.status()).toBe(404)
  })

  test('GET /api/seller/:slug returns seed seller (by slug)', async ({ request }) => {
    const res = await request.get(`${SELLER}/${SEED_SLUG}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toBeTruthy()
  })

  test('GET /api/seller/:slug/products returns seller products', async ({ request }) => {
    const res = await request.get(`${SELLER}/${SEED_SLUG}/products`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    // Response shape: { success, data: { products: [...], total, limit, offset } }
    expect(Array.isArray(body.data?.products)).toBe(true)
  })
})

// ─── Auth guards ───────────────────────────────────────────────────────────────

test.describe('seller — auth guards', () => {
  test('POST /api/seller/register requires auth', async ({ request }) => {
    const res = await request.post(`${SELLER}/register`, {
      data: { store_name: 'My Shop', store_slug: 'my-shop' },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /api/seller/list requires auth', async ({ request }) => {
    const res = await request.get(`${SELLER}/list`)
    expect(res.status()).toBe(401)
  })

  test('GET /api/seller/following-ids requires auth', async ({ request }) => {
    const res = await request.get(`${SELLER}/following-ids`)
    expect(res.status()).toBe(401)
  })

  test('PATCH /api/seller/:id requires auth', async ({ request }) => {
    const res = await request.patch(`${SELLER}/${SEED_SLUG}`, {
      data: { store_description: 'x' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/seller/:id/follow requires auth', async ({ request }) => {
    const res = await request.post(`${SELLER}/${SEED_SLUG}/follow`)
    expect(res.status()).toBe(401)
  })

  test('DELETE /api/seller/:id/unfollow requires auth', async ({ request }) => {
    const res = await request.delete(`${SELLER}/${SEED_SLUG}/unfollow`)
    expect(res.status()).toBe(401)
  })
})

// ─── Registration ──────────────────────────────────────────────────────────────

test.describe('seller — registration', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    await resetRateLimits(request)
    ;({ token } = await apiLogin(request))
  })

  test('rejects missing store_name', async ({ request }) => {
    const res = await request.post(`${SELLER}/register`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { store_slug: 'valid-slug-123' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects missing store_slug', async ({ request }) => {
    const res = await request.post(`${SELLER}/register`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { store_name: 'Valid Name' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects store_slug with uppercase letters', async ({ request }) => {
    const res = await request.post(`${SELLER}/register`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { store_name: 'Valid Name', store_slug: 'InvalidSlug' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects store_slug shorter than 3 chars', async ({ request }) => {
    const res = await request.post(`${SELLER}/register`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { store_name: 'Valid Name', store_slug: 'ab' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects duplicate slug', async ({ request }) => {
    const res = await request.post(`${SELLER}/register`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { store_name: 'Balogun Fabrics Copy', store_slug: SEED_SLUG },
    })
    // Duplicate slug → 400 (SellerError) or 409
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})

// ─── Slug utilities (public) ──────────────────────────────────────────────────

test.describe('seller — slug utilities', () => {
  test('POST /api/seller/suggest-slug returns suggestions', async ({ request }) => {
    const res = await request.post(`${SELLER}/suggest-slug`, {
      data: { baseName: 'My Amazing Store' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    // Response shape: { success, suggestions: [...] }
    expect(Array.isArray(body.suggestions)).toBe(true)
  })

  test('POST /api/seller/check-slug returns availability', async ({ request }) => {
    const res = await request.post(`${SELLER}/check-slug`, {
      data: { slug: SEED_SLUG },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.available).toBe(false) // seed slug is taken
  })

  test('POST /api/seller/check-slug reports available slug', async ({ request }) => {
    const res = await request.post(`${SELLER}/check-slug`, {
      data: { slug: `not-taken-${Date.now()}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.available).toBe(true)
  })
})

// ─── Follow / Unfollow ─────────────────────────────────────────────────────────

test.describe('seller — follow / unfollow', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    ;({ token } = await apiLogin(request))
  })

  test('follow-status returns isFollowing without auth', async ({ request }) => {
    const res = await request.get(`${SELLER}/${SEED_SLUG}/follow-status`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data?.isFollowing).toBe(false)
  })

  test('GET /api/seller/following-ids returns array when authenticated', async ({ request }) => {
    const res = await request.get(`${SELLER}/following-ids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('follow then unfollow balogun-fabrics', async ({ request }) => {
    const follow = await request.post(`${SELLER}/${SEED_SLUG}/follow`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    // 200 or 409 (already following) are both acceptable
    expect(follow.status()).toBeLessThan(500)

    const unfollow = await request.delete(`${SELLER}/${SEED_SLUG}/unfollow`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(unfollow.status()).toBeLessThan(500)
  })
})
