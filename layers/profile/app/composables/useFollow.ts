// layers/user/app/composables/useFollow.ts

import { useFollowApi } from '../services/follow.api'
import { useFollowStore } from '../stores/follow.store'
import { useProfileStore } from '../stores/profile.store'

export const useFollow = () => {
  const followApi = useFollowApi()
  const followStore = useFollowStore()
  const profileStore = useProfileStore()

  const isLoading = computed(() => followStore.isLoading)
  const error = computed(() => followStore.error)

  // ==================== GET FOLLOWERS/FOLLOWING ====================

  /**
   * Fetch user's followers
   */
  const fetchFollowers = async (username: string, limit = 20, offset = 0) => {
    followStore.setLoading(true)
    followStore.setError(null)

    try {
      const result = await followApi.getFollowers(username, limit, offset)

      // Cache the followers list
      if (offset === 0) {
        followStore.setFollowers(username, result.data.items)
      } else {
        const existing = followStore.getFollowers(username)
        followStore.setFollowers(username, [...existing, ...result.data.items])
      }

      return result.data
    } catch (e: any) {
      followStore.setError(e.message || 'Failed to fetch followers')
      throw e
    } finally {
      followStore.setLoading(false)
    }
  }

  /**
   * Fetch user's following
   */
  const fetchFollowing = async (username: string, limit = 20, offset = 0) => {
    followStore.setLoading(true)
    followStore.setError(null)

    try {
      const result = await followApi.getFollowing(username, limit, offset)

      // Cache the following list
      if (offset === 0) {
        followStore.setFollowing(username, result.data.items)
      } else {
        const existing = followStore.getFollowing(username)
        followStore.setFollowing(username, [...existing, ...result.data.items])
      }

      return result.data
    } catch (e: any) {
      followStore.setError(e.message || 'Failed to fetch following')
      throw e
    } finally {
      followStore.setLoading(false)
    }
  }

  // ==================== FOLLOW/UNFOLLOW ====================

  /**
   * Follow a user
   * Updates stats in profileStore only
   */
  const followUser = async (username: string) => {
    followStore.setLoading(true)
    followStore.setError(null)

    try {
      await followApi.followUser(username)

      // Update follow status cache
      followStore.setFollowStatus(username, true)

      // ✅ Update stats in profileStore (single source of truth)
      profileStore.updateStat(username, 'followersCount', 1)

      // Update my following count
      if (profileStore.me?.username) {
        profileStore.updateStat(profileStore.me.username, 'followingCount', 1)
      }

      return true
    } catch (error: any) {
      followStore.setError(error.message || 'Failed to follow user')
      throw error
    } finally {
      followStore.setLoading(false)
    }
  }

  /**
   * Unfollow a user
   * Updates stats in profileStore only
   */
  const unfollowUser = async (username: string) => {
    followStore.setLoading(true)
    followStore.setError(null)

    try {
      await followApi.unfollowUser(username)

      // Update follow status cache
      followStore.setFollowStatus(username, false)

      // ✅ Update stats in profileStore (single source of truth)
      profileStore.updateStat(username, 'followersCount', -1)

      // Update my following count
      if (profileStore.me?.username) {
        profileStore.updateStat(profileStore.me.username, 'followingCount', -1)
      }

      return true
    } catch (error: any) {
      followStore.setError(error.message || 'Failed to unfollow user')
      throw error
    } finally {
      followStore.setLoading(false)
    }
  }

  /**
   * Follow a seller/store
   */
  const followSeller = async (storeSlug: string) => {
    followStore.setLoading(true)
    followStore.setError(null)

    try {
      await followApi.followSeller(storeSlug)

      followStore.setFollowStatus(storeSlug, true)

      // Update my following count only
      if (profileStore.me?.username) {
        profileStore.updateStat(profileStore.me.username, 'followingCount', 1)
      }

      return true
    } catch (error: any) {
      followStore.setError(error.message || 'Failed to follow store')
      throw error
    } finally {
      followStore.setLoading(false)
    }
  }

  /**
   * Unfollow a seller/store
   */
  const unfollowSeller = async (storeSlug: string) => {
    followStore.setLoading(true)
    followStore.setError(null)

    try {
      await followApi.unfollowSeller(storeSlug)

      followStore.setFollowStatus(storeSlug, false)

      // Update my following count only
      if (profileStore.me?.username) {
        profileStore.updateStat(profileStore.me.username, 'followingCount', -1)
      }

      return true
    } catch (error: any) {
      followStore.setError(error.message || 'Failed to unfollow store')
      throw error
    } finally {
      followStore.setLoading(false)
    }
  }

  // ==================== CHECK STATUS ====================

  /**
   * Check if following a user
   */
  const checkIfFollowing = async (
    username: string,
    type: 'USER' | 'SELLER' = 'USER',
  ) => {
    try {
      const result = await followApi.checkFollowStatus(username, type)
      followStore.setFollowStatus(username, result.data.isFollowing)
      return result.data.isFollowing
    } catch (e: any) {
      console.error('Failed to check follow status:', e)
      return false
    }
  }

  /**
   * Batch check if following multiple users
   */
  const checkFollowingBatch = async (
    targetIds: string[],
    type: 'USER' | 'SELLER' = 'USER',
    idToUsername?: Record<string, string>, // optional map so we can also cache by username
  ) => {
    try {
      const result = await followApi.checkFollowingBatch(targetIds, type)

      // Cache by ID (existing) + by username (so FollowButton finds it without a separate call)
      Object.entries(result.data).forEach(([id, isFollowing]) => {
        followStore.setFollowStatus(id, isFollowing as boolean)
        const username = idToUsername?.[id]
        if (username) followStore.setFollowStatus(username, isFollowing as boolean)
      })

      return result.data
    } catch (e: any) {
      console.error('Failed to batch check following:', e)
      return {}
    }
  }

  // ==================== SUGGESTIONS ====================

  /**
   * Get suggested users to follow
   */
  const fetchSuggestedUsers = async (limit = 10) => {
    followStore.setLoading(true)
    followStore.setError(null)

    try {
      const result = await followApi.getSuggestedUsers(limit)
      return result.data
    } catch (e: any) {
      followStore.setError(e.message || 'Failed to fetch suggestions')
      throw e
    } finally {
      followStore.setLoading(false)
    }
  }

  // ==================== RETURN ====================

  return {
    // State
    isLoading,
    error,

    // Lists (stores in followStore)
    fetchFollowers,
    fetchFollowing,

    // Actions (updates profileStore stats)
    followUser,
    unfollowUser,
    followSeller,
    unfollowSeller,

    // Status (caches in followStore)
    checkIfFollowing,
    checkFollowingBatch,

    // Suggestions
    fetchSuggestedUsers,
  }
}
