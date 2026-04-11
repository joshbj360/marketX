// FILE PATH: layers/seller/app/services/seller.api.ts

import { BaseApiClient } from '~~/layers/core/app/services/base.api'

/**
 * Seller API Client
 * Handles all seller-related API calls
 * Extends BaseApiClient to inherit auth, CSRF, error handling, etc.
 */

export class SellerApiClient extends BaseApiClient {
  // ==================== CREATE SELLER ====================

  /**
   * Create a new seller profile
   */
  async createSellerProfile(data: {
    store_name: string
    store_slug: string
    store_description?: string
    store_location?: string
    store_phone?: string
    store_website?: string
    store_logo?: string
    store_banner?: string
    store_socials?: Record<string, any>
    default_currency?: string
  }): Promise<any> {
    return this.request('/api/seller/register', {
      method: 'POST',
      body: data,
    })
  }

  // ==================== GET SELLERS ====================

  /**
   * Get all seller profiles for current user
   */
  async getUserSellerProfiles(): Promise<any> {
    return this.request('/api/seller/list', {
      method: 'GET',
    })
  }

  /**
   * Get public seller profile by slug
   */
  async getSellerBySlug(slug: string): Promise<any> {
    return this.request(`/api/seller/${slug}`, {
      method: 'GET',
    })
  }

  // ==================== UPDATE SELLER ====================

  /**
   * Update seller profile
   */
  async updateSellerProfile(
    sellerId: string,
    data: {
      store_name?: string
      store_description?: string
      store_location?: string
      store_phone?: string
      store_website?: string
      store_logo?: string
      store_banner?: string
      store_socials?: Record<string, any>
      auto_answer_enabled?: boolean
    },
  ): Promise<any> {
    return this.request(`/api/seller/${sellerId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  // ==================== ACTIVATE / DEACTIVATE ====================

  /**
   * Activate seller profile
   */
  async activateSellerProfile(sellerId: string): Promise<any> {
    return this.request(`/api/seller/${sellerId}/activate`, {
      method: 'POST',
    })
  }

  /**
   * Deactivate seller profile
   */
  async deactivateSellerProfile(sellerId: string): Promise<any> {
    return this.request(`/api/seller/${sellerId}/deactivate`, {
      method: 'POST',
    })
  }

  // ==================== SLUG MANAGEMENT ====================

  /**
   * Check if slug is available
   */
  async checkSlugAvailability(slug: string): Promise<any> {
    return this.request('/api/seller/check-slug', {
      method: 'POST',
      body: { slug },
      skipAuth: true, // Public endpoint
    })
  }

  /**
   * Get slug suggestions based on store name
   */
  async suggestSlugs(baseName: string): Promise<any> {
    return this.request('/api/seller/suggest-slug', {
      method: 'POST',
      body: { baseName },
      skipAuth: true, // Public endpoint
    })
  }

  async getFollowStatus(
    storeSlug: string,
  ): Promise<{ success: boolean; data: { isFollowing: boolean } }> {
    return this.request(`/api/seller/${storeSlug}/follow-status`, {
      method: 'GET',
      silent: true,
    }) as Promise<{ success: boolean; data: { isFollowing: boolean } }>
  }

  async followSeller(storeSlug: string): Promise<any> {
    return this.request(`/api/seller/${storeSlug}/follow`, { method: 'POST' })
  }

  async unfollowSeller(storeSlug: string): Promise<any> {
    return this.request(`/api/seller/${storeSlug}/unfollow`, {
      method: 'DELETE',
    })
  }

  /** Mark seller as online (map presence). Fire-and-forget — silent on error. */
  ping(): Promise<any> {
    return this.request('/api/seller/ping', { method: 'POST', silent: true })
  }
}

/**
 * Composable to use SellerApiClient
 * Returns a new instance of the API client
 */
export const useSellerApi = () => {
  return new SellerApiClient()
}
