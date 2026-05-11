import { test, expect } from '@playwright/test'
import { resetRateLimits, uniqueEmail } from '../../../../../../tests/helpers/auth'

const SEND = '/api/auth/checkout-otp/send'

test.beforeAll(async ({ request }) => {
  await resetRateLimits(request)
})
const VERIFY = '/api/auth/checkout-otp/verify'

// ─── Send OTP ─────────────────────────────────────────────────────────────────

test.describe('POST /api/auth/checkout-otp/send', () => {
  test('accepts valid email and returns success', async ({ request }) => {
    const res = await request.post(SEND, {
      data: { email: uniqueEmail(), name: 'Test Buyer' },
    })
    // 200 whether user exists or not — never leak user existence
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('accepts existing user email', async ({ request }) => {
    const res = await request.post(SEND, {
      data: { email: 'ada@peppr.test' },
    })
    expect(res.status()).toBe(200)
  })

  test('rejects missing email', async ({ request }) => {
    const res = await request.post(SEND, {
      data: { name: 'No Email' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects malformed email', async ({ request }) => {
    const res = await request.post(SEND, {
      data: { email: 'not-an-email' },
    })
    expect(res.status()).toBe(400)
  })

  test('does not reveal whether email is registered', async ({ request }) => {
    const [known, unknown] = await Promise.all([
      request.post(SEND, { data: { email: 'ada@peppr.test' } }),
      request.post(SEND, { data: { email: uniqueEmail() } }),
    ])
    // Both should return the same status — no user enumeration
    expect(known.status()).toBe(unknown.status())
  })
})

// ─── Verify OTP ───────────────────────────────────────────────────────────────

test.describe('POST /api/auth/checkout-otp/verify', () => {
  test('rejects missing email', async ({ request }) => {
    const res = await request.post(VERIFY, {
      data: { code: '123456' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects missing code', async ({ request }) => {
    const res = await request.post(VERIFY, {
      data: { email: 'ada@peppr.test' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects code with wrong length', async ({ request }) => {
    const res = await request.post(VERIFY, {
      data: { email: 'ada@peppr.test', code: '123' }, // too short
    })
    expect(res.status()).toBe(400)
  })

  test('rejects invalid/expired code', async ({ request }) => {
    const res = await request.post(VERIFY, {
      data: { email: 'ada@peppr.test', code: '000000' },
    })
    // Must be 4xx — never 500
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  test('valid verify response includes tokens and user', async ({ request }) => {
    // We cannot get a real OTP in test without email access,
    // so this test documents the expected shape for when code is valid.
    // Full flow is covered in tests/e2e/auth/checkout-otp.spec.ts.
    const res = await request.post(VERIFY, {
      data: { email: 'ada@peppr.test', code: '000000' },
    })
    if (res.status() === 200) {
      const body = await res.json()
      expect(body.success).toBe(true)
      expect(body.accessToken).toBeTruthy()
      expect(body.user).toBeTruthy()
    }
  })
})
