import type { IFeedItem, IFeedResponse } from '../types/feed.types'

export const useFeedStore = defineStore('feed', () => {
  // State
  const mainFeed = ref<IFeedItem[]>([])
  const followingFeed = ref<IFeedItem[]>([])
  const discoverFeed = ref<IFeedItem[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  const currentOffset = ref(0)

  // Getters
  const canLoadMore = computed(() => hasMore.value && !isLoading.value)

  /**
   * Get feed by type
   */
  const getFeed = (type: 'main' | 'following' | 'discover' = 'main') => {
    switch (type) {
      case 'following':
        return followingFeed.value
      case 'discover':
        return discoverFeed.value
      default:
        return mainFeed.value
    }
  }

  /**
   * Find item by ID across all feeds
   */
  const findItem = (id: string): IFeedItem | undefined => {
    return (
      mainFeed.value.find((item) => item.id === id) ||
      followingFeed.value.find((item) => item.id === id) ||
      discoverFeed.value.find((item) => item.id === id)
    )
  }

  // Mutations
  /**
   * Set initial feed
   */
  const setInitialFeed = (
    items: IFeedItem[],
    meta: IFeedResponse['meta'],
    feedType: 'main' | 'following' | 'discover' = 'main',
  ) => {
    const targetFeed =
      feedType === 'following'
        ? followingFeed
        : feedType === 'discover'
          ? discoverFeed
          : mainFeed

    targetFeed.value = items
    hasMore.value = meta.hasMore
    currentOffset.value = meta.offset + items.length
  }

  /**
   * Append items to feed (for infinite scroll)
   */
  const appendToFeed = (
    items: IFeedItem[],
    meta: IFeedResponse['meta'],
    feedType: 'main' | 'following' | 'discover' = 'main',
  ) => {
    const targetFeed =
      feedType === 'following'
        ? followingFeed
        : feedType === 'discover'
          ? discoverFeed
          : mainFeed

    targetFeed.value = mergeFeedItems(targetFeed.value, items)
    hasMore.value = meta.hasMore
    currentOffset.value = meta.offset + items.length
  }

  /**
   * Prepend new item (e.g., after creating post)
   */
  const prependItem = (
    item: IFeedItem,
    feedType: 'main' | 'following' | 'discover' = 'main',
  ) => {
    const targetFeed =
      feedType === 'following'
        ? followingFeed
        : feedType === 'discover'
          ? discoverFeed
          : mainFeed

    targetFeed.value.unshift(item)
  }

  /**
   * Update existing item (e.g., after like/unlike)
   */
  const updateItem = (id: string, updates: Partial<IFeedItem>) => {
    const updateInFeed = (feed: Ref<IFeedItem[]>) => {
      const index = feed.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        feed.value[index] = { ...feed.value[index], ...updates }
      }
    }

    updateInFeed(mainFeed)
    updateInFeed(followingFeed)
    updateInFeed(discoverFeed)
  }

  /**
   * Remove item from feed
   */
  const removeItem = (id: string) => {
    mainFeed.value = mainFeed.value.filter((item) => item.id !== id)
    followingFeed.value = followingFeed.value.filter((item) => item.id !== id)
    discoverFeed.value = discoverFeed.value.filter((item) => item.id !== id)
  }

  /**`
   * Increment like count optimistically
   */
  const incrementLikeCount = (id: string) => {
    const item = findItem(id)
    if (item) {
      updateItem(id, { likeCount: item.likeCount + 1 })
    }
  }

  /**
   * Decrement like count optimistically
   */
  const decrementLikeCount = (id: string) => {
    const item = findItem(id)
    if (item) {
      updateItem(id, { likeCount: Math.max(0, item.likeCount - 1) })
    }
  }

  /**
   * Increment comment count
   */
  const incrementCommentCount = (id: string) => {
    const item = findItem(id)
    if (item) {
      updateItem(id, { commentCount: item.commentCount + 1 })
    }
  }

  // UI State
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  const setError = (err: string | null) => {
    error.value = err
  }

  /**
   * Clear all feeds
   */
  const clearAllFeeds = () => {
    mainFeed.value = []
    followingFeed.value = []
    discoverFeed.value = []
    currentOffset.value = 0
    hasMore.value = true
    error.value = null
  }

  /**
   * Clear specific feed
   */
  const clearFeed = (feedType: 'main' | 'following' | 'discover' = 'main') => {
    const targetFeed =
      feedType === 'following'
        ? followingFeed
        : feedType === 'discover'
          ? discoverFeed
          : mainFeed

    targetFeed.value = []
    currentOffset.value = 0
    hasMore.value = true
  }

  return {
    // State
    mainFeed,
    followingFeed,
    discoverFeed,
    isLoading,
    error,
    hasMore,
    currentOffset,

    // Getters
    canLoadMore,
    getFeed,
    findItem,

    // Mutations
    setInitialFeed,
    appendToFeed,
    prependItem,
    updateItem,
    removeItem,
    incrementLikeCount,
    decrementLikeCount,
    incrementCommentCount,
    setLoading,
    setError,
    clearAllFeeds,
    clearFeed,
  }
})
