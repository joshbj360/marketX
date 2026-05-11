import { test, expect } from '@playwright/test'
import { apiLogin, TEST_USER, TEST_SELLER } from '../../../../../../tests/helpers/auth'

const POSTS = '/api/posts'
const SELLER_SLUG = TEST_SELLER.storeSlug

// ─── Auth guards ───────────────────────────────────────────────────────────────

test.describe('posts — auth guards', () => {
  test('GET /api/posts requires auth', async ({ request }) => {
    const res = await request.get(POSTS)
    expect(res.status()).toBe(401)
  })

  test('POST /api/posts requires auth', async ({ request }) => {
    const res = await request.post(POSTS, { data: { caption: 'hi' } })
    expect(res.status()).toBe(401)
  })

  test('PATCH /api/posts/:id requires auth', async ({ request }) => {
    const res = await request.patch(`${POSTS}/nonexistent-id`, { data: { caption: 'x' } })
    expect(res.status()).toBe(401)
  })

  test('DELETE /api/posts/:id requires auth', async ({ request }) => {
    const res = await request.delete(`${POSTS}/nonexistent-id`)
    expect(res.status()).toBe(401)
  })

  test('POST /api/posts/:id/like requires auth', async ({ request }) => {
    const res = await request.post(`${POSTS}/nonexistent-id/like`)
    expect(res.status()).toBe(401)
  })

  test('DELETE /api/posts/:id/like requires auth', async ({ request }) => {
    const res = await request.delete(`${POSTS}/nonexistent-id/like`)
    expect(res.status()).toBe(401)
  })

  test('POST /api/posts/:id/comments requires auth', async ({ request }) => {
    const res = await request.post(`${POSTS}/nonexistent-id/comments`, { data: { text: 'hi' } })
    expect(res.status()).toBe(401)
  })

  test('POST /api/posts/save requires auth', async ({ request }) => {
    const res = await request.post(`${POSTS}/save`, { data: { postId: 'nonexistent' } })
    expect(res.status()).toBe(401)
  })

  test('GET /api/posts/save requires auth', async ({ request }) => {
    const res = await request.get(`${POSTS}/save`)
    expect(res.status()).toBe(401)
  })

  test('GET /api/posts/likes requires auth', async ({ request }) => {
    const res = await request.get(`${POSTS}/likes`)
    expect(res.status()).toBe(401)
  })

  test('GET /api/posts/my-shares requires auth', async ({ request }) => {
    const res = await request.get(`${POSTS}/my-shares`)
    expect(res.status()).toBe(401)
  })
})

// ─── Public endpoints ──────────────────────────────────────────────────────────

test.describe('posts — public endpoints', () => {
  test('GET /api/posts/:id is public', async ({ request }) => {
    // Non-existent post → 500 or 4xx (service may throw), but NOT 401
    const res = await request.get(`${POSTS}/nonexistent-id-xyz`)
    expect(res.status()).not.toBe(401)
  })

  test('POST /api/posts/:id/view is public', async ({ request }) => {
    // No post with this id, but 200 or 400, not 401
    const res = await request.post(`${POSTS}/nonexistent-id-xyz/view`)
    expect(res.status()).not.toBe(401)
    expect(res.status()).toBeLessThan(500)
  })

  test('GET /api/posts/by-store returns 200 with storeSlug', async ({ request }) => {
    const res = await request.get(`${POSTS}/by-store?storeSlug=${SELLER_SLUG}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })
})

// ─── Post CRUD flow ────────────────────────────────────────────────────────────

test.describe('posts — CRUD flow', () => {
  let token: string
  let postId: string

  test.beforeAll(async ({ request }) => {
    ;({ token } = await apiLogin(request))
  })

  test('creates a post with caption', async ({ request }) => {
    const res = await request.post(POSTS, {
      headers: { Authorization: `Bearer ${token}` },
      data: { caption: 'Phase 3 test post — please ignore' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data?.id).toBeTruthy()
    postId = body.data.id
  })

  test('GET /api/posts returns authenticated user posts', async ({ request }) => {
    const res = await request.get(POSTS, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    // Response shape: { success, data: { posts: [...], total, limit, offset } }
    expect(Array.isArray(body.data?.posts)).toBe(true)
  })

  test('GET /api/posts/:id returns post', async ({ request }) => {
    test.skip(!postId, 'post creation must pass first')
    const res = await request.get(`${POSTS}/${postId}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data?.id).toBe(postId)
  })

  test('PATCH /api/posts/:id updates caption', async ({ request }) => {
    test.skip(!postId, 'post creation must pass first')
    const res = await request.patch(`${POSTS}/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { caption: 'Updated test post caption' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('rejects post with no caption, content, or media', async ({ request }) => {
    const res = await request.post(POSTS, {
      headers: { Authorization: `Bearer ${token}` },
      data: { visibility: 'PUBLIC' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  // ── Comments ──────────────────────────────────────────────────────────────

  test('creates a comment on the post', async ({ request }) => {
    test.skip(!postId, 'post creation must pass first')
    const res = await request.post(`${POSTS}/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { text: 'Test comment from Phase 3 spec' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('GET /api/posts/:id/comments returns array', async ({ request }) => {
    test.skip(!postId, 'post creation must pass first')
    const res = await request.get(`${POSTS}/${postId}/comments`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  // ── Likes ─────────────────────────────────────────────────────────────────

  test('likes then unlikes a post', async ({ request }) => {
    test.skip(!postId, 'post creation must pass first')
    const like = await request.post(`${POSTS}/${postId}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(like.status()).toBeLessThan(500)

    const unlike = await request.delete(`${POSTS}/${postId}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(unlike.status()).toBeLessThan(500)
  })

  // ── Save / unsave ─────────────────────────────────────────────────────────

  test('saves then unsaves a post', async ({ request }) => {
    test.skip(!postId, 'post creation must pass first')
    const save = await request.post(`${POSTS}/save`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { postId },
    })
    expect(save.status()).toBeLessThan(500)

    const unsave = await request.delete(`${POSTS}/save/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(unsave.status()).toBeLessThan(500)
  })

  // ── Cleanup ───────────────────────────────────────────────────────────────

  test.afterAll(async ({ request }) => {
    if (!postId) return
    await request.delete(`${POSTS}/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  })
})
