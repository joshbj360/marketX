export type {
  IAuthUser as AuthUser,
  IAuthResponse as AuthResponse,
} from '~~/shared/types/auth'

// Session
export interface SessionData {
  userId: string
  refreshToken: string
  ip: string
  userAgent: string
  device: string
  expiresAt: Date
}

// Email verification token
export interface EmailVerificationToken {
  token: string
  userId: string
  expiresAt: Date
  usedAt?: Date
}

// Password reset token
export interface PasswordResetToken {
  token: string
  userId: string
  expiresAt: Date
  usedAt?: Date
}

// Failed login attempt
export interface FailedLoginAttempt {
  email: string
  attemptCount: number
  lastAttemptAt: Date
  lockedUntil?: Date
}

// Audit log
export interface AuditLog {
  userId: string
  eventType: string
  description: string
  ipAddress: string
  userAgent: string
  createdAt: Date
}

// Auth errors
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 401,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}
