//Location:** `~/layers/profile/app/types/profile.types.ts`
import type { NotificationType, Profile as ProfileModel } from '@prisma/client'
import type { ISellerProfile } from '~~/layers/seller/app/types/seller.types'
export interface IProfile extends ProfileModel {
  stateOfResidence?: string
  fullAddress?: string
  profileUrl?: string
  profileStats?: IProfileStats
  sellerProfile?: ISellerProfile
}

export interface IProfileStats {
  followersCount: number | 0
  followingCount: number | 0
  postsCount: number | 0
  followingUsersCount?: number | 0
  followingSellersCount?: number | 0
  likesCount: number | 0
}

export interface IComment {
  id: string
  text: string
  authorId: string
  author?: IProfile
  postId: string
  createdAt: string
  _count?: { likes: number; replies: number }
}

export interface ICreateCommentData {
  text: string
  parentId?: string
}

export interface INotification {
  id: number
  userId: string
  type: NotificationType
  actorId?: string | null
  message: string
  postId?: string | null
  commentId?: string | null
  conversationId?: string | null
  orderId?: number | null
  productId?: number | null
  read: boolean
  created_at: string
  updated_at: string
  // Relations populated by server
  actor?: {
    id: string
    username: string
    avatar: string | null
  } | null
  product?: {
    id: number
    slug: string
    title: string
  } | null
  order?: {
    id: number
  } | null
  conversation?: {
    id: string
  } | null
}

export interface IConversation {
  id: string
  participant1Id: string
  participant2Id: string | null
  participant1?: {
    id: string
    username: string
    avatar?: string | null
    name?: string | null
  }
  participant2?: {
    id: string
    username: string
    avatar?: string | null
    name?: string | null
  } | null
  sellerId?: string | null
  created_at: string
  updated_at?: string | null
  // Normalized by client:
  otherUser?: {
    id: string
    username: string
    avatar?: string | null
    name?: string | null
  }
}

export interface IMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  sentAt: string
  sender?: { id: string; username: string; avatar?: string | null }
  /** Client-only delivery status for optimistic UI */
  status?: 'sending' | 'sent' | 'failed'
}

export interface IPaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface IPaginatedResponse<T> {
  data: T[]
  meta: IPaginationMeta
}

export interface IFollowResponse {
  items: {
    id: string
    username: string
    avatar: string | null
    bio?: string | null
    type: 'USER' | 'SELLER'
    followedAt: Date
    role?: string | undefined
    name?: string | null | undefined
    isVerified?: boolean | undefined
  }[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface IFollowStatus {
  isFollowing: boolean
  followedAt: Date | null
}

export interface IFollowStat {
  followersCount: number
  followingCount: number
  followingUsersCount: number
  followingSellersCount: number
}
