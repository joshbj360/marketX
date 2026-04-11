// FILE PATH: layers/auth/app/stores/auth.store.ts

/**
 * Auth Store
 * Manages authentication state using Pinia
 * Only handles state - NO API calls (composable does that)
 */

export const useAuthStore = defineStore('auth', () => {
  // ==================== STATE ====================

  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  // ==================== GETTERS ====================

  // ==================== ACTIONS: SET STATE ====================

  const setAccessToken = (token: string) => {
    accessToken.value = token
    // Persist to localStorage (browser only)
    if (import.meta.client) {
      localStorage.setItem('accessToken', token)
    }
  }

  const setRefreshToken = (token: string) => {
    refreshToken.value = token
    // Persist to localStorage (browser only)
    if (import.meta.client) {
      localStorage.setItem('refreshToken', token)
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
    // Auto-clear errors after 5 seconds
    if (err) {
      setTimeout(() => {
        error.value = null
      }, 5000)
    }
  }

  const setMessage = (msg: string | null) => {
    message.value = msg
    // Auto-clear messages after 5 seconds
    if (msg) {
      setTimeout(() => {
        message.value = null
      }, 5000)
    }
  }

  // ==================== ACTIONS: CLEAR ====================

  const clearAuth = () => {
    accessToken.value = null
    refreshToken.value = null
    error.value = null
    message.value = null

    // Clear from localStorage
    if (import.meta.client) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  const clearTokens = () => {
    accessToken.value = null
    refreshToken.value = null

    if (import.meta.client) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  // ==================== ACTIONS: INITIALIZE ====================

  /**
   * Initialize auth state from localStorage on app startup
   * Called from auth-lifecycle plugin
   */
  const initializeAuth = async () => {
    if (!import.meta.client) return

    try {
      const storedAccessToken = localStorage.getItem('accessToken')
      const storedRefreshToken = localStorage.getItem('refreshToken')

      if (storedAccessToken) {
        accessToken.value = storedAccessToken
      }

      if (storedRefreshToken) {
        refreshToken.value = storedRefreshToken
      }

      // If we have tokens, try to fetch current user
      // This will be done by auth middleware or composable
    } catch (err) {
      console.error('Failed to initialize auth:', err)
      clearAuth()
    }
  }

  /**
   * Restore user from API (after token refresh, for example)
   */
  const restoreUser = async () => {
    if (!accessToken.value) {
      //clearUser()
      return
    }

    try {
      // This would be called by the composable
      // to fetch current user after token refresh
    } catch (err) {
      console.error('Failed to restore user:', err)
      clearAuth()
    }
  }

  // ==================== RETURN ====================

  return {
    // State

    accessToken,
    refreshToken,
    isLoading,
    error,
    message,

    // Actions: Set
    setAccessToken,
    setRefreshToken,
    setLoading,
    setError,
    setMessage,

    // Actions: Clear
    clearAuth,
    clearTokens,

    // Actions: Initialize
    initializeAuth,
    restoreUser,
  }
})
