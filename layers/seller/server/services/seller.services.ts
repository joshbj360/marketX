// FILE PATH: server/layers/seller/services/seller.service.ts

import { SellerError, SellerProfile } from '../types/seller.types'
import {
  CreateSellerProfileRequest,
  UpdateSellerProfileRequest,
  VerifySellerProfileRequest,
} from '../schemas/seller.schema'
import { sellerRepository } from '../repositories/seller.repository'

/**
 * Seller Service
 *
 * Handles business logic for seller profiles:
 * - Create/update/activate/deactivate seller profiles
 * - Verify seller status
 * - Slug management and validation
 * - Seller statistics and followers
 *
 * Auth operations: auth.service.ts
 * Seller data access: seller.repository.ts
 */

export const sellerService = {
  // ==================== CREATE SELLER ====================

  async createSellerProfile(
    userId: string,
    data: CreateSellerProfileRequest,
  ): Promise<SellerProfile> {
    // Check if user already has a seller with this slug
    const existingSlug = await sellerRepository.userHasSellerSlug(
      userId,
      data.store_slug,
    )
    if (existingSlug) {
      throw new SellerError(
        `You already have a seller with slug "${data.store_slug}"`,
        400,
      )
    }

    // Check if slug is taken globally
    const slugTaken = await sellerRepository.isStoreSlugTaken(data.store_slug)
    if (slugTaken) {
      throw new SellerError(
        `Store slug "${data.store_slug}" is already taken`,
        409,
      )
    }

    // Validate store name uniqueness per user (optional business rule)
    const userSellers = await sellerRepository.getUserSellerProfiles(userId)
    const nameExists = userSellers.some((s) => s.store_name === data.store_name)
    if (nameExists) {
      throw new SellerError(
        'You already have a seller with this store name',
        400,
      )
    }

    try {
      const seller = await sellerRepository.createSellerProfile(userId, {
        store_name: data.store_name,
        store_slug: data.store_slug,
        store_description: data.store_description,
        store_logo: data.store_logo,
        store_banner: data.store_banner,
        store_location: data.store_location,
        store_phone: data.store_phone,
        store_website: data.store_website,
        store_socials: data.store_socials,
        default_currency: data.default_currency,
      })

      // Promote user role to 'seller' so UI hides "Become a Seller" prompts
      await prisma.profile.update({
        where: { id: userId },
        data: { role: 'seller' },
      })

      return seller
    } catch (error: any) {
      throw new SellerError('Failed to create seller profile', 500, {
        originalError: error.message,
      })
    }
  },

  // ==================== GET SELLER ====================

  async getSellerProfile(sellerId: string): Promise<SellerProfile> {
    const seller = await sellerRepository.getSellerProfile(sellerId)

    if (!seller) {
      throw new SellerError('Seller profile not found', 404)
    }

    return seller
  },

  async getSellerBySlug(slug: string): Promise<SellerProfile> {
    const seller = await sellerRepository.getSellerBySlug(slug)

    if (!seller || !seller.is_active) {
      throw new SellerError('Seller profile not found', 404)
    }

    return seller
  },

  async getSellerWithRelations(sellerId: string): Promise<any> {
    const seller = await sellerRepository.getSellerWithRelations(sellerId)

    if (!seller) {
      throw new SellerError('Seller profile not found', 404)
    }

    return seller
  },

  async getUserSellerProfiles(userId: string): Promise<SellerProfile[]> {
    const sellers = await sellerRepository.getUserSellerProfiles(userId)
    return sellers ?? []
  },

  // ==================== UPDATE SELLER ====================

  async updateSellerProfile(
    sellerId: string,
    userId: string,
    data: UpdateSellerProfileRequest,
  ): Promise<SellerProfile> {
    // Verify ownership
    const seller = await sellerRepository.getSellerProfile(sellerId)

    if (!seller) {
      throw new SellerError('Seller profile not found', 404)
    }

    if (seller.profileId !== userId) {
      throw new SellerError(
        "Unauthorized: Cannot update another user's seller profile",
        403,
      )
    }

    try {
      const updated = await sellerRepository.updateSellerProfile(
        sellerId,
        userId,
        data,
      )

      return updated
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        throw error
      }

      throw new SellerError('Failed to update seller profile', 500, {
        originalError: error.message,
      })
    }
  },

  // ==================== ACTIVATE / DEACTIVATE ====================

  async activateSellerProfile(
    sellerId: string,
    userId: string,
  ): Promise<SellerProfile> {
    try {
      const seller = await sellerRepository.activateSellerProfile(
        sellerId,
        userId,
      )
      return seller
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        throw new SellerError(
          "Unauthorized: Cannot activate another user's seller",
          403,
        )
      }

      if (error.message.includes('already active')) {
        throw new SellerError('Seller profile is already active', 400)
      }

      throw new SellerError('Failed to activate seller profile', 500, {
        originalError: error.message,
      })
    }
  },

  async deactivateSellerProfile(
    sellerId: string,
    userId: string,
  ): Promise<SellerProfile> {
    try {
      const seller = await sellerRepository.deactivateSellerProfile(
        sellerId,
        userId,
      )
      return seller
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        throw new SellerError(
          "Unauthorized: Cannot deactivate another user's seller",
          403,
        )
      }

      if (error.message.includes('already deactivated')) {
        throw new SellerError('Seller profile is already deactivated', 400)
      }

      throw new SellerError('Failed to deactivate seller profile', 500, {
        originalError: error.message,
      })
    }
  },

  // ==================== SLUG MANAGEMENT ====================

  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const isTaken = await sellerRepository.isStoreSlugTaken(slug)
    return { available: !isTaken }
  },

  async suggestSlug(baseName: string): Promise<string[]> {
    // Generate base suggestions
    const baseSlugs = [
      baseName,
      `${baseName}-store`,
      `the-${baseName}`,
      baseName.substring(0, 20), // Truncate if too long
    ]

    const suggestions: string[] = []

    for (const baseSlug of baseSlugs) {
      const suggestedSlug = await sellerRepository.getSuggestedSlug([baseSlug])
      suggestions.push(suggestedSlug)

      if (suggestions.length >= 3) break
    }

    return suggestions
  },

  // ==================== VERIFICATION ====================

  async updateVerificationStatus(
    sellerId: string,
    data: VerifySellerProfileRequest,
  ): Promise<SellerProfile> {
    const seller = await sellerRepository.getSellerProfile(sellerId)

    if (!seller) {
      throw new SellerError('Seller profile not found', 404)
    }

    try {
      const updated = await sellerRepository.updateVerificationStatus(
        sellerId,
        data.verification_status,
        data.verification_reason,
      )

      return updated
    } catch (error: any) {
      throw new SellerError('Failed to update verification status', 500, {
        originalError: error.message,
      })
    }
  },

  async verifySellerProfile(sellerId: string): Promise<SellerProfile> {
    const seller = await sellerRepository.getSellerProfile(sellerId)

    if (!seller) {
      throw new SellerError('Seller profile not found', 404)
    }

    if (seller.is_verified) {
      throw new SellerError('Seller profile is already verified', 400)
    }

    try {
      const updated = await sellerRepository.verifySellerProfile(sellerId)
      return updated
    } catch (error: any) {
      throw new SellerError('Failed to verify seller profile', 500, {
        originalError: error.message,
      })
    }
  },

  // ==================== FOLLOWERS ====================

  async incrementFollowers(sellerId: string): Promise<void> {
    try {
      await sellerRepository.incrementFollowers(sellerId)
    } catch (error: any) {
      throw new SellerError('Failed to increment followers', 500, {
        originalError: error.message,
      })
    }
  },

  async decrementFollowers(sellerId: string): Promise<void> {
    try {
      await sellerRepository.decrementFollowers(sellerId)
    } catch (error: any) {
      throw new SellerError('Failed to decrement followers', 500, {
        originalError: error.message,
      })
    }
  },

  async getFollowerCount(sellerId: string): Promise<number> {
    return sellerRepository.getFollowerCount(sellerId)
  },

  // ==================== BATCH OPERATIONS ====================

  async deactivateAllUserSellers(userId: string): Promise<number> {
    try {
      return await sellerRepository.deactivateAllUserSellers(userId)
    } catch (error: any) {
      throw new SellerError('Failed to deactivate sellers', 500, {
        originalError: error.message,
      })
    }
  },

  async activateAllUserSellers(userId: string): Promise<number> {
    try {
      return await sellerRepository.activateAllUserSellers(userId)
    } catch (error: any) {
      throw new SellerError('Failed to activate sellers', 500, {
        originalError: error.message,
      })
    }
  },
}
