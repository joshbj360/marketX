import { test, expect } from '@playwright/test'
import { uniqueEmail, uniqueUsername } from '../../../../../../tests/helpers/auth'

const ENDPOINT = '/api/auth/register'

// ─── Happy path ────────────────────────────────────────────────────────────────

test.describe('POST /api/auth/register — happy path', () => {
  test('creates a new user and returns success', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: {
        email: uniqueEmail(),
        username: uniqueUsername(),
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
      },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.message).toBeTruthy()
    expect(body.user).toBeTruthy()
  })

  test('response does not include password hash', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: {
        email: uniqueEmail(),
        username: uniqueUsername(),
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
      },
    })
    const body = await res.json()
    expect(body.user?.password_hash).toBeUndefined()
    expect(body.user?.password).toBeUndefined()
  })
})

// ─── Input validation ──────────────────────────────────────────────────────────

test.describe('POST /api/auth/register — input validation', () => {
  test('rejects missing email', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: { username: uniqueUsername(), password: 'ValidPass123!' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects missing username', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: { email: uniqueEmail(), password: 'ValidPass123!' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects missing password', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: { email: uniqueEmail(), username: uniqueUsername() },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects malformed email', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: {
        email: 'not-valid',
        username: uniqueUsername(),
        password: 'ValidPass123!',
      },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects weak password', async ({ request }) => {
    const res = await request.post(ENDPOINT, {
      data: {
        email: uniqueEmail(),
        username: uniqueUsername(),
        password: '123',
      },
    })
    expect(res.status()).toBe(400)
  })
})

// ─── Conflict handling ─────────────────────────────────────────────────────────

test.describe('POST /api/auth/register — conflicts', () => {
  test('rejects duplicate email', async ({ request }) => {
    const email = uniqueEmail()
    const username = uniqueUsername()

    // First registration
    await request.post(ENDPOINT, {
      data: { email, username, password: 'ValidPass123!', confirmPassword: 'ValidPass123!' },
    })

    // Duplicate
    const res = await request.post(ENDPOINT, {
      data: {
        email,
        username: uniqueUsername(), // different username
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
      },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('rejects duplicate username', async ({ request }) => {
    const username = uniqueUsername()

    // First registration
    await request.post(ENDPOINT, {
      data: { email: uniqueEmail(), username, password: 'ValidPass123!', confirmPassword: 'ValidPass123!' },
    })

    // Duplicate username
    const res = await request.post(ENDPOINT, {
      data: {
        email: uniqueEmail(), // different email
        username,
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
      },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })
})
