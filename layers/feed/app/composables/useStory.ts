import { useStoryApi } from '../services/story.api'
import { useStoryStore } from '../stores/story.store'

export const useStory = () => {
  const api = useStoryApi()
  const store = useStoryStore()

  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const stories = computed(() => store.stories)

  const fetchStories = async (limit = 50) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: any = await api.getStories(limit)
      store.setStories(result.data || [])
      return result.data
    } catch (e: any) {
      store.setError(e.message || 'Failed to fetch stories')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const createStory = async (data: {
    mediaUrl: string
    mediaPublicId?: string
    mediaType?: string
    productId?: number
  }) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: any = await api.createStory(data)
      store.addStory(result.data)
      return result.data
    } catch (e: any) {
      store.setError(e.message || 'Failed to create story')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const deleteStory = async (id: string) => {
    try {
      await api.deleteStory(id)
      store.removeStory(id)
    } catch (e: any) {
      store.setError(e.message || 'Failed to delete story')
      throw e
    }
  }

  return { isLoading, error, stories, fetchStories, createStory, deleteStory }
}
