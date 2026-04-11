// FILE PATH: server/layers/seller/types/seller.types.ts

/**
 * Seller Profile Types
 * TypeScript interfaces for seller-related operations
 */

// ==================== ENUMS ====================

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

// ==================== SELLER PROFILE ====================

export interface SellerProfile {
  id: string
  profileId: string
  store_name: string | null
  store_description: string | null
  store_logo: string | null
  store_banner: string | null
  store_location: string | null
  store_phone: string | null
  store_website: string | null
  store_socials: Record<string, any> | null
  store_slug: string
  followers_count: number
  is_verified: boolean
  is_active: boolean
  auto_answer_enabled: boolean
  verification_status: VerificationStatus
  verification_reason: string | null
  created_at: Date
  updated_at: Date
}

export interface SellerProfileWithProfile extends SellerProfile {
  profile: {
    id: string
    email: string
    username: string | null
    avatar: string | null
  }
}

export interface SellerProfilePublic {
  id: string
  store_name: string | null
  store_description: string | null
  store_logo: string | null
  store_banner: string | null
  store_slug: string
  followers_count: number
  is_verified: boolean
  store_location: string | null
  store_website: string | null
  store_socials: Record<string, any> | null
  verification_status: VerificationStatus
}

export interface SellerProfileDashboard extends SellerProfile {
  profile: {
    email: string
    username: string | null
  }
}

// ==================== SELLER REQUESTS ====================

export interface CreateSellerProfileRequest {
  store_name: string
  store_slug: string
  store_description?: string
  store_location?: string
  store_phone?: string
  store_website?: string
  store_logo?: string
  store_banner?: string
  store_socials?: {
    instagram?: string
    facebook?: string
    twitter?: string
    tiktok?: string
    youtube?: string
    linkedin?: string
  }
}

export interface UpdateSellerProfileRequest {
  store_name?: string
  store_description?: string
  store_location?: string
  store_phone?: string
  store_website?: string
  store_logo?: string
  store_banner?: string
  store_socials?: {
    instagram?: string
    facebook?: string
    twitter?: string
    tiktok?: string
    youtube?: string
    linkedin?: string
  }
  auto_answer_enabled?: boolean
}

export interface VerifySellerProfileRequest {
  verification_status: VerificationStatus
  verification_reason?: string
}

// ==================== SELLER RESPONSES ====================

export interface SellerResponse {
  success: boolean
  data: SellerProfile
  message: string
}

export interface SellerListResponse {
  success: boolean
  data: SellerProfile[]
  total: number
  message: string
}

export interface SellerPublicResponse {
  success: boolean
  data: SellerProfilePublic
  message: string
}

export interface SlugAvailabilityResponse {
  success: boolean
  available: boolean
  slug: string
  suggested?: string
  message: string
}

export interface SlugSuggestionResponse {
  success: boolean
  suggestions: string[]
  message: string
}

// ==================== SELLER ERROR ====================

export class SellerError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public data?: any,
  ) {
    super(message)
    this.name = 'SellerError'
  }
}

// ==================== SELLER STATISTICS ====================

export interface SellerStats {
  sellerId: string
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  averageRating: number
  followerCount: number
  isVerified: boolean
  isActive: boolean
}

// ==================== SELLER WALLET ====================

export interface SellerWallet {
  id: string
  sellerId: string
  balance: number
  currency: string
  lastUpdated: Date
}

// ==================== SELLER DOCUMENT ====================

export interface VerificationDocument {
  id: string
  sellerId: string
  documentType: string
  documentUrl: string
  status: VerificationStatus
  uploadedAt: Date
}
