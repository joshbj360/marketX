// FILE PATH: server/utils/auth/auth.ts

import { hash, verify } from 'argon2'
import jwt from 'jsonwebtoken'

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'

// ==================== PASSWORD HASHING ====================

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    type: 2, // argon2id
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await verify(hash, password)
  } catch {
    return false
  }
}

// ==================== JWT TOKENS ====================

export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function generateTokens(
  userId: string,
  email?: string,
  role: string = 'user',
) {
  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }, // 24 hours
  )

  const refreshToken = jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }, // 7 days
  )

  return { accessToken, refreshToken }
}

export function jwtVerify(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function jwtVerifyRefresh(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string }
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired refresh token')
  }
}

export function jwtDecode(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload
  } catch {
    return null
  }
}
