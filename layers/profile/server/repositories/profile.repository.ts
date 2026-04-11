// server/layers/user/repositories/profile.repository.ts

/**
 * User Repository
 * Centralizes all user-related database operations.
 */

export const profileRepository = {
  // ============================================
  // READ OPERATIONS
  // ============================================

  async findById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
    })
  },

  async findByEmail(email: string) {
    return prisma.profile.findUnique({
      where: { email: email.toLowerCase() },
    })
  },

  async findByIdFull(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
        user_settings: true, // Added settings to full lookup
      },
    })
  },

  async findByUsername(username: string) {
    return prisma.profile.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
      include: {
        sellerProfile: true,
      },
    })
  },

  async getPublicProfile(userId: string) {
    return prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        created_at: true,
        sellerProfile: {
          select: {
            id: true,
            store_name: true,
            store_slug: true,
            is_verified: true,
          },
        },
        _count: {
          select: {
            posts: true,
            following: true,
          },
        },
      },
    })
  },

  /**
   * Get complete profile stats (posts, likes, followers, following)
   */
  async getCompleteProfileStats(userId: string) {
    const [
      postsCount,
      likesCount,
      followersCount,
      followingCount,
      followingUsersCount,
      followingSellersCount,
    ] = await Promise.all([
      // Posts count
      prisma.post.count({
        where: { authorId: userId },
      }),

      // Likes received on posts
      prisma.postLike.count({
        where: {
          post: {
            authorId: userId,
          },
        },
      }),

      // Followers count
      prisma.follow.count({
        where: { followingId: userId },
      }),

      // Following count (all)
      prisma.follow.count({
        where: { followerId: userId },
      }),

      // Following users only
      prisma.follow.count({
        where: {
          followerId: userId,
          followingType: 'USER',
        },
      }),

      // Following sellers only
      prisma.follow.count({
        where: {
          followerId: userId,
          followingType: 'SELLER',
        },
      }),
    ])

    return {
      postsCount,
      likesCount,
      followersCount,
      followingCount,
      followingUsersCount,
      followingSellersCount,
    }
  },

  // ============================================
  // WRITE OPERATIONS (ACCOUNT SECURITY)
  // ============================================

  /**
   * MISSING: Update Password
   */
  async updatePassword(userId: string, passwordHash: string) {
    return prisma.profile.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    })
  },

  /**
   * MISSING: Update Email
   */
  async updateEmail(userId: string, newEmail: string) {
    return prisma.profile.update({
      where: { id: userId },
      data: {
        email: newEmail.toLowerCase(),
        email_verified: false, // Security: Reset verification status
      },
    })
  },

  /**
   * Update User Profile
   */
  async updateProfile(userId: string, data: any) {
    return prisma.profile.update({
      where: { id: userId },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.links !== undefined && { links: data.links }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.dateOfBirth !== undefined && {
          date_of_birth: data.dateOfBirth,
        }),
      },
      include: {
        sellerProfile: true,
      },
    })
  },

  // ============================================
  // USER SETTINGS
  // ============================================

  async getOrCreateSettings(userId: string) {
    const settings = await prisma.userSettings.findUnique({
      where: { user_id: userId },
    })

    if (settings) return settings

    return prisma.userSettings.create({
      data: {
        user_id: userId,
        email_notifications: true,
        push_notifications: true,
        private_profile: false,
        two_factor_enabled: false,
        language: 'en',
      },
    })
  },

  async updateSettings(userId: string, data: any) {
    // Ensure settings exist first
    await this.getOrCreateSettings(userId)

    return prisma.userSettings.update({
      where: { user_id: userId },
      data: {
        ...(data.emailNotifications !== undefined && {
          email_notifications: data.emailNotifications,
        }),
        ...(data.pushNotifications !== undefined && {
          push_notifications: data.pushNotifications,
        }),
        ...(data.privateProfile !== undefined && {
          private_profile: data.privateProfile,
        }),
        ...(data.twoFactorEnabled !== undefined && {
          two_factor_enabled: data.twoFactorEnabled,
        }),
        ...(data.language !== undefined && { language: data.language }),
      },
    })
  },

  // ============================================
  // SEARCH & CHECKS
  // ============================================

  async checkEmailExists(
    email: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const where: any = { email: email.toLowerCase() }
    if (excludeUserId) {
      where.id = { not: excludeUserId }
    }
    const count = await prisma.profile.count({ where })
    return count > 0
  },

  async checkUsernameExists(
    username: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    const where: any = { username: { equals: username, mode: 'insensitive' } }
    if (excludeUserId) {
      where.id = { not: excludeUserId }
    }
    const count = await prisma.profile.count({ where })
    return count > 0
  },

  async searchUsers(query: string, limit: number = 20) {
    return prisma.profile.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
      },
      take: limit,
    })
  },

  // ============================================
  // ACCOUNT MANAGEMENT
  // ============================================

  /**
   * Delete Account (Cascading cleanup)
   */
  async deleteAccount(userId: string) {
    // 1. Delete sessions
    await prisma.session.deleteMany({ where: { userId } })

    // 2. Delete settings
    await prisma.userSettings
      .delete({ where: { user_id: userId } })
      .catch(() => null)

    // 3. Delete auth tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { user_id: userId },
    })
    await prisma.passwordResetToken.deleteMany({ where: { user_id: userId } })

    // 4. Finally delete profile
    return prisma.profile.delete({
      where: { id: userId },
    })
  },
}
