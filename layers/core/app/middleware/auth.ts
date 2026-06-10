// layers/core/middleware/auth.ts

import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'

/**
 * Auth Middleware
 * Protects routes that require authentication
 *
 * Usage:
 * definePageMeta({
 *   middleware: 'auth'
 * })
 */

export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check on server — profile store is always empty during SSR
  if (import.meta.server) return

  const profileStore = useProfileStore()

  // If not logged in, redirect to login and preserve the return URL
  if (!profileStore.isLoggedIn) {
    const redirect = to.fullPath !== '/user-login' ? to.fullPath : undefined
    return navigateTo(redirect ? `/user-login?redirect=${encodeURIComponent(redirect)}` : '/user-login')
  }

  // If email not verified and verification is required, redirect to verify
  if (
    process.env.REQUIRE_EMAIL_VERIFICATION === 'true' &&
    !profileStore.me?.email_verified
  ) {
    return navigateTo(`/resend-verification?email=${profileStore.me?.email}`)
  }
})
