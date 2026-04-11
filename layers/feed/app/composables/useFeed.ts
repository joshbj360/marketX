import { useFeedApi } from '../services/feed.api'
import { useFeedStore } from '../stores/feed.stores'
import type { IFeedOptions } from '../types/feed.types'

/**
 * Composable for feed operations
 * Works with useLazyAsyncData for SSR support
 */
export const useFeed = () => {
  const feedApi = useFeedApi()
  const feedStore = useFeedStore()

  const isLoading = computed(() => feedStore.isLoading)
  const error = computed(() => feedStore.error)
  const canLoadMore = computed(() => feedStore.canLoadMore)

  /**
   * Fetch home feed (used with useLazyAsyncData)
   * Returns raw response for data hydration
   */
  const fetchHomeFeed = async (options: IFeedOptions = {}) => {
    try {
      const response = await feedApi.getHomeFeed({
        limit: options.limit || 20,
        offset: options.offset || 0,
        type: options.type,
      })

      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch feed')
    }
  }

  /**
   * Load more feed items (for infinite scroll)
   * Updates store directly
   */
  const loadMoreFeedItems = async (options: IFeedOptions = {}) => {
    if (!feedStore.canLoadMore || feedStore.isLoading) return

    feedStore.setLoading(true)

    try {
      const response = await feedApi.getHomeFeed({
        limit: options.limit || 20,
        offset: feedStore.currentOffset,
        type: options.type,
      })

      feedStore.appendToFeed(response.items, response.meta, 'main')

      return response
    } catch (err: any) {
      feedStore.setError(err.message || 'Failed to load more items')
      throw err
    } finally {
      feedStore.setLoading(false)
    }
  }

  /**
   * Fetch following feed
   */
  const fetchFollowingFeed = async (options: IFeedOptions = {}) => {
    try {
      const response = await feedApi.getFollowingFeed({
        limit: options.limit || 20,
        offset: options.offset || 0,
      })

      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch following feed')
    }
  }

  /**
   * Fetch discover feed
   */
  const fetchDiscoverFeed = async (options: IFeedOptions = {}) => {
    try {
      const response = await feedApi.getDiscoverFeed({
        limit: options.limit || 20,
        offset: options.offset || 0,
      })

      return response
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch discover feed')
    }
  }

  /**
   * Refresh feed (clear and reload)
   */
  const refreshFeed = async () => {
    feedStore.clearFeed('main')
    const response = await fetchHomeFeed({ limit: 20 })
    feedStore.setInitialFeed(response.items, response.meta, 'main')
    return response
  }

  /**
   * Fetch reels (video-only feed)
   */
  const fetchReels = async (limit = 10, offset = 0) => {
    try {
      return await feedApi.getReels(limit, offset)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch reels')
    }
  }

  return {
    // State
    isLoading,
    error,
    canLoadMore,

    // Getters
    mainFeed: computed(() => feedStore.mainFeed),
    followingFeed: computed(() => feedStore.followingFeed),
    discoverFeed: computed(() => feedStore.discoverFeed),

    // Actions
    fetchHomeFeed,
    loadMoreFeedItems,
    fetchFollowingFeed,
    fetchDiscoverFeed,
    refreshFeed,
    fetchReels,
  }
}
