// server/utils/security/errors.ts
/**
 * Secure error handling for auth layer
 * Masks sensitive information while logging details
 */

import { createError } from 'h3'
import { logAuditEvent, AuditEventType } from '../auth/auditLog'

/**
 * Safe error messages for common auth failures
 * Generic messages prevent email enumeration and info leakage
 */
const SAFE_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_NOT_FOUND: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account temporarily locked. Please try again later.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  EMAIL_EXISTS: 'Email address already registered',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  INVALID_TOKEN: 'Invalid or expired token',
  RATE_LIMITED: 'Too many attempts. Please try again later.',
  GENERIC: 'An error occurred. Please try again later.',
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_TOKEN = 'INVALID_TOKEN',
  RATE_LIMITED = 'RATE_LIMITED',
  GENERIC = 'GENERIC',
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    public statusCode: number,
    message: string,
    public internalDetails?: Record<string, any>,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Safe throw for auth errors
 * Logs internal details but returns generic message to client
 */
export async function throwAuthError(
  code: AuthErrorCode,
  options: {
    statusCode?: number
    email?: string
    userId?: string
    ipAddress?: string
    userAgent?: string
    internalDetails?: Record<string, any>
  } = {},
) {
  const safeMessage = SAFE_ERROR_MESSAGES[code] || SAFE_ERROR_MESSAGES.GENERIC
  const statusCode = options.statusCode || 400

  // Log actual error internally
  const internalMessage = `Auth error: ${code}`
  console.error(internalMessage, {
    email: options.email,
    userId: options.userId,
    code,
    ...options.internalDetails,
  })

  // Audit log the failed attempt
  await logAuditEvent({
    eventType: mapCodeToAuditEvent(code),
    email: options.email,
    userId: options.userId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    success: false,
    reason: code,
  })

  // Return safe error to client
  throw createError({
    statusCode,
    message: safeMessage,
    data: {
      code,
      // Don't include any internal details
    },
  })
}

/**
 * Map error code to audit event type
 */
function mapCodeToAuditEvent(code: AuthErrorCode): AuditEventType {
  const mapping: Record<AuthErrorCode, AuditEventType> = {
    [AuthErrorCode.INVALID_CREDENTIALS]: AuditEventType.LOGIN_FAILED,
    [AuthErrorCode.ACCOUNT_NOT_FOUND]: AuditEventType.LOGIN_FAILED,
    [AuthErrorCode.ACCOUNT_LOCKED]: AuditEventType.ACCOUNT_LOCKED,
    [AuthErrorCode.EMAIL_NOT_VERIFIED]: AuditEventType.LOGIN_FAILED,
    [AuthErrorCode.EMAIL_EXISTS]: AuditEventType.REGISTER_FAILED,
    [AuthErrorCode.WEAK_PASSWORD]: AuditEventType.REGISTER_FAILED,
    [AuthErrorCode.INVALID_TOKEN]: AuditEventType.PASSWORD_RESET_FAILED,
    [AuthErrorCode.RATE_LIMITED]: AuditEventType.LOGIN_FAILED_RATE_LIMITED,
    [AuthErrorCode.GENERIC]: AuditEventType.LOGIN_FAILED,
  }
  return mapping[code]
}

/**
 * Mask PII in logs
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const masked =
    local.substring(0, 2) +
    '*'.repeat(Math.max(1, local.length - 4)) +
    local.substring(local.length - 2)
  return `${masked}@${domain}`
}

export function maskIp(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.* `
  }
  return ip // IPv6 or other format
}

/**
 * Extract real IP from request
 * Handles proxies, load balancers
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.socket.remoteAddress || 'unknown'
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: any): string {
  return req.headers['user-agent'] || 'unknown'
}
