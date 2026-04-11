// layers/core/services/api/base.api.ts

/**
 * Base API Client with Auth Store Integration
 */

import { type H3Event, getHeader } from 'h3'
import { useRequestEvent, useRuntimeConfig, navigateTo } from 'nuxt/app'
import { notify } from '@kyvg/vue3-notification'
import { ApiError } from './api.error'
import { useAuthStore } from '../stores/auth.store'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'

export interface ApiServiceOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown> | BodyInit | null
  params?: Record<string, unknown>
  headers?: Record<string, string>
  skipAuth?: boolean
  skipCsrf?: boolean
  /** Suppress auto-notification for this call (use for background/fire-and-forget requests) */
  silent?: boolean
}

export class BaseApiClient {
  protected baseURL: string
  private static isRefreshing = false
  private static refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    this.baseURL = this.initializeBaseURL()
  }

  private static onRefreshed(token: string) {
    BaseApiClient.refreshSubscribers.forEach((cb) => cb(token))
    BaseApiClient.refreshSubscribers = []
  }

  private initializeBaseURL(): string {
    if (import.meta.server) {
      try {
        const config = useRuntimeConfig()
        return (config.public.baseURL as string) || ''
      } catch {
        console.warn('Could not get baseURL from runtime config')
        return ''
      }
    } else {
      return typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : ''
    }
  }

  protected async request<T>(
    endpoint: string,
    options: ApiServiceOptions = {},
  ): Promise<T> {
    const headers: Record<string, string> = { ...options.headers }

    // Set Content-Type for JSON requests
    if (
      options.body &&
      typeof options.body === 'object' &&
      !(options.body instanceof FormData)
    ) {
      if (
        ['POST', 'PATCH', 'PUT'].includes(
          options.method?.toUpperCase() || 'POST',
        )
      ) {
        headers['Content-Type'] = 'application/json'
      }
    }

    // Add auth token (client-side)
    if (!options.skipAuth && import.meta.client) {
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Add CSRF token (client-side)
    if (!options.skipCsrf && import.meta.client) {
      const csrfToken = this.getCsrfToken()
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
    }

    // Forward cookies (server-side SSR)
    if (import.meta.server) {
      const event: H3Event | undefined = useRequestEvent()
      if (event) {
        const cookie = getHeader(event, 'cookie')
        if (cookie) {
          headers['cookie'] = cookie
        }
      }
    }

    try {
      const url = `${this.baseURL}${endpoint}`

      return (await $fetch<T>(url, {
        ...options,
        headers,
      })) as T
    } catch (e: unknown) {
      const error = e as {
        status?: number
        statusCode?: number
        data?: unknown
        response?: { data?: unknown }
      }
      // Auto-refresh on 401 (client only, non-skipAuth)
      const statusCode = error.status || error.statusCode
      if (statusCode === 401 && !options.skipAuth && import.meta.client) {
        const refreshed = await this.tryRefreshToken()
        if (refreshed) {
          // Retry original request with new token
          const newToken = this.getAuthToken()
          if (newToken) headers['Authorization'] = `Bearer ${newToken}`
          try {
            return (await $fetch<T>(`${this.baseURL}${endpoint}`, {
              ...options,
              headers,
            })) as T
          } catch (retryError: unknown) {
            this.handleError(
              retryError,
              endpoint,
              options.skipAuth,
              options.silent,
            )
          }
        }
      }
      this.handleError(error, endpoint, options.skipAuth, options.silent)
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (!import.meta.client) return false

    // If already refreshing, queue up and wait
    if (BaseApiClient.isRefreshing) {
      return new Promise((resolve) => {
        BaseApiClient.refreshSubscribers.push((token) => resolve(!!token))
      })
    }

    BaseApiClient.isRefreshing = true
    try {
      // Server reads refreshToken from HTTP-only cookie — no body needed
      const result = await $fetch<{ accessToken: string }>(
        `${this.baseURL}/api/auth/refresh-token`,
        { method: 'POST' },
      )
      const newToken = (result as { accessToken: string })?.accessToken
      if (!newToken) throw new Error('No token in response')
      useAuthStore().setAccessToken(newToken)
      BaseApiClient.onRefreshed(newToken)
      return true
    } catch {
      return false
    } finally {
      BaseApiClient.isRefreshing = false
    }
  }

  /**
   * Get auth token from auth store OR localStorage
   */
  private getAuthToken(): string | null {
    if (import.meta.server) {
      return null
    }

    try {
      // Try to get from auth store first (if available)
      try {
        const authStore = useAuthStore()
        if (authStore?.accessToken) {
          return authStore.accessToken
        }
      } catch (e) {
        // Store might not be available yet, fall back to localStorage
      }

      // Fallback to localStorage
      const token = localStorage.getItem('accessToken')
      return token
    } catch (error) {
      console.debug('Failed to get auth token:', error)
      return null
    }
  }

  private getCsrfToken(): string | null {
    if (import.meta.server) {
      return null
    }

    const metaTag = document.querySelector('meta[name="csrf-token"]')
    if (metaTag) {
      return metaTag.getAttribute('content')
    }

    const name = '__csrf_token='
    const decodedCookie = decodeURIComponent(document.cookie)
    const cookies = decodedCookie.split(';')

    for (const cookie of cookies) {
      const trimmed = cookie.trim()
      if (trimmed.startsWith(name)) {
        return trimmed.substring(name.length)
      }
    }

    try {
      const token = sessionStorage.getItem('__csrf_token')
      if (token) return token
    } catch (e) {
      // sessionStorage might not be available
    }

    return null
  }

  private handleError(
    error: unknown,
    endpoint: string,
    skipAuth?: boolean,
    silent?: boolean,
  ): never {
    const isClient = import.meta.client
    const errorObj = error as {
      status?: number
      statusCode?: number
      message?: string
      data?: unknown
      response?: { data?: unknown }
    }

    // Network error (no response)
    if (!errorObj.status && !errorObj.statusCode && errorObj.message) {
      const msg = 'Network error. Please check your connection.'
      if (isClient && !silent) notify({ type: 'error', text: msg })
      throw new ApiError(msg, 0, { originalError: errorObj })
    }

    // HTTP error
    const statusCode = errorObj.status || errorObj.statusCode || 500
    const data = errorObj.data || errorObj.response?.data || {}
    const serverMessage =
      data.message ||
      data.statusMessage ||
      errorObj.message ||
      'An unexpected error occurred.'
    const safeMessage = this.getSafeErrorMessage(statusCode, serverMessage)

    if (isClient) {
      if (statusCode === 401 && !skipAuth) {
        // Only 401 (expired/invalid token) should trigger logout
        useAuthStore().clearAuth()
        useProfileStore().clearStore()
        notify({
          type: 'error',
          title: 'Session expired',
          text: 'Please log in to continue.',
          duration: 6000,
        })
        navigateTo('/user-login')
      } else if (!silent) {
        // Other errors only show if not a background/silent call
        notify({ type: 'error', text: safeMessage })
      }
    }

    throw new ApiError(safeMessage, statusCode, data)
  }

  private getSafeErrorMessage(
    statusCode: number,
    originalMessage: string,
  ): string {
    // Generic/internal messages that should be replaced with friendlier text
    const OPAQUE = new Set([
      'internal server error',
      'server error',
      'bad request',
      'unknown error',
      'an unexpected error occurred.',
      'an error occurred',
      'error',
      '',
    ])

    // If the server sent a specific, useful message — show it as-is
    if (originalMessage && !OPAQUE.has(originalMessage.toLowerCase())) {
      return originalMessage
    }

    // Fall back to friendly generic messages only when the server message is useless
    const fallbacks: Record<number, string> = {
      0: 'Network error. Please check your connection.',
      400: 'Something went wrong. Please check your input.',
      401: 'Please log in to continue.',
      403: "You don't have permission to do that.",
      404: 'Not found.',
      409: 'This already exists.',
      422: 'Please check your input.',
      429: 'Too many requests. Please try again in a moment.',
      500: 'Something went wrong on our end. Please try again.',
      503: 'Service temporarily unavailable. Please try again later.',
    }

    return fallbacks[statusCode] || originalMessage || 'Something went wrong.'
  }

  protected cleanParams(
    params: Record<string, unknown>,
  ): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value
      }
    }
    return cleaned
  }
}
