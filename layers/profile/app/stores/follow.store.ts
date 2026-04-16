// layers/user/app/stores/follow.store.ts

export const useFollowStore = defineStore('follow', () => {
  // ==================== STATE ====================

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Cache for followers lists (NOT stats!)
  const followersCache = ref<Map<string, Array<any>>>(new Map())

  // Cache for following lists (NOT stats!)
  const followingCache = ref<Map<string, Array<any>>>(new Map())

  // Cache for follow status (is this user following that user?)
  const followStatusCache = ref<Map<string, boolean>>(new Map())

  // Keys (username or userId) that are currently being resolved by a batch check.
  // FollowButton checks this to avoid firing redundant individual requests.
  const pendingBatchKeys = ref<Set<string>>(new Set())

  // ==================== GETTERS ====================

  const getFollowers = (username: string) => {
    return followersCache.value.get(username) || []
  }

  const getFollowing = (username: string) => {
    return followingCache.value.get(username) || []
  }

  const isFollowing = (username: string) => {
    return followStatusCache.value.get(username) || false
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

  const setFollowers = (username: string, followers: Array<any>) => {
    followersCache.value.set(username, followers)
  }

  const setFollowing = (username: string, following: Array<any>) => {
    followingCache.value.set(username, following)
  }

  const setFollowStatus = (username: string, status: boolean) => {
    followStatusCache.value.set(username, status)
  }

  const markBatchPending = (keys: string[]) => {
    keys.forEach((k) => pendingBatchKeys.value.add(k))
  }

  const clearBatchPending = (keys: string[]) => {
    keys.forEach((k) => pendingBatchKeys.value.delete(k))
  }

  const isBatchPending = (key: string) => pendingBatchKeys.value.has(key)

  const clearCache = () => {
    followersCache.value.clear()
    followingCache.value.clear()
    followStatusCache.value.clear()
    pendingBatchKeys.value.clear()
    error.value = null
  }

  // ==================== RETURN ====================

  return {
    // State
    isLoading,
    error,
    followersCache,
    followingCache,
    followStatusCache,
    pendingBatchKeys,

    // Getters
    getFollowers,
    getFollowing,
    isFollowing,
    isBatchPending,

    // Actions
    setLoading,
    setError,
    setFollowers,
    setFollowing,
    setFollowStatus,
    markBatchPending,
    clearBatchPending,
    clearCache,
  }
})
