// server/layers/user/repositories/social.repository.ts

import { IProfile } from '~~/layers/profile/app/types/profile.types'
import { ISellerProfile } from '~~/layers/seller/app/types/seller.types'
export const socialRepository = {
  // ==================== PROFILE LOOKUPS ====================

  async getUserByUsername(username: string) {
    return await prisma.profile.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        created_at: true,
        email: true,
        role: true,
      },
    })
  },

  async getSellerByUsername(storeSlug: string) {
    return await prisma.sellerProfile.findFirst({
      where: { store_slug: { equals: storeSlug, mode: 'insensitive' } },
      select: {
        id: true,
        store_slug: true,
        store_name: true,
        store_logo: true,
        store_description: true,
        profileId: true,
        created_at: true,
        is_verified: true,
      },
    })
  },

  // ==================== FOLLOW CRUD ====================

  async createFollow(
    followerId: string,
    followingId: string,
    followingType: 'USER' | 'SELLER' = 'USER',
  ) {
    return await prisma.follow.create({
      data: { followerId, followingId, followingType },
    })
  },

  async getFollow(
    followerId: string,
    followingId: string,
    followingType: 'USER' | 'SELLER' = 'USER',
  ) {
    return await prisma.follow.findUnique({
      where: {
        followerId_followingId_followingType: {
          followerId,
          followingId,
          followingType,
        },
      },
    })
  },

  async deleteFollow(
    followerId: string,
    followingId: string,
    followingType: 'USER' | 'SELLER' = 'USER',
  ) {
    return await prisma.follow.deleteMany({
      where: { followerId, followingId, followingType },
    })
  },

  // ==================== LIST OPERATIONS ====================

  /**
   * Get people who follow me
   */
  async getFollowers(options: {
    userId: string
    limit?: number
    offset?: number
  }) {
    const { userId, limit = 20, offset = 0 } = options

    const follows = await prisma.follow.findMany({
      where: { followingId: userId },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            role: true,
          },
        },
      },
    })

    return follows.map(
      (f: {
        follower: { id: any; username: any; avatar: any; bio: any; role: any }
        created_at: any
      }) => ({
        id: f.follower.id,
        username: f.follower.username,
        avatar: f.follower.avatar,
        bio: f.follower.bio,
        role: f.follower.role,
        followedAt: f.created_at,
        type: 'USER' as const, // Followers are always Profiles/Users
      }),
    )
  },

  /**
   * Get people and stores I am following
   */
  async getFollowing(options: {
    userId: string
    limit?: number
    offset?: number
  }) {
    const { userId, limit = 20, offset = 0 } = options

    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })

    const userIds = follows
      .filter((f: { followingType: string }) => f.followingType === 'USER')
      .map((f: { followingId: any }) => f.followingId)

    const sellerIds = follows
      .filter((f: { followingType: string }) => f.followingType === 'SELLER')
      .map((f: { followingId: any }) => f.followingId)

    // Fetch profiles with explicit select
    const [users, sellers] = await Promise.all([
      userIds.length
        ? prisma.profile.findMany({
            where: { id: { in: userIds } },
            select: {
              id: true,
              username: true,
              avatar: true,
              bio: true,
              role: true,
            },
          })
        : [],
      sellerIds.length
        ? prisma.sellerProfile.findMany({
            where: { id: { in: sellerIds } },
            select: {
              id: true,
              store_slug: true,
              store_name: true,
              store_logo: true,
              store_description: true,
              is_verified: true,
            },
          })
        : [],
    ])

    const userMap = new Map<string, IProfile>(users.map((u: any) => [u.id, u]))
    const sellerMap = new Map<string, ISellerProfile>(
      sellers.map((s: any) => [s.id, s]),
    )

    // Map with proper type checking
    return follows
      .map(
        (f: {
          followingType: string
          followingId: string
          created_at: any
        }) => {
          if (f.followingType === 'USER') {
            const user = userMap.get(f.followingId)
            if (!user) return null

            return {
              id: user.id,
              username: user.username,
              avatar: user.avatar,
              bio: user.bio,
              role: user.role,
              type: 'USER' as const,
              followedAt: f.created_at,
            }
          } else {
            const seller = sellerMap.get(f.followingId)
            if (!seller) return null

            return {
              id: seller.id,
              username: seller.store_slug,
              name: seller.store_name,
              avatar: seller.store_logo,
              bio: seller.store_description,
              isVerified: seller.is_verified,
              type: 'SELLER' as const,
              followedAt: f.created_at,
            }
          }
        },
      )
      .filter(Boolean) as Array<{
      id: string
      username: string
      avatar: string | null
      bio: string | null
      type: 'USER' | 'SELLER'
      followedAt: Date
      role?: string
      name?: string | null
      isVerified?: boolean
    }>
  },

  // ==================== STATS & BATCH ====================

  async getFollowStats(userId: string) {
    const [followers, following, users, sellers] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.follow.count({
        where: { followerId: userId, followingType: 'USER' },
      }),
      prisma.follow.count({
        where: { followerId: userId, followingType: 'SELLER' },
      }),
    ])

    return {
      followersCount: followers,
      followingCount: following,
      followingUsersCount: users,
      followingSellersCount: sellers,
    }
  },

  /**
   * Check if user is following multiple users/sellers
   */
  async checkFollowingBatch(
    userId: string,
    targetIds: string[],
    followingType: 'USER' | 'SELLER' = 'USER',
  ) {
    if (targetIds.length === 0) {
      return new Set<string>()
    }

    const follows = await prisma.follow.findMany({
      where: {
        followerId: userId,
        followingId: { in: targetIds },
        followingType,
      },
      select: { followingId: true },
    })

    return new Set(follows.map((f: { followingId: any }) => f.followingId))
  },

  // ==================== SUGGESTIONS ====================

  /**
   * Get suggested users to follow
   * Based on popular users you don't already follow
   */
  async getSuggestedUsers(userId: string, limit = 10) {
    // Get popular users
    const popular = await prisma.follow.groupBy({
      by: ['followingId'],
      where: {
        followingType: 'USER',
        followingId: { not: userId },
      },
      _count: { followerId: true },
      orderBy: { _count: { followerId: 'desc' } },
      take: limit * 2, // Fetch more to filter out already followed
    })

    // Get who I'm already following
    const alreadyFollowing = await prisma.follow.findMany({
      where: { followerId: userId, followingType: 'USER' },
      select: { followingId: true },
    })

    const followingSet = new Set(
      alreadyFollowing.map((f: { followingId: any }) => f.followingId),
    )

    // Filter out already followed and limit
    const suggestedIds = popular
      .map((p: { followingId: any }) => p.followingId)
      .filter((id: unknown) => !followingSet.has(id))
      .slice(0, limit)

    if (suggestedIds.length === 0) {
      return []
    }

    return prisma.profile.findMany({
      where: { id: { in: suggestedIds } },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
      },
    })
  },

  /**
   * Get popular users (most followers)
   */
  async getPopularUsers(limit = 10) {
    const popularFollows = await prisma.follow.groupBy({
      by: ['followingId'],
      where: {
        followingType: 'USER',
      },
      _count: {
        followerId: true,
      },
      orderBy: {
        _count: {
          followerId: 'desc',
        },
      },
      take: limit,
    })

    const popularIds = popularFollows.map(
      (f: { followingId: any }) => f.followingId,
    )

    if (popularIds.length === 0) {
      return []
    }

    // Fetch profiles
    const profiles = await prisma.profile.findMany({
      where: { id: { in: popularIds } },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
      },
    })

    // Optionally add follower counts
    // Map to maintain order and add counts
    const profileMap = new Map(profiles.map((p: { id: any }) => [p.id, p]))

    return popularFollows
      .map((pf: { followingId: unknown; _count: { followerId: any } }) => {
        const profile = profileMap.get(pf.followingId)
        return profile
          ? {
              ...profile,
              followersCount: pf._count.followerId,
            }
          : null
      })
      .filter(Boolean) as Array<{
      id: string
      username: string
      avatar: string | null
      bio: string | null
      role: string
      followersCount: number
    }>
  },
}
