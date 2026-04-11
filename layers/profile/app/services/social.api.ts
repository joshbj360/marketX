import { BaseApiClient } from '~~/layers/core/app/services/base.api'

export class SocialApiClient extends BaseApiClient {
  async getFollowing(limit = 50, offset = 0): Promise<any> {
    return this.request(
      `/api/profile/following?limit=${limit}&offset=${offset}`,
      { method: 'GET' },
    )
  }

  async getFollowers(limit = 50, offset = 0): Promise<any> {
    return this.request(
      `/api/profile/followers?limit=${limit}&offset=${offset}`,
      { method: 'GET' },
    )
  }

  async getFollowedSellerIds(): Promise<{ success: boolean; data: string[] }> {
    return this.request('/api/seller/following-ids', {
      method: 'GET',
      silent: true,
    }) as Promise<{ success: boolean; data: string[] }>
  }

  async followSeller(storeSlug: string): Promise<any> {
    return this.request(`/api/seller/${storeSlug}/follow`, { method: 'POST' })
  }

  async unfollowSeller(storeSlug: string): Promise<any> {
    return this.request(`/api/seller/${storeSlug}/unfollow`, {
      method: 'DELETE',
    })
  }
}

let instance: SocialApiClient | null = null
export const useSocialApi = () => {
  if (!instance) instance = new SocialApiClient()
  return instance
}
