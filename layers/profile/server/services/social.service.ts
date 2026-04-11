// FILE PATH: server/layers/user/services/social.service.ts

import { UserError } from '../types/user.types'
import { socialRepository } from '../repositories/social.repository'
import { sellerRepository } from '~~/layers/seller/server/repositories/seller.repository'
import { auditQueue } from '~~/server/queues/audit.queue'
import { notificationQueue } from '~~/server/queues/notification.queue'


export const socialService = {
  // ==================== FOLLOW USER ====================

  async followUser(
    userId: string,
    targetUsername: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const target = await socialRepository.getUserByUsername(targetUsername)

    if (!target) {
      throw new UserError(
        'USER_NOT_FOUND',
        `User @${targetUsername} not found`,
        404,
      )
    }

    if (userId === target.id) {
      throw new UserError('INVALID_ACTION', 'You cannot follow yourself', 400)
    }

    const existing = await socialRepository.getFollow(userId, target.id, 'USER')
    if (existing) {
      throw new UserError(
        'ALREADY_FOLLOWING',
        'Already following this user',
        400,
      )
    }

    const follow = await socialRepository.createFollow(
      userId,
      target.id,
      'USER',
    )

    auditQueue.enqueue({
      userId,
      action: 'USER_FOLLOWED',
      resource: 'Follow',
      resourceId: target.id,
      reason: `Started following user @${targetUsername}`,
      changes: { targetUsername },
      ipAddress,
      userAgent,
    })

    notificationQueue.enqueue({
      userId: target.id,
      type: 'FOLLOW',
      actorId: userId,
      message: `Someone started following you`,
    })

    return follow
  },

  // ==================== FOLLOW SELLER ====================

  async followSeller(
    userId: string,
    storeSlug: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const seller = await socialRepository.getSellerByUsername(storeSlug)

    if (!seller) {
      throw new UserError(
        'SELLER_NOT_FOUND',
        `Store @${storeSlug} not found`,
        404,
      )
    }

    const existing = await socialRepository.getFollow(
      userId,
      seller.id,
      'SELLER',
    )
    if (existing) {
      throw new UserError(
        'ALREADY_FOLLOWING',
        'Already following this store',
        400,
      )
    }

    const follow = await socialRepository.createFollow(
      userId,
      seller.id,
      'SELLER',
    )

    // Update denormalized counter (non-blocking)
    sellerRepository.incrementFollowers(seller.id).catch(() => {})

    auditQueue.enqueue({
      userId,
      action: 'SELLER_FOLLOWED',
      resource: 'Follow',
      resourceId: seller.id,
      reason: `Started following store @${storeSlug}`,
      changes: { storeSlug },
      ipAddress,
      userAgent,
    })

    notificationQueue.enqueue({
      userId: seller.profileId,
      type: 'FOLLOW',
      actorId: userId,
      message: `Someone started following your store`,
    })

    return follow
  },

  // ==================== UNFOLLOW ====================

  async unfollowUser(
    userId: string,
    targetUsername: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const target = await socialRepository.getUserByUsername(targetUsername)
    if (!target) {
      throw new UserError(
        'USER_NOT_FOUND',
        `User @${targetUsername} not found`,
        404,
      )
    }

    await socialRepository.deleteFollow(userId, target.id, 'USER')

    auditQueue.enqueue({
      userId,
      action: 'USER_UNFOLLOWED',
      resource: 'Follow',
      resourceId: target.id,
      reason: `Unfollowed user @${targetUsername}`,
      ipAddress,
      userAgent,
    })

    return { message: 'Unfollowed successfully' }
  },

  async unfollowSeller(
    userId: string,
    storeSlug: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const seller = await socialRepository.getSellerByUsername(storeSlug)
    if (!seller) {
      throw new UserError(
        'SELLER_NOT_FOUND',
        `Store @${storeSlug} not found`,
        404,
      )
    }

    await socialRepository.deleteFollow(userId, seller.id, 'SELLER')

    // Update denormalized counter (non-blocking)
    sellerRepository.decrementFollowers(seller.id).catch(() => {})

    auditQueue.enqueue({
      userId,
      action: 'SELLER_UNFOLLOWED',
      resource: 'Follow',
      resourceId: seller.id,
      reason: `Unfollowed store @${storeSlug}`,
      ipAddress,
      userAgent,
    })

    return { message: 'Unfollowed store successfully' }
  },

  // ==================== GET FOLLOW STATUS ====================

  async getFollowStatus(
    userId: string,
    targetUsername: string,
    followingType: 'USER' | 'SELLER' = 'USER',
  ) {
    let targetId: string

    if (followingType === 'USER') {
      const user = await socialRepository.getUserByUsername(targetUsername)
      if (!user) {
        throw new UserError(
          'USER_NOT_FOUND',
          `User @${targetUsername} not found`,
          404,
        )
      }
      targetId = user.id
    } else {
      const seller = await socialRepository.getSellerByUsername(targetUsername)
      if (!seller) {
        throw new UserError(
          'SELLER_NOT_FOUND',
          `Store @${targetUsername} not found`,
          404,
        )
      }
      targetId = seller.id
    }

    const follow = await socialRepository.getFollow(
      userId,
      targetId,
      followingType,
    )

    return {
      isFollowing: !!follow,
      followedAt: follow?.created_at || null,
    }
  },

  // ==================== GET FOLLOWERS/FOLLOWING ====================

  /**
   * Get my followers
   * Uses getFollowStats for accurate count
   */
  async getMyFollowers(userId: string, limit = 20, offset = 0) {
    const [items, stats] = await Promise.all([
      socialRepository.getFollowers({ userId, limit, offset }),
      socialRepository.getFollowStats(userId),
    ])

    return {
      items,
      meta: {
        total: stats.followersCount, // ✅ From stats
        limit,
        offset,
        hasMore: offset + items.length < stats.followersCount,
      },
    }
  },

  /**
   * Get people/sellers I'm following
   * Uses getFollowStats for accurate count
   */
  async getMyFollowing(userId: string, limit = 20, offset = 0) {
    const [items, stats] = await Promise.all([
      socialRepository.getFollowing({ userId, limit, offset }),
      socialRepository.getFollowStats(userId),
    ])

    return {
      items,
      meta: {
        total: stats.followingCount, // ✅ From stats
        limit,
        offset,
        hasMore: offset + items.length < stats.followingCount,
      },
    }
  },

  /**
   * Get public user's followers
   */
  async getUserFollowers(username: string, limit = 20, offset = 0) {
    const user = await socialRepository.getUserByUsername(username)
    if (!user) {
      throw new UserError('USER_NOT_FOUND', `User @${username} not found`, 404)
    }

    const [items, stats] = await Promise.all([
      socialRepository.getFollowers({ userId: user.id, limit, offset }),
      socialRepository.getFollowStats(user.id),
    ])

    return {
      items,
      meta: {
        total: stats.followersCount, // ✅ From stats
        limit,
        offset,
        hasMore: offset + items.length < stats.followersCount,
      },
    }
  },

  /**
   * Get public user's following
   */
  async getUserFollowing(username: string, limit = 20, offset = 0) {
    const user = await socialRepository.getUserByUsername(username)
    if (!user) {
      throw new UserError('USER_NOT_FOUND', `User @${username} not found`, 404)
    }

    const [items, stats] = await Promise.all([
      socialRepository.getFollowing({ userId: user.id, limit, offset }),
      socialRepository.getFollowStats(user.id),
    ])

    return {
      items,
      meta: {
        total: stats.followingCount, // ✅ From stats
        limit,
        offset,
        hasMore: offset + items.length < stats.followingCount,
      },
    }
  },

  // ==================== STATS & SUGGESTIONS ====================

  /**
   * Get follow stats for a user
   * Returns all counts in one query
   */
  async getFollowStats(userId: string) {
    return await socialRepository.getFollowStats(userId)
  },

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(userId: string, limit = 10) {
    return await socialRepository.getSuggestedUsers(userId, limit)
  },

  /**
   * Check if user is following multiple users/sellers
   * Returns a Set of following IDs
   */
  async checkFollowingBatch(
    userId: string,
    targetIds: string[],
    followingType: 'USER' | 'SELLER' = 'USER',
  ) {
    return await socialRepository.checkFollowingBatch(
      userId,
      targetIds,
      followingType,
    )
  },
}
