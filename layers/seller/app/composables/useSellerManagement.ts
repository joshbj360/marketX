// FILE PATH: layers/seller/app/composables/useSellerManagement.ts

import { useSellerApi } from '../services/seller.services'
import { useSellerStore } from '../store/seller.store'
import { useProfile } from '~~/layers/profile/app/composables/useProfile'
import { useAuthStore } from '~~/layers/core/app/stores/auth.store'

/**
 * Seller Management Composable
 * Provides seller functionality to components
 * Uses seller store and API service
 *
 * Pattern matches: useAuth composable
 */

export function useSellerManagement() {
  const sellerStore = useSellerStore()
  const sellerApi = useSellerApi()
  const router = useRouter()
  const { fetchMyProfile } = useProfile()

  // ==================== CREATE SELLER ====================

  const createSeller = async (data: {
    store_name: string
    store_slug: string
    store_description?: string
    store_location?: string
    store_phone?: string
    store_website?: string
    store_logo?: string
    store_banner?: string
    store_socials?: Record<string, any>
    default_currency?: string
  }) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.createSellerProfile(data)

      sellerStore.addSeller(result.data)
      sellerStore.setMessage('Seller profile created successfully!')

      // Refresh me so profileStore.me.role updates to 'seller' immediately
      await fetchMyProfile().catch(() => {})

      // Navigate to first product creation (onboarding flow)
      const slug = result.data?.store_slug
      if (slug) {
        await router.push(`/seller/${slug}/products/create?onboarding=1`)
      } else {
        await router.push('/sellers/dashboard')
      }

      return result
    } catch (error: any) {
      // Extract Zod field-level errors if present (ApiError.data = array of ZodIssue)
      const zodErrors: { path: string[]; message: string }[] | undefined =
        Array.isArray(error.data) ? error.data : undefined
      if (zodErrors?.length) {
        // Build a human-readable list of field errors
        const messages = zodErrors.map(
          (e) => `${e.path.join('.') || 'field'}: ${e.message}`,
        )
        const message = messages.join(' · ')
        sellerStore.setError(message)
        const fieldMap: Record<string, string> = {}
        for (const e of zodErrors) {
          if (e.path[0]) fieldMap[e.path[0]] = e.message
        }
        throw Object.assign(error, { fieldErrors: fieldMap })
      }
      const message = error.message || 'Failed to create seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== GET SELLERS ====================

  const loadUserSellers = async () => {
    if (!import.meta.client) return
    const authStore = useAuthStore()
    if (!authStore.accessToken) return

    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.getUserSellerProfiles()
      sellerStore.setSellers(result.data)
      return result
    } catch (error: any) {
      const message =
        error.response?.data?.statusMessage ||
        error.message ||
        'Failed to load sellers'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  const loadPublicSeller = async (slug: string) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.getSellerBySlug(slug)
      const seller = result?.data ?? result
      sellerStore.setCurrentSeller(seller)
      return result
    } catch (error: any) {
      const message =
        error.response?.data?.statusMessage ||
        error.message ||
        'Seller not found'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== UPDATE SELLER ====================

  const updateSeller = async (
    sellerId: string,
    data: {
      store_name?: string
      store_description?: string
      store_location?: string
      store_phone?: string
      store_website?: string
      store_logo?: string
      store_banner?: string
      store_socials?: Record<string, any>
      auto_answer_enabled?: boolean
    },
  ) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.updateSellerProfile(sellerId, data)

      sellerStore.updateSeller(sellerId, result.data)
      sellerStore.setCurrentSeller(result.data)
      sellerStore.setMessage('Seller profile updated successfully!')

      return result
    } catch (error: any) {
      const message =
        error.response?.data?.statusMessage ||
        error.message ||
        'Failed to update seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== ACTIVATE / DEACTIVATE ====================

  const activateSeller = async (sellerId: string) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.activateSellerProfile(sellerId)

      sellerStore.updateSeller(sellerId, { is_active: true })
      sellerStore.setMessage('Seller profile activated successfully!')

      return result
    } catch (error: any) {
      const message =
        error.response?.data?.statusMessage ||
        error.message ||
        'Failed to activate seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  const deactivateSeller = async (sellerId: string) => {
    sellerStore.setLoading(true)
    sellerStore.setError(null)

    try {
      const result = await sellerApi.deactivateSellerProfile(sellerId)

      sellerStore.updateSeller(sellerId, { is_active: false })
      sellerStore.setMessage('Seller profile deactivated successfully!')

      return result
    } catch (error: any) {
      const message =
        error.response?.data?.statusMessage ||
        error.message ||
        'Failed to deactivate seller'
      sellerStore.setError(message)
      throw error
    } finally {
      sellerStore.setLoading(false)
    }
  }

  // ==================== SLUG MANAGEMENT ====================

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    try {
      const result = await sellerApi.checkSlugAvailability(slug)
      return result.available
    } catch (error) {
      console.error('Error checking slug:', error)
      return false
    }
  }

  const suggestSlugs = async (baseName: string): Promise<string[]> => {
    try {
      const result = await sellerApi.suggestSlugs(baseName)
      return result.suggestions
    } catch (error) {
      console.error('Error suggesting slugs:', error)
      return []
    }
  }

  // ==================== FOLLOW / UNFOLLOW ====================

  const getFollowStatus = async (storeSlug: string): Promise<boolean> => {
    try {
      const res = await sellerApi.getFollowStatus(storeSlug)
      return res?.data?.isFollowing ?? false
    } catch {
      return false
    }
  }

  const followSeller = async (storeSlug: string) => {
    return sellerApi.followSeller(storeSlug)
  }

  const unfollowSeller = async (storeSlug: string) => {
    return sellerApi.unfollowSeller(storeSlug)
  }

  // ==================== GETTERS ====================

  return {
    // State
    sellers: computed(() => sellerStore.sellers),
    currentSeller: computed(() => sellerStore.currentSeller),
    isLoading: computed(() => sellerStore.isLoading),
    error: computed(() => sellerStore.error),
    message: computed(() => sellerStore.message),
    hasSellers: computed(() => sellerStore.hasSellers),
    sellerCount: computed(() => sellerStore.sellerCount),
    activeSellers: computed(() => sellerStore.activeSellers),
    inactiveSellers: computed(() => sellerStore.inactiveSellers),

    // Methods
    createSeller,
    loadUserSellers,
    loadPublicSeller,
    updateSeller,
    activateSeller,
    deactivateSeller,
    checkSlugAvailability,
    suggestSlugs,
    getFollowStatus,
    followSeller,
    unfollowSeller,
  }
}
