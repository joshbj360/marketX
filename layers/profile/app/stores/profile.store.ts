// layers/user/app/stores/profile.store.ts

import type { IProfile, IProfileStats } from '../types/profile.types'

export const useProfileStore = defineStore('profile', () => {
  // ==================== STATE ====================
  const publicProfiles = ref<Map<string, IProfile | Partial<IProfile>>>(
    new Map(),
  )
  const profileStats = ref<Map<string, IProfileStats>>(new Map())

  const me = ref<IProfile | null>(null) // Your private data
  const mySettings = ref<any>(null)
  const myPosts = ref<any[]>([]) // Your active posts for instant UI
  const notificationsCount = ref(0) // Global badge count

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const userId = computed(() => me.value?.id)
  const isLoggedIn = computed(() => !!me.value)

  /**
   * Get profile stats for a user
   */
  const getProfileStats = (username: string): IProfileStats => {
    return (
      profileStats.value.get(username) || {
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        likesCount: 0,
      }
    )
  }

  // ==================== ACTIONS ====================

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
    if (err) {
      setTimeout(() => {
        error.value = null
      }, 5000)
    }
  }

  // Sets the logged-in user and caches them
  const setPrivateProfile = (profile: IProfile) => {
    me.value = profile
    publicProfiles.value.set(profile.username as string, profile)
  }

  /**
   * Set profile stats - SINGLE SOURCE OF TRUTH
   */
  const setProfileStats = (username: string, stats: IProfileStats) => {
    profileStats.value.set(username, stats)
  }

  /**
   * Unified Stat Updater (Handles increments and decrements)
   * This is the ONLY place to update stats
   */
  const updateStat = (
    username: string,
    key: 'followersCount' | 'postsCount' | 'followingCount' | 'likesCount',
    delta: number,
  ) => {
    const stats = profileStats.value.get(username)
    if (stats) {
      stats[key] = Math.max(0, stats[key] + delta)
      profileStats.value.set(username, stats)
    }
  }

  /**
   * Update multiple stats at once
   */
  const updateStats = (username: string, updates: Partial<IProfileStats>) => {
    const currentStats = getProfileStats(username)
    const newStats = { ...currentStats, ...updates }
    profileStats.value.set(username, newStats)
  }

  // Manage "My Posts" (Optimistic UI)
  const addMyPost = (post: any) => {
    myPosts.value.unshift(post)
    if (me.value) updateStat(me.value.username as string, 'postsCount', 1)
  }

  const removeMyPost = (postId: string) => {
    myPosts.value = myPosts.value.filter((p) => p.id !== postId)
    if (me.value) updateStat(me.value.username as string, 'postsCount', -1)
  }

  const setMySettings = (s: any) => {
    mySettings.value = s
  }

  const clearStore = () => {
    me.value = null
    mySettings.value = null
    myPosts.value = []
    publicProfiles.value.clear()
    profileStats.value.clear()
    notificationsCount.value = 0
  }

  return {
    me,
    mySettings,
    myPosts,
    notificationsCount,
    publicProfiles,
    profileStats,
    userId,
    isLoggedIn,
    isLoading,
    error,
    getProfileStats,
    setLoading,
    setError,
    setPrivateProfile,
    setMySettings,
    setPublicProfile: (p: IProfile) =>
      publicProfiles.value.set(p.username as string, p),
    setProfileStats,
    updateStat, // ✅ Update single stat
    updateStats,
    addMyPost,
    removeMyPost,
    clearStore,
  }
})
