import { BaseApiClient } from '~~/layers/core/app/services/base.api'

export class StoryApiClient extends BaseApiClient {
  async getStories(limit = 50) {
    return this.request(`/api/stories?limit=${limit}`, { method: 'GET' })
  }
  async getStoryById(id: string) {
    return this.request(`/api/stories/${id}`, { method: 'GET' })
  }
  async createStory(data: {
    mediaUrl: string
    mediaPublicId?: string
    mediaType?: string
    productId?: number
  }) {
    return this.request('/api/stories', { method: 'POST', body: data })
  }
  async deleteStory(id: string) {
    return this.request(`/api/stories/${id}`, { method: 'DELETE' })
  }
}

let instance: StoryApiClient | null = null
export const useStoryApi = () => {
  if (!instance) instance = new StoryApiClient()
  return instance
}
