// FILE PATH: layers/app/services/profile.api.ts

/**
 * Profile API Service
 * Handles user profile API calls
 */

import { BaseApiClient } from '~~/layers/core/app/services/base.api'
import type { IProfile, IProfileStats } from '../types/profile.types'

export class ProfileApiClient extends BaseApiClient {
  // ==================== GET PROFILE ====================
  async getPrivateProfile(): Promise<{ success: true; data: IProfile }> {
    return this.request('/api/profile', {
      method: 'GET',
    })
  }

  async getPublicProfile(username: string): Promise<IProfile> {
    const response = await this.request<{ success: boolean; data: IProfile }>(
      `/api/profile/${username}`,
      {
        method: 'GET',
      },
    )
    return response.data
  }

  async getProfileStats(
    username: string,
  ): Promise<{ success: boolean; data: IProfileStats }> {
    return this.request(`/api/profile/${username}/stats`, {
      method: 'GET',
    })
  }

  // ==================== UPDATE PROFILE ====================
  async updateProfile(
    data: Partial<IProfile>,
  ): Promise<{ success: boolean; data: IProfile }> {
    return this.request('/api/profile', {
      method: 'PATCH',
      body: data,
    })
  }

  // ==================== SETTINGS MANAGEMENT ====================

  /**
   * Get user settings
   */
  async getSettings(): Promise<any> {
    return this.request('/api/profile/settings', {
      method: 'GET',
    })
  }

  /**
   * Update user settings
   */
  async updateSettings(updates: any): Promise<any> {
    return this.request('/api/profile/settings', {
      method: 'PATCH',
      body: updates,
    })
  }

  // ==================== SECURITY & ACCOUNT ====================

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<any> {
    return this.request('/api/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword, confirmPassword },
    })
  }

  /**
   * Change email address
   */
  async changeEmail(newEmail: string, password: string): Promise<any> {
    return this.request('/api/email', {
      method: 'PATCH',
      body: { newEmail, password },
    })
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<any> {
    return this.request('/api/profile', {
      method: 'DELETE',
      body: { password },
    })
  }
}

/**
 * Composable to use ProfileApiClient
 * Returns singleton instance
 */
let instance: ProfileApiClient | null = null
export const useProfileApi = () => {
  if (!instance) {
    instance = new ProfileApiClient()
  }
  return instance
}
