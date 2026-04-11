// FILE PATH: server/layers/user/repositories/content.repository.ts

// ── Shared select shapes ─────────────────────────────────────────────────────

/** Safe Profile fields — never expose password_hash, email, links, etc. */
const authorSelect = {
  id: true,
  username: true,
  avatar: true,
  role: true,
} as const

/** Shared post media select */
const mediaSelect = {
  id: true,
  url: true,
  type: true,
  isBgMusic: true,
  altText: true,
} as const

/** Shared post counts */
const postCounts = {
  _count: { select: { likes: true, comments: true, shares: true } },
} as const

// Shared include for tagged products with full product details
const taggedProductsInclude = {
  taggedProducts: {
    include: {
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          discount: true,
          slug: true,
          media: {
            take: 1,
            where: { isBgMusic: false },
            select: { url: true, type: true },
          },
        },
      },
    },
  },
}

/** Standard post include for feed/list views */
const postInclude = {
  author: { select: authorSelect },
  media: { select: mediaSelect },
  ...postCounts,
  ...taggedProductsInclude,
} as const

export const postRepository = {
  async getUserByUsername(username: string) {
    return await prisma.profile.findFirst({ where: { username } })
  },

  // ========== POSTS ==========
  async createPost(userId: string, data: any) {
    const postData: any = {
      id: crypto.randomUUID(),
      authorId: userId,
      caption: data.caption,
      content: data.content,
      visibility: data.visibility || 'PUBLIC',
      contentType: data.contentType || 'COMMERCE',
    }

    if (data.allowComments !== undefined) {
      postData.allowComments = data.allowComments
    }

    if (data.taggedProducts && data.taggedProducts.length > 0) {
      postData.taggedProducts = {
        create: data.taggedProducts.map((id: number) => ({
          productId: Number(id),
        })),
      }
    }

    const mediaCreates: any[] = []

    if (data.mediaData && data.mediaData.length > 0) {
      for (const m of data.mediaData) {
        mediaCreates.push({
          url: m.url,
          public_id: m.public_id,
          type: m.type,
          authorId: userId,
          isBgMusic: false,
        })
      }
    }

    if (data.musicData) {
      mediaCreates.push({
        url: data.musicData.url,
        public_id: data.musicData.public_id,
        type: 'AUDIO',
        authorId: userId,
        isBgMusic: true,
        altText: data.musicData.name ?? null,
      })
    }

    if (mediaCreates.length > 0) {
      postData.media = { create: mediaCreates }
    }

    return await prisma.post.create({
      data: postData,
      include: postInclude,
    })
  },

  async getPostById(postId: string) {
    return await prisma.post.findUnique({
      where: { id: postId },
      include: postInclude,
    })
  },

  async getPostsByUserId(
    userId: string,
    limit: number,
    offset: number,
    visibilityFilter?: any,
  ) {
    return await prisma.post.findMany({
      where: { authorId: userId, ...visibilityFilter },
      include: postInclude,
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getPostCountByUserId(userId: string, visibilityFilter?: any) {
    return await prisma.post.count({
      where: { authorId: userId, ...visibilityFilter },
    })
  },

  async updatePost(postId: string, data: any) {
    return await prisma.post.update({
      where: { id: postId },
      data,
      include: { author: { select: authorSelect } },
    })
  },

  async getPosts(options: {
    take?: number
    skip?: number
    where?: any
    orderBy?: any
  }) {
    return await prisma.post.findMany({
      take: options.take,
      skip: options.skip,
      where: options.where,
      orderBy: options.orderBy,
      include: postInclude,
    })
  },

  async getPostsByAuthorIds(authorIds: string[], options: any) {
    return await prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      take: options.limit,
      skip: options.offset,
      orderBy: { created_at: 'desc' },
      include: postInclude,
    })
  },

  async deletePost(postId: string) {
    return await prisma.post.delete({ where: { id: postId } })
  },

  async count() {
    return await prisma.post.count()
  },

  // ========== COMMENTS ==========
  async createComment(userId: string, postId: string, data: any) {
    return await prisma.comment.create({
      data: { id: crypto.randomUUID(), authorId: userId, postId, ...data },
      include: { author: { select: authorSelect } },
    })
  },

  async getCommentById(commentId: string) {
    return await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: { select: authorSelect } },
    })
  },

  async getCommentsByPostId(postId: string, limit: number, offset: number) {
    return await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        author: { select: authorSelect },
        replies: {
          include: { author: { select: authorSelect } },
          orderBy: { created_at: 'asc' },
          take: 3,
        },
        _count: { select: { replies: true, likes: true } },
      },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getCommentCountByPostId(postId: string) {
    return await prisma.comment.count({ where: { postId } })
  },

  async updateComment(commentId: string, data: any) {
    return await prisma.comment.update({
      where: { id: commentId },
      data,
      include: { author: { select: authorSelect } },
    })
  },

  async deleteComment(commentId: string) {
    return await prisma.comment.delete({ where: { id: commentId } })
  },

  async getCommentReplies(commentId: string, limit: number, offset: number) {
    return await prisma.comment.findMany({
      where: { parentId: commentId },
      include: { author: { select: authorSelect } },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'asc' },
    })
  },

  async getCommentRepliesCount(commentId: string) {
    return await prisma.comment.count({ where: { parentId: commentId } })
  },

  // ========== POST LIKES ==========
  async createPostLike(userId: string, postId: string) {
    return await prisma.postLike.create({ data: { userId, postId } })
  },

  async getPostLike(userId: string, postId: string) {
    return await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    })
  },

  async deletePostLike(userId: string, postId: string) {
    return await prisma.postLike.deleteMany({ where: { userId, postId } })
  },

  async getPostLikes(postId: string, limit: number, offset: number) {
    return await prisma.postLike.findMany({
      where: { postId },
      include: { user: { select: authorSelect } },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getPostLikesCount(postId: string) {
    return await prisma.postLike.count({ where: { postId } })
  },

  async getLikedPostsByUser(userId: string, limit: number, offset: number) {
    return await prisma.postLike.findMany({
      where: { userId },
      include: { post: { include: postInclude } },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getLikedPostsCountByUser(userId: string) {
    return await prisma.postLike.count({ where: { userId } })
  },

  // ========== COMMENT LIKES ==========
  async createCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.create({ data: { userId, commentId } })
  },

  async getCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    })
  },

  async deleteCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.deleteMany({ where: { userId, commentId } })
  },

  // ========== SHARES ==========
  async createShare(
    userId: string,
    targetId: string,
    type: 'POST' | 'PRODUCT',
    platform?: string,
  ) {
    return await prisma.share.create({
      data: {
        userId,
        postId: type === 'POST' ? targetId : null,
        productId: type === 'PRODUCT' ? parseInt(targetId) : null,
        platform: platform || 'internal',
      },
    })
  },

  async getPostShares(id: any, limit: number, offset: number) {
    return await prisma.share.findMany({
      where: { id },
      include: { profile: { select: authorSelect } },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getPostSharesCount(id: any) {
    return await prisma.share.count({ where: { id } })
  },

  async getSharesByUserId(userId: string, limit: number, offset: number) {
    return await prisma.share.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async getSharesCountByUserId(userId: string) {
    return await prisma.share.count({ where: { userId } })
  },

  async savePost(userId: string, postId: string) {
    const existing = await prisma.savedPost.findFirst({
      where: { userId, postId },
    })
    if (existing) return existing
    return await prisma.savedPost.create({ data: { userId, postId } })
  },

  async unsavePost(userId: string, postId: string) {
    return await prisma.savedPost.deleteMany({ where: { userId, postId } })
  },

  async getSavedPost(userId: string, postId: string) {
    return await prisma.savedPost.findFirst({
      where: { userId, postId },
      include: {
        post: {
          include: {
            media: { select: mediaSelect },
            author: { select: authorSelect },
            ...postCounts,
          },
        },
      },
    })
  },

  async getSavedPosts(userId: string, limit: number, offset: number) {
    return await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            media: { select: mediaSelect },
            author: { select: authorSelect },
            ...postCounts,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
  },
}
