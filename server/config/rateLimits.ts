/**
 * Rate Limiting Configuration
 * All values come from environment variables
 * Can be changed without redeploying code
 */

export const RATE_LIMITS = {
  // Register endpoint: Prevent spam account creation
  REGISTER: {
    maxAttempts: parseInt(process.env.RATE_LIMIT_REGISTER_MAX || '3', 10),
    windowMs: parseInt(
      process.env.RATE_LIMIT_REGISTER_WINDOW || String(60 * 60 * 1000),
      10,
    ), // 1 hour
    message: 'Too many registration attempts',
    lockoutMs: 60 * 60 * 1000, // 1 hour lockout
    keyPrefix: 'auth:register',
  },

  // Login endpoint: Prevent brute force attacks
  LOGIN: {
    maxAttempts: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10),
    windowMs: parseInt(
      process.env.RATE_LIMIT_LOGIN_WINDOW || String(15 * 60 * 1000),
      10,
    ), // 15 minutes
    message: 'Too many login attempts',
    lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
    keyPrefix: 'auth:login',
  },

  // Forgot password endpoint: Prevent email spam
  FORGOT_PASSWORD: {
    maxAttempts: parseInt(
      process.env.RATE_LIMIT_FORGOT_PASSWORD_MAX || '3',
      10,
    ),
    windowMs: parseInt(
      process.env.RATE_LIMIT_FORGOT_PASSWORD_WINDOW || String(60 * 60 * 1000),
      10,
    ), // 1 hour
    message: 'Too many password reset requests',
    lockoutMs: 60 * 60 * 1000, // 1 hour lockout
    keyPrefix: 'auth:forgot-password',
  },

  // Email verification - Send request: Prevent email spam
  VERIFY_EMAIL_SEND: {
    maxAttempts: parseInt(
      process.env.RATE_LIMIT_VERIFY_EMAIL_SEND_MAX || '5',
      10,
    ),
    windowMs: parseInt(
      process.env.RATE_LIMIT_VERIFY_EMAIL_SEND_WINDOW || String(15 * 60 * 1000),
      10,
    ), // 15 minutes
    message: 'Too many verification email requests',
    lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
    keyPrefix: 'auth:verify-email-send',
  },

  // Email verification - Token verification: Prevent token brute force
  VERIFY_EMAIL_TOKEN: {
    maxAttempts: parseInt(
      process.env.RATE_LIMIT_VERIFY_EMAIL_TOKEN_MAX || '5',
      10,
    ),
    windowMs: parseInt(
      process.env.RATE_LIMIT_VERIFY_EMAIL_TOKEN_WINDOW ||
        String(15 * 60 * 1000),
      10,
    ), // 15 minutes
    message: 'Too many verification attempts',
    lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
    keyPrefix: 'auth:verify-email',
  },

  // Refresh token endpoint: Prevent token abuse
  REFRESH_TOKEN: {
    maxAttempts: parseInt(process.env.RATE_LIMIT_REFRESH_TOKEN_MAX || '10', 10),
    windowMs: parseInt(
      process.env.RATE_LIMIT_REFRESH_TOKEN_WINDOW || String(5 * 60 * 1000),
      10,
    ), // 5 minutes
    message: 'Too many token refresh attempts',
    lockoutMs: 15 * 60 * 1000, // 15 minutes lockout
    keyPrefix: 'auth:refresh',
  },
  PROFILE_FETCH: {
    maxAttempts: parseInt(process.env.RATE_LIMIT_REFRESH_TOKEN_MAX || '10', 10),
    windowMs: parseInt(
      process.env.RATE_LIMIT_REFRESH_TOKEN_WINDOW || String(5 * 60 * 1000),
      10,
    ), // 5 minutes
    message: 'Too many token refresh attempts',
  },
}

export default RATE_LIMITS
