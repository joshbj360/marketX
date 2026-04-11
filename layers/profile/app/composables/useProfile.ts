// layers/user/app/composables/useProfile.ts

import { useProfileApi } from '../services/profile.api'
import { useProfileStore } from '../stores/profile.store'

export const useProfile = () => {
  const profileApi = useProfileApi()
  const profileStore = useProfileStore()

  const isLoading = computed(() => profileStore.isLoading)
  const error = computed(() => profileStore.error)

  // FETCH OWN PROFILE
  const fetchMyProfile = async () => {
    profileStore.isLoading = true
    profileStore.error = null
    try {
      const result = await profileApi.getPrivateProfile()
      const profileStats = await profileApi.getProfileStats(
        result.data.username as string,
      )
      profileStore.setProfileStats(
        result.data.username as string,
        profileStats.data,
      )
      profileStore.setPrivateProfile(result.data)

      return result
    } catch (err: any) {
      profileStore.error = err.message || 'Failed to fetch profile'
    } finally {
      profileStore.isLoading = false
    }
  }

  // FETCH PUBLIC PROFILE
  const fetchPublicProfile = async (username: string) => {
    profileStore.isLoading = true
    profileStore.error = null
    try {
      const result = await profileApi.getPublicProfile(username)
      profileStore.setPublicProfile(result)
      // If stats are included in the API response
      if (result.profileStats) {
        profileStore.setProfileStats(username, result.profileStats)
      }
      return result
    } catch (err: any) {
      profileStore.error = err.message || 'User not found'
    } finally {
      profileStore.isLoading = false
    }
  }

  const updateMyProfile = async (data: any) => {
    profileStore.isLoading = true
    try {
      const result = await profileApi.updateProfile(data)
      profileStore.setPrivateProfile(result.data) // Updates "Me" and Cache
      return result
    } catch (err: any) {
      profileStore.error = err.message || 'Update failed'
      throw err
    } finally {
      profileStore.isLoading = false
    }
  }

  // ==================== GET STATS ====================

  /**
   * Fetch user's follow stats
   * Stores in profileStore (single source of truth)
   */
  const fetchUserStats = async (username: string) => {
    profileStore.setLoading(true)
    profileStore.setError(null)

    try {
      const result = await profileApi.getProfileStats(username)

      // ✅ Store in profileStore ONLY
      profileStore.setProfileStats(username, {
        followersCount: result.data.followersCount,
        followingCount: result.data.followingCount,
        followingUsersCount: result.data.followingUsersCount,
        followingSellersCount: result.data.followingSellersCount,
        postsCount: result.data.postsCount, // Keep existing
        likesCount: result.data.likesCount, // Keep existing
      })

      return result
    } catch (e: any) {
      profileStore.setError(e.message || 'Failed to fetch stats')
      throw e
    } finally {
      profileStore.setLoading(false)
    }
  }

  return {
    isLoading,
    error,
    fetchUserStats,
    fetchMyProfile,
    fetchPublicProfile,
    updateMyProfile,
  }
}
