/**
 * Shared auth types — used by both client (layers/core/app) and server (layers/core/server).
 *
 * IAuthUser  = who the user IS (from token/session) — minimal, always available after login
 * IAuthResponse = the login/refresh API response shape
 *
 * These are NOT the same as IProfile (full profile record loaded on demand for profile pages).
 */

export interface IAuthUser {
  id: string
  email: string
  username: string
  emailVerified: boolean
  role: string
  avatar?: string | null
  bio?: string | null
  createdAt?: string
}

export interface IAuthResponse {
  accessToken: string
  refreshToken: string
  user: IAuthUser
}
