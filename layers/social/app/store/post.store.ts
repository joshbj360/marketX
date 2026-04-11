// layers/social/app/stores/post.store.ts

export const usePostStore = defineStore('post', () => {
  const posts = ref<Map<string, any>>(new Map()) // Master record — all posts
  const userPosts = ref<Map<string, string[]>>(new Map()) // username → post ids
  const userLikedPosts = ref<Map<string, string[]>>(new Map()) // username → liked post ids
  const savedPostIds = ref<string[]>([])
  const likedPostIds = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ──────────────────────────────────────────────────────────────────
  const getPostById = (id: string) => posts.value.get(id)

  const getPostsByUsername = (username: string) => {
    const ids = userPosts.value.get(username) || []
    return ids.map((id) => posts.value.get(id)).filter(Boolean)
  }

  const getLikedPostsByUsername = (username: string) => {
    const ids = userLikedPosts.value.get(username) || []
    return ids.map((id) => posts.value.get(id)).filter(Boolean)
  }

  const mySavedPosts = computed(() =>
    savedPostIds.value.map((id) => posts.value.get(id)).filter(Boolean),
  )

  // ── Actions ───────────────────────────────────────────────────────────────────
  const addPosts = (newPosts: any[], username?: string) => {
    newPosts.forEach((post) => posts.value.set(post.id, post))
    if (username) {
      const existingIds = userPosts.value.get(username) || []
      const newIds = newPosts.map((p) => p.id)
      userPosts.value.set(username, [...new Set([...existingIds, ...newIds])])
    }
  }

  const addLikedPostsByUser = (newPosts: any[], username: string) => {
    newPosts.forEach((post) => posts.value.set(post.id, post))
    const existingIds = userLikedPosts.value.get(username) || []
    const newIds = newPosts.map((p) => p.id)
    userLikedPosts.value.set(username, [
      ...new Set([...existingIds, ...newIds]),
    ])
  }

  const deletePost = (id: string) => {
    posts.value.delete(id)
    userPosts.value.forEach((ids, key) => {
      userPosts.value.set(
        key,
        ids.filter((postId) => postId !== id),
      )
    })
    savedPostIds.value = savedPostIds.value.filter((postId) => postId !== id)
  }

  const updatePost = (id: string, updates: any) => {
    const existing = posts.value.get(id)
    if (existing) posts.value.set(id, { ...existing, ...updates })
  }

  const setSavedPosts = (newPosts: any[]) => {
    newPosts.forEach((post) => posts.value.set(post.id, post))
    savedPostIds.value = newPosts.map((p) => p.id)
  }

  const addSavedPosts = (newPosts: any[]) => {
    newPosts.forEach((post) => posts.value.set(post.id, post))
    const newIds = newPosts.map((p) => p.id)
    savedPostIds.value = [...new Set([...savedPostIds.value, ...newIds])]
  }

  const removeSavedPost = (postId: string) => {
    savedPostIds.value = savedPostIds.value.filter((id) => id !== postId)
  }

  // Liked posts (own interaction tracking)
  const isPostLiked = (postId: string) => likedPostIds.value.has(postId)
  const setLikedPosts = (ids: string[]) => {
    likedPostIds.value = new Set(ids)
  }
  const addLikedPost = (postId: string) => {
    likedPostIds.value.add(postId)
  }
  const removeLikedPost = (postId: string) => {
    likedPostIds.value.delete(postId)
  }

  return {
    posts,
    userPosts,
    userLikedPosts,
    isLoading,
    error,
    getPostById,
    getPostsByUsername,
    getLikedPostsByUsername,
    addPosts,
    addLikedPostsByUser,
    deletePost,
    updatePost,
    setLoading: (val: boolean) => {
      isLoading.value = val
    },
    setError: (val: string | null) => {
      error.value = val
    },

    savedPostIds,
    mySavedPosts,
    setSavedPosts,
    addSavedPosts,
    removeSavedPost,

    likedPostIds,
    isPostLiked,
    setLikedPosts,
    addLikedPost,
    removeLikedPost,
  }
})
