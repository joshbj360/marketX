// layers/user/app/services/follow.api.ts

import { BaseApiClient } from '~~/layers/core/app/services/base.api'
import type {
  IFollowResponse,
  IFollowStatus,
  IProfile,
} from '../types/profile.types'

export class FollowApiClient extends BaseApiClient {
  // Get followers (public)
  async getFollowers(
    username: string,
    limit = 20,
    offset = 0,
  ): Promise<{ success: boolean; data: IFollowResponse }> {
    return await this.request(
      `/api/profile/${username}/followers?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        skipAuth: true,
      },
    )
  }

  // Get following (public)
  async getFollowing(
    username: string,
    limit = 20,
    offset = 0,
  ): Promise<{ success: boolean; data: IFollowResponse }> {
    return await this.request(
      `/api/profile/${username}/following?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        skipAuth: true,
      },
    )
  }

  // Follow user
  async followUser(username: string) {
    return await this.request(`/api/profile/${username}/follow`, {
      method: 'POST',
    })
  }

  // Unfollow user
  async unfollowUser(username: string) {
    return await this.request(`/api/profile/${username}/unfollow`, {
      method: 'DELETE',
    })
  }

  // Follow seller
  async followSeller(storeSlug: string) {
    return await this.request(`/api/seller/${storeSlug}/follow`, {
      method: 'POST',
    })
  }

  // Unfollow seller
  async unfollowSeller(storeSlug: string) {
    return await this.request(`/api/seller/${storeSlug}/unfollow`, {
      method: 'DELETE',
    })
  }

  // Check follow status
  async checkFollowStatus(
    username: string,
    type: 'USER' | 'SELLER' = 'USER',
  ): Promise<{ success: boolean; data: IFollowStatus }> {
    return await this.request(`/api/profile/${username}/status?type=${type}`, {
      method: 'GET',
    })
  }

  // Batch check following
  async checkFollowingBatch(
    targetIds: string[],
    followingType: 'USER' | 'SELLER' = 'USER',
  ): Promise<{ success: boolean; data: Set<string> }> {
    return await this.request('/api/profile/check-following', {
      method: 'POST',
      body: { targetIds, followingType },
    })
  }

  // Get suggestions
  async getSuggestedUsers(
    limit = 10,
  ): Promise<{ success: boolean; data: Partial<IProfile>[] }> {
    return await this.request(`/api/profile/suggestions?limit=${limit}`, {
      method: 'GET',
    })
  }
}

// Singleton
let instance: FollowApiClient | null = null
export const useFollowApi = () => {
  if (!instance) instance = new FollowApiClient()
  return instance
}
