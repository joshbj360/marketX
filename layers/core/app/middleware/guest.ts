// layers/core/middleware/guest.ts

import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'

/**
 * Guest Middleware
 * Redirects logged-in users away from auth pages
 *
 * Usage:
 * definePageMeta({
 *   middleware: 'guest'
 * })
 */

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const profileStore = useProfileStore()

  // If already logged in, redirect away from auth pages
  if (profileStore.isLoggedIn) {
    return navigateTo('/')
  }
})
