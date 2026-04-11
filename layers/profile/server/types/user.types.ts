// FILE PATH: server/layers/user/types/user.types.ts

/**
 * User Layer Types
 * Shared types for user, posts, follows, comments, etc.
 */

// ==================== ERRORS ====================

export class UserError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400,
  ) {
    super(message)
    this.name = 'UserError'
  }
}

// ==================== USER ====================

export interface User {
  id: string
  email: string
  username: string | null
  avatar: string | null
  bio: string | null
  role: string
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface PublicProfile {
  id: string
  username: string | null
  avatar: string | null
  bio: string | null
  created_at: Date
  followerCount: number
  followingCount: number
  postCount: number
  isVerified: boolean
}

export interface UserSettings {
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  private_profile: boolean
  two_factor_enabled: boolean
  language: string
  created_at: Date
  updated_at: Date
}

// ==================== POSTS ====================

export interface Post {
  id: string
  authorId: string
  caption: string | null
  mediaId: string
  created_at: Date
  updated_at: Date
  author?: User
  likes_count?: number
  comments_count?: number
  shares_count?: number
}

export interface PostWithDetails extends Post {
  author: User
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked: boolean
}

// ==================== COMMENTS ====================

export interface Comment {
  id: string
  text: string
  authorId: string
  postId: string | null
  parentId: string | null
  created_at: Date
  updated_at: Date
  author?: User
  likes_count?: number
  replies_count?: number
}

export interface CommentWithDetails extends Comment {
  author: User
  likesCount: number
  repliesCount: number
  isLiked: boolean
  replies?: CommentWithDetails[]
}

// ==================== LIKES ====================

export interface PostLike {
  userId: string
  postId: string
  created_at: Date
  user?: User
}

export interface CommentLike {
  userId: string
  commentId: string
  created_at: Date
  user?: User
}

// ==================== FOLLOWS ====================

export interface Follow {
  followerId: string
  followingId: string
  created_at: Date
  follower?: User
  following?: User
}

export interface FollowStatus {
  isFollowing: boolean
  followedAt?: Date
}

// ==================== STORIES ====================

export interface Story {
  id: string
  authorId: string
  mediaId: string
  expiresAt: Date
  created_at: Date
  author?: User
}

// ==================== SHARES ====================

export interface Share {
  id: number
  userId: string
  postId: string
  platform: string | null
  shareUrl: string | null
  created_at: Date
  user?: User
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: number
  userId: string
  message: string
  type: NotificationType
  read: boolean
  orderId: number | null
  productId: number | null
  actorId: string | null
  commentId: string | null
  postId: string | null
  created_at: Date
  updated_at: Date
  actor?: User
}

export enum NotificationType {
  POST_LIKE = 'POST_LIKE',
  POST_COMMENT = 'POST_COMMENT',
  COMMENT_LIKE = 'COMMENT_LIKE',
  USER_FOLLOW = 'USER_FOLLOW',
  POST_SHARE = 'POST_SHARE',
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  PRODUCT_AVAILABLE = 'PRODUCT_AVAILABLE',
}

// ==================== BLOCKS ====================

export interface Block {
  blockerId: string
  blockedId: string
  created_at: Date
}

// ==================== REPORTS ====================

export interface Report {
  id: string
  reporterId: string
  reportedId: string | null
  postId: string | null
  commentId: string | null
  reason: ReportReason
  description: string | null
  status: ReportStatus
  created_at: Date
  updated_at: Date
}

export enum ReportReason {
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  MISINFORMATION = 'MISINFORMATION',
  SPAM = 'SPAM',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  COPYRIGHT = 'COPYRIGHT',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

// ==================== API RESPONSES ====================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export interface SuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
  status: number
}
