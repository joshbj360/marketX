// FILE PATH: server/config/env.ts

/**
 * Environment Variable Validation
 * Validates all required env vars on startup
 * Fails fast if anything is missing
 */

interface RequiredEnvVar {
  name: string
  required: boolean
  default?: string
  description: string
}

const requiredVars: RequiredEnvVar[] = [
  // ─── Database ────────────────────────────────────────────────────────────────
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string (Neon)',
  },

  // ─── JWT ─────────────────────────────────────────────────────────────────────
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'Secret key for signing JWT access tokens (min 32 chars)',
  },
  {
    name: 'JWT_REFRESH_SECRET',
    required: true,
    description: 'Secret key for signing JWT refresh tokens (min 32 chars)',
  },

  // ─── Environment ─────────────────────────────────────────────────────────────
  {
    name: 'NODE_ENV',
    required: false,
    default: 'development',
    description: 'Node environment (development, staging, production)',
  },
  {
    name: 'NUXT_PUBLIC_BASE_URL',
    required: false,
    default: 'http://localhost:3000',
    description: 'Application base URL for email links and redirects',
  },

  // ─── Cloudinary ──────────────────────────────────────────────────────────────
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    required: true,
    description: 'Cloudinary cloud name for media uploads',
  },
  {
    name: 'CLOUDINARY_API_KEY',
    required: true,
    description: 'Cloudinary API key',
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    required: true,
    description: 'Cloudinary API secret',
  },
  {
    name: 'CLOUDINARY_UPLOAD_PRESET',
    required: true,
    description: 'Cloudinary unsigned upload preset',
  },

  // ─── Email ───────────────────────────────────────────────────────────────────
  {
    name: 'RESEND_API_KEY',
    required: true,
    description: 'Resend API key for transactional emails',
  },
  {
    name: 'SENDER_EMAIL',
    required: true,
    description: 'From address for outgoing emails',
  },

  // ─── Payments ────────────────────────────────────────────────────────────────
  {
    name: 'PAYSTACK_SECRET_KEY',
    required: true,
    description: 'Paystack secret key for payment processing',
  },
  {
    name: 'PAYSTACK_PUBLIC_KEY',
    required: true,
    description: 'Paystack public key (client-side)',
  },

  // ─── Cache (Upstash Redis — REST) ────────────────────────────────────────────
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description:
      'Upstash Redis REST URL for caching (optional — disables cache if unset)',
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    description: 'Upstash Redis REST token',
  },

  // ─── Job Queues (BullMQ — standard Redis TCP) ────────────────────────────────
  {
    name: 'QUEUE_REDIS_URL',
    required: false,
    description:
      'Standard Redis URL for BullMQ queues (Railway/Redis Cloud — NOT Upstash). Jobs run inline if unset.',
  },

  // ─── Real-time (Soketi) ───────────────────────────────────────────────────────
  {
    name: 'SOKETI_APP_ID',
    required: false,
    default: '1',
    description: 'Soketi app ID',
  },
  {
    name: 'SOKETI_KEY',
    required: false,
    default: 'app-key',
    description: 'Soketi app key (public)',
  },
  {
    name: 'SOKETI_SECRET',
    required: false,
    default: 'app-secret',
    description: 'Soketi app secret (server-side only)',
  },
  {
    name: 'SOKETI_HOST',
    required: false,
    default: '127.0.0.1',
    description: 'Soketi server host (use Railway domain in production)',
  },
  {
    name: 'SOKETI_PORT',
    required: false,
    default: '6001',
    description: 'Soketi server port (443 in production with TLS)',
  },
  {
    name: 'SOKETI_USE_TLS',
    required: false,
    default: 'false',
    description: 'Enable TLS for Soketi (true in production)',
  },

  // ─── Shipping ────────────────────────────────────────────────────────────────
  {
    name: 'SHIPPO_API_KEY',
    required: false,
    description: 'Shippo API key for international shipping rates',
  },
  {
    name: 'SENDBOX_ACCESS_TOKEN',
    required: false,
    description:
      'SendBox Bearer access token (JWT) for Nigeria domestic shipping',
  },
  {
    name: 'SENDBOX_CLIENT_SECRET',
    required: false,
    description: 'SendBox client secret (used to refresh the access token)',
  },

  // ─── AI ──────────────────────────────────────────────────────────────────────
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic Claude API key',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key',
  },

  // â”€â”€â”€ OAuth (optional) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    name: 'OAUTH_GOOGLE_CLIENT_ID',
    required: false,
    description: 'Google OAuth client ID',
  },
  {
    name: 'OAUTH_GOOGLE_CLIENT_SECRET',
    required: false,
    description: 'Google OAuth client secret',
  },
  {
    name: 'OAUTH_APPLE_CLIENT_ID',
    required: false,
    description: 'Apple OAuth client ID (Service ID)',
  },
  {
    name: 'OAUTH_APPLE_CLIENT_SECRET',
    required: false,
    description: 'Apple OAuth client secret (JWT)',
  },
  {
    name: 'OAUTH_FACEBOOK_CLIENT_ID',
    required: false,
    description: 'Facebook OAuth app ID',
  },
  {
    name: 'OAUTH_FACEBOOK_CLIENT_SECRET',
    required: false,
    description: 'Facebook OAuth app secret',
  },

  // ─── Platform ────────────────────────────────────────────────────────────────
  {
    name: 'PLATFORM_COMMISSION_RATE',
    required: false,
    default: '0.10',
    description: 'Platform commission rate (0.10 = 10%)',
  },

  // ─── Rate Limiting ───────────────────────────────────────────────────────────
  {
    name: 'RATE_LIMIT_REGISTER_MAX',
    required: false,
    default: '3',
    description: 'Max registration attempts',
  },
  {
    name: 'RATE_LIMIT_REGISTER_WINDOW',
    required: false,
    default: '3600000',
    description: 'Registration rate limit window (ms)',
  },
  {
    name: 'RATE_LIMIT_LOGIN_MAX',
    required: false,
    default: '5',
    description: 'Max login attempts',
  },
  {
    name: 'RATE_LIMIT_LOGIN_WINDOW',
    required: false,
    default: '900000',
    description: 'Login rate limit window (ms)',
  },
  {
    name: 'RATE_LIMIT_FORGOT_PASSWORD_MAX',
    required: false,
    default: '3',
    description: 'Max forgot password attempts',
  },
  {
    name: 'RATE_LIMIT_FORGOT_PASSWORD_WINDOW',
    required: false,
    default: '3600000',
    description: 'Forgot password rate limit window (ms)',
  },
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_SEND_MAX',
    required: false,
    default: '5',
    description: 'Max verify email send attempts',
  },
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_SEND_WINDOW',
    required: false,
    default: '900000',
    description: 'Verify email send rate limit window (ms)',
  },
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_TOKEN_MAX',
    required: false,
    default: '5',
    description: 'Max verify email token attempts',
  },
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_TOKEN_WINDOW',
    required: false,
    default: '900000',
    description: 'Verify email token rate limit window (ms)',
  },
  {
    name: 'RATE_LIMIT_REFRESH_TOKEN_MAX',
    required: false,
    default: '10',
    description: 'Max refresh token attempts',
  },
  {
    name: 'RATE_LIMIT_REFRESH_TOKEN_WINDOW',
    required: false,
    default: '300000',
    description: 'Refresh token rate limit window (ms)',
  },
]

/**
 * Validate environment variables
 * Call this in your app startup
 */
export function validateEnvironment(): void {
  const missing: string[] = []
  const warnings: string[] = []

  console.log('🔍 Validating environment variables...')

  for (const envVar of requiredVars) {
    const value = process.env[envVar.name]

    if (!value && envVar.required) {
      missing.push(`  ❌ ${envVar.name}: ${envVar.description}`)
    } else if (!value && envVar.default) {
      console.log(`  ⚠️  ${envVar.name}: Using default value`)
      process.env[envVar.name] = envVar.default
    } else if (value) {
      console.log(`  ✅ ${envVar.name}`)
    }
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:')
    missing.forEach((m) => console.error(m))
    console.error('\n📝 See .env.example for the required format.')
    process.exit(1)
  }

  // Validate JWT secrets are strong enough
  const jwtSecret = process.env.JWT_SECRET
  const refreshSecret = process.env.JWT_REFRESH_SECRET

  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push(
      'JWT_SECRET is less than 32 characters. Consider using a stronger secret.',
    )
  }
  if (refreshSecret && refreshSecret.length < 32) {
    warnings.push(
      'JWT_REFRESH_SECRET is less than 32 characters. Consider using a stronger secret.',
    )
  }

  if (process.env.NODE_ENV === 'production') {
    if (
      jwtSecret ===
      'your-super-secret-jwt-key-min-32-chars-change-in-production'
    ) {
      console.error(
        '❌ SECURITY ERROR: Using default JWT_SECRET in production!',
      )
      process.exit(1)
    }
    if (
      refreshSecret ===
      'your-super-secret-refresh-key-min-32-chars-change-in-production'
    ) {
      console.error(
        '❌ SECURITY ERROR: Using default JWT_REFRESH_SECRET in production!',
      )
      process.exit(1)
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    warnings.forEach((w) => console.warn(`  ${w}`))
  }

  console.log('\n✅ Environment validation passed!\n')
}

/**
 * Get required environment variable or throw
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Get optional environment variable with default
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}
