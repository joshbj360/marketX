// layers/auth/app/composables/useAuth.ts

/**
 * Authentication Composable
 * Manages login, register, logout, and user state
 * Works with AuthApiClient and auth.store
 */

import { computed } from 'vue'
import { notify } from '@kyvg/vue3-notification'
import { useAuthApi } from '../services/auth.api'
import { useAuthStore } from '../stores/auth.store'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useProfileApi } from '~~/layers/profile/app/services/profile.api'
import { useNotificationStore } from '~~/layers/profile/app/stores/notification.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useCartStore } from '~~/layers/commerce/app/stores/cart.store'
import { useSettings } from '~~/layers/profile/app/composables/useSettings'
import { useChat } from '~~/layers/profile/app/composables/useChat'
import type { IProfile } from '~~/layers/profile/app/types/profile.types'
import type { IAuthUser } from '~~/shared/types/auth'

// Extracts a user-facing message from a $fetch / unknown error
const extractErrorMessage = (e: unknown, fallback: string): string => {
  if (e && typeof e === 'object') {
    const err = e as Record<string, unknown>
    const data = err.data as Record<string, unknown> | undefined
    if (typeof data?.statusMessage === 'string') return data.statusMessage
    if (typeof err.statusMessage === 'string') return err.statusMessage
    if (typeof err.message === 'string') return err.message
  }
  return fallback
}

export const useAuth = () => {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()
  const authApi = useAuthApi()
  const profileApi = useProfileApi()
  const router = useRouter()

  // ==================== STATE ====================
  const accessToken = computed(() => authStore.accessToken)
  const refreshToken = computed(() => authStore.refreshToken)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)
  const message = computed(() => authStore.message)

  // ==================== REGISTER ====================

  const register = async (
    email: string,
    username: string,
    password: string,
    confirmPassword: string,
    redirectTo: string = '/user-login',
  ) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.register({
        email,
        username,
        password,
        confirmPassword,
      })

      authStore.setMessage(
        'Registration successful! Please check your email to verify your account.',
      )

      setTimeout(() => {
        router.push(redirectTo)
      }, 2000)

      return result
    } catch (e: unknown) {
      authStore.setError(extractErrorMessage(e, 'Registration failed'))
      throw e
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== LOGIN ====================

  /**
   * Logs in a user and returns the user object.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<IAuthResponse>} The response comprising the access token, refresh token, and user object.
   * @description It sets the loading state of the authStore to true and clears any previous error messages.
                  It tries to log in the user by calling the authApi.login method with the provided email and password.
                  If the login is successful, it stores the access and refresh tokens in the authStore.
                  It calls the syncUserToProfile function to synchronize the user data with the profile.
                  It sets a success message in the authStore and redirects the user to the dashboard after a 1-second delay.
                  It returns the result of the login request.
                  If an error occurs during the login process, it catches the error and sets an error message in the authStore.
                  It throws the error to be caught by the caller.
                  Finally, it sets the loading state of the authStore to false.
   * @throws {Error} 401 - Login failed (invalid credentials, locked account, etc.)
   * @throws {Error} 500 - Unexpected server error
   */
  const login = async (email: string, password: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.login({
        email,
        password,
      })

      authStore.setAccessToken(result.accessToken)
      authStore.setRefreshToken(result.refreshToken)

      await syncUserToProfile(result.user)

      authStore.setMessage('Logged in successfully!')

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/')
      }, 1000)

      return result
    } catch (e: unknown) {
      authStore.setError(extractErrorMessage(e, 'Login failed'))
      throw e
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== SOCIAL LOGIN ====================

  const socialLogin = async (
    provider: 'google' | 'facebook' | 'tiktok',
    redirectTo: string = '/',
  ) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      if (!import.meta.client) return
      const target = `/api/auth/oauth/${provider}?redirectTo=${encodeURIComponent(redirectTo)}`
      window.location.assign(target)
    } catch (e: unknown) {
      authStore.setError(extractErrorMessage(e, 'Social login failed'))
      authStore.setLoading(false)
      throw e
    }
  }

  // ==================== LOGOUT ====================

  const clearAllStores = () => {
    // Tear down real-time connections before clearing state
    if (import.meta.client) {
      const { disconnectStream } = useNotificationStore()
      const { disconnectSocket } = useChat()
      disconnectStream()
      disconnectSocket()
    }
    authStore.clearAuth()
    profileStore.clearStore()
    useNotificationStore().clearNotifications()
    useSellerStore().clearAllSellers()
    useCartStore().clearStore()
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore API errors on logout — always clear state
    } finally {
      clearAllStores()
      notify({ type: 'success', text: 'You have been logged out.' })
      await navigateTo('/user-login')
    }
  }

  /**
   * Sync authenticated user to profile store
   * Fetches full profile data from user API
   */
  const syncUserToProfile = async (authUser?: IAuthUser) => {
    try {
      const [profileData, settingsData] = await Promise.allSettled([
        profileApi.getPrivateProfile(),
        profileApi.getSettings(),
      ])

      if (profileData.status === 'fulfilled') {
        profileStore.setPrivateProfile(profileData.value.data)
        try {
          const stats = await profileApi.getProfileStats(
            profileData.value.data.username as string,
          )
          if (stats)
            profileStore.setProfileStats(
              profileData.value.data.username as string,
              stats.data,
            )
        } catch {
          /* stats are non-critical */
        }
        console.log(
          '✅ User synced via Profile Service:',
          profileData.value.data.username,
        )
      }

      if (settingsData.status === 'fulfilled') {
        const srv = settingsData.value?.data
        if (srv) {
          profileStore.setMySettings(srv)
          if (import.meta.client) {
            const { hydrateFromServer } = useSettings()
            hydrateFromServer(srv)
          }
        }
      }

      // Open real-time connections after auth is confirmed
      if (import.meta.client) {
        useNotificationStore().connectStream()
        useChat().connectSocket()
      }
    } catch (error) {
      console.error('Failed to sync user:', error)

      // Fallback: seed profile store with minimal token data so the UI isn't blank
      if (authUser) {
        profileStore.setPrivateProfile({
          id: authUser.id,
          username: authUser.username,
          email: authUser.email,
          role: authUser.role,
          avatar:
            authUser.avatar ||
            'https://i.pravatar.cc/150?u=a042581f4e29026704d',
          bio: authUser.bio || null,
          created_at: authUser.createdAt || new Date().toISOString(),
        } as unknown as IProfile)
      }
    }
  }

  // ==================== NEW: INITIALIZE USER ====================

  /**
   * Initialize user profile on app startup
   * Called from plugin or middleware
   */
  const initializeUser = async () => {
    // Only run if we have a token but no user
    if (!authStore.accessToken) return

    try {
      await syncUserToProfile()
      console.log('✅ User initialized via API Service')
    } catch (error) {
      console.error('Initialization failed:', error)
      authStore.clearAuth()
    }
  }

  // ==================== VERIFY EMAIL ====================

  const verifyEmail = async (token: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.verifyEmail(token)

      authStore.setMessage('Email verified successfully! You can now log in.')

      setTimeout(() => {
        router.push('/user-login')
      }, 2000)

      return result
    } catch (e: unknown) {
      authStore.setError(extractErrorMessage(e, 'Email verification failed'))
      throw e
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== RESEND VERIFICATION ====================

  const resendVerificationEmail = async (email: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.resendVerificationEmail(email)

      authStore.setMessage('Verification email sent! Check your inbox.')

      return result
    } catch (e: unknown) {
      authStore.setError(
        extractErrorMessage(e, 'Failed to send verification email'),
      )
      throw e
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== PASSWORD RESET ====================

  const requestPasswordReset = async (email: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.requestPasswordReset(email)

      authStore.setMessage(
        'If an account exists with this email, you will receive a password reset link.',
      )

      return result
    } catch (e: unknown) {
      authStore.setError(
        extractErrorMessage(e, 'Failed to request password reset'),
      )
      throw e
    } finally {
      authStore.setLoading(false)
    }
  }

  const resetPassword = async (
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      if (newPassword !== confirmPassword) {
        authStore.setError('Passwords do not match')
        return
      }

      const result = await authApi.resetPassword(token, newPassword)

      authStore.setMessage(
        'Password reset successfully! You can now log in with your new password.',
      )

      setTimeout(() => {
        router.push('/user-login')
      }, 2000)

      return result
    } catch (e: unknown) {
      authStore.setError(extractErrorMessage(e, 'Password reset failed'))
      throw e
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== REFRESH TOKEN ====================

  const refreshAccessToken = async () => {
    try {
      const result = await authApi.refreshAccessToken()
      authStore.setAccessToken(result.accessToken)
      return result
    } catch (e: unknown) {
      console.error('Token refresh failed:', e)
      authStore.clearAuth()
      throw e
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
    // Methods
    register,
    login,
    socialLogin,
    logout,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    refreshAccessToken,
    initializeUser,
    syncUserToProfile,
  }
}
