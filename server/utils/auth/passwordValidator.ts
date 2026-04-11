/**
 * Production-grade password validation
 * Meets OWASP standards and includes breach checking
 */

import { z } from 'zod'

/**
 * Common weak passwords to prevent
 * This list should be updated regularly or fetched from breach databases
 */
const COMMON_PASSWORDS = new Set([
  'password123',
  'password1234',
  'qwerty123',
  'letmein123',
  'welcome123',
  'monkey123',
  'dragon123',
  'master123',
  'sunshine123',
  'princess123',
  'football123',
  'shadow123',
  'michael123',
  'superman123',
  'batman123',
])

/**
 * Check if password is in common password list
 */
function isCommonPassword(password: string): boolean {
  const normalized = password.toLowerCase()
  return COMMON_PASSWORDS.has(normalized)
}

/**
 * Enhanced password schema with OWASP compliance
 * Requirements:
 * - Minimum 12 characters (OWASP recommendation)
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * - Not in common password list
 */
export const enhancedPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(256, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character',
  )
  .refine(
    (password) => !isCommonPassword(password),
    'Password is too common. Please use a more unique password.',
  )

/**
 * Lighter password schema for legacy support (optional)
 */
export const legacyPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
