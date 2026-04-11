const storyInclude = {
  author: {
    select: { id: true, username: true, avatar: true },
  },
  media: {
    select: { id: true, url: true, type: true },
  },
  product: {
    select: { id: true, title: true, price: true, bannerImageUrl: true },
  },
}

export const storyRepository = {
  async createStory(authorId: string, mediaId: string, productId?: number) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    return prisma.story.create({
      data: {
        authorId,
        mediaId,
        expiresAt,
        ...(productId ? { productId } : {}),
      },
      include: storyInclude,
    })
  },

  async getActiveStories(limit = 50) {
    return prisma.story.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: storyInclude,
      orderBy: { created_at: 'desc' },
      take: limit,
    })
  },

  async getActiveStoriesForUser(userId: string, limit = 50) {
    // USER-type follows: followingId is a Profile.id
    const userFollows = await prisma.follow.findMany({
      where: { followerId: userId, followingType: 'USER' },
      select: { followingId: true },
    })
    // SELLER-type follows: followingId is SellerProfile.id — resolve to profileId
    const sellerFollows = await prisma.follow.findMany({
      where: { followerId: userId, followingType: 'SELLER' },
      select: { followingId: true },
    })
    const sellerProfileIds = sellerFollows.length
      ? (
          await prisma.sellerProfile.findMany({
            where: { id: { in: sellerFollows.map((f) => f.followingId) } },
            select: { profileId: true },
          })
        ).map((s) => s.profileId)
      : []

    const profileIds = [
      userId,
      ...userFollows.map((f) => f.followingId),
      ...sellerProfileIds,
    ]

    const stories = await prisma.story.findMany({
      where: { authorId: { in: profileIds }, expiresAt: { gt: new Date() } },
      include: storyInclude,
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    // No followed-user stories? Fall back to all active public stories
    if (!stories.length) {
      return prisma.story.findMany({
        where: { expiresAt: { gt: new Date() } },
        include: storyInclude,
        orderBy: { created_at: 'desc' },
        take: limit,
      })
    }

    return stories
  },

  async getMyStories(authorId: string) {
    return prisma.story.findMany({
      where: { authorId },
      include: storyInclude,
      orderBy: { created_at: 'desc' },
    })
  },

  async getStoryById(id: string) {
    return prisma.story.findUnique({ where: { id }, include: storyInclude })
  },

  async deleteStory(id: string) {
    return prisma.story.delete({ where: { id } })
  },

  async deleteExpiredStories() {
    return prisma.story.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    })
  },
}
