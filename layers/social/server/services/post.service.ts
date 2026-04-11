// FILE PATH: server/layers/user/services/content.service.ts

/**
 * Content Service
 * Handles: Posts, Comments, Likes, Shares
 */

import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditQueue } from '~~/server/queues/audit.queue'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { postRepository } from '../repositories/post.repository'
import { createPostSchema, updatePostSchema } from '../schemas/post.schema'


export const contentService = {
  // ==================== POSTS ====================

  async createPost(
    userId: string,
    data: any,
    ipAddress: string,
    userAgent: string,
  ) {
    const validated = createPostSchema.parse(data)
    const post = await postRepository.createPost(userId, validated)

    auditQueue.enqueue({
      userId,
      action: 'POST_CREATED',
      resource: 'Post',
      resourceId: post.id,
      reason: 'Created new post',
      changes: { caption: validated.caption, contentType: validated.contentType },
      ipAddress,
      userAgent,
    })

    return post
  },

  async getMyPosts(userId: string, limit = 20, offset = 0) {
    const posts = await postRepository.getPostsByUserId(userId, limit, offset)
    const total = await postRepository.getPostCountByUserId(userId)
    return { posts, total, limit, offset }
  },

  async getUserPosts(
    username: string,
    limit = 20,
    offset = 0,
    viewerId?: string,
  ) {
    const user = await postRepository.getUserByUsername(username)
    if (!user)
      throw new UserError('USER_NOT_FOUND', `User @${username} not found`, 404)

    // Visibility: owner sees all posts; everyone else sees only PUBLIC
    const isOwner = !!viewerId && viewerId === user.id
    const visibilityFilter = isOwner ? undefined : { visibility: 'PUBLIC' }

    const [posts, total] = await Promise.all([
      postRepository.getPostsByUserId(user.id, limit, offset, visibilityFilter),
      postRepository.getPostCountByUserId(user.id, visibilityFilter),
    ])
    return { posts, total, limit, offset }
  },

  async getPosts(limit = 20, offset = 0) {
    const posts = await postRepository.getPosts({
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
      include: { author: true, media: true },
    })
    return { posts, total: posts.length, limit, offset }
  },

  async getPostById(postId: string) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)
    return post
  },

  async updatePost(
    userId: string,
    postId: string,
    data: { caption?: string },
    ipAddress: string,
    userAgent: string,
  ) {
    const validated = updatePostSchema.parse(data)

    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)
    if (post.authorId !== userId)
      throw new UserError('FORBIDDEN', 'You can only edit your own posts', 403)

    const updated = await postRepository.updatePost(postId, validated)
    auditQueue.enqueue({
      userId,
      action: 'POST_UPDATED',
      resource: 'Post',
      resourceId: postId,
      reason: 'updated post',
      changes: data,
      ipAddress,
      userAgent,
    })
    return updated
  },

  async getSavedPost(postId: string) {
    const post = await postRepository.getSavedPost(postId)
    return { post }
  },
  async getSavedPosts(userId: string, limit = 20, offset = 0) {
    const posts = await postRepository.getSavedPosts(userId, limit, offset)
    return { posts, total: posts.length, limit, offset }
  },

  async deletePost(
    userId: string,
    postId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)
    if (post.authorId !== userId)
      throw new UserError(
        'FORBIDDEN',
        'You can only delete your own posts',
        403,
      )

    await postRepository.deletePost(postId)
    auditQueue.enqueue({
      userId,
      action: 'POST_DELETED',
      resource: 'Post',
      resourceId: postId,
      reason: 'deleted post',
      ipAddress,
      userAgent,
    })
    return { message: 'Post deleted successfully' }
  },

  async savePost(
    userId: string,
    postId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)
    // savePost handles idempotency internally (findFirst + create)
    const saved = await postRepository.savePost(userId, postId)
    auditQueue.enqueue({
      userId,
      action: 'POST_SAVED',
      resource: 'Post',
      resourceId: postId,
      ipAddress,
      userAgent,
    })
    return saved
  },
  async unSavePost(
    userId: string,
    postId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)
    const saved = await postRepository.unsavePost(userId, postId)
    auditQueue.enqueue({
      userId,
      action: 'SAVE_POST_DELETED',
      resource: 'Post',
      resourceId: postId,
      ipAddress,
      userAgent,
    })
    return saved
  },

  // ==================== COMMENTS ====================

  async createComment(
    userId: string,
    postId: string,
    data: { text: string; parentId?: string },
    ipAddress: string,
    userAgent: string,
  ) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

    if (data.parentId) {
      const parent = await postRepository.getCommentById(data.parentId)
      if (!parent)
        throw new UserError(
          'COMMENT_NOT_FOUND',
          'Parent comment not found',
          404,
        )
    }

    const comment = await postRepository.createComment(userId, postId, data)
    auditQueue.enqueue({
      userId,
      action: 'COMMENT_CREATED',
      resource: 'Comment',
      resourceId: comment.id,
      reason: 'Created new comment',
      changes: { text: data.text },
      ipAddress,
      userAgent,
    })

    notificationQueue.enqueue({
      userId: post.authorId,
      type: 'POST_COMMENT',
      actorId: userId,
      postId: postId,
      message: `Someone commented on your post`,
    })

    return comment
  },

  async getPostComments(postId: string, limit = 20, offset = 0) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

    const comments = await postRepository.getCommentsByPostId(
      postId,
      limit,
      offset,
    )
    const total = await postRepository.getCommentCountByPostId(postId)
    return { comments, total, limit, offset }
  },

  async updateComment(
    userId: string,
    commentId: string,
    data: { text: string },
    ipAddress: string,
    userAgent: string,
  ) {
    const comment = await postRepository.getCommentById(commentId)
    if (!comment)
      throw new UserError('COMMENT_NOT_FOUND', 'Comment not found', 404)
    if (comment.authorId !== userId)
      throw new UserError(
        'FORBIDDEN',
        'You can only edit your own comments',
        403,
      )

    const updated = await postRepository.updateComment(commentId, data)
    auditQueue.enqueue({
      userId,
      action: 'COMMENT_UPDATED',
      resource: 'Comment',
      resourceId: commentId,
      reason: 'updated comment',
      changes: data,
      ipAddress,
      userAgent,
    })
    return updated
  },

  async deleteComment(
    userId: string,
    commentId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const comment = await postRepository.getCommentById(commentId)
    if (!comment)
      throw new UserError('COMMENT_NOT_FOUND', 'Comment not found', 404)
    if (comment.authorId !== userId)
      throw new UserError(
        'FORBIDDEN',
        'You can only delete your own comments',
        403,
      )

    await postRepository.deleteComment(commentId)
    auditQueue.enqueue({
      userId,
      action: 'COMMENT_DELETED',
      resource: 'Comment',
      resourceId: commentId,
      ipAddress,
      userAgent,
    })
    return { message: 'Comment deleted successfully' }
  },

  // ==================== LIKES ====================

  async likePost(
    userId: string,
    postId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

    const existing = await postRepository.getPostLike(userId, postId)
    if (existing)
      throw new UserError('ALREADY_LIKED', 'Already liked this post', 400)

    const like = await postRepository.createPostLike(userId, postId)
    auditQueue.enqueue({
      userId,
      action: 'POST_LIKED',
      resource: 'Post',
      resourceId: postId,
      ipAddress,
      userAgent,
    })

    notificationQueue.enqueue({
      userId: post.authorId,
      type: 'POST_LIKE',
      actorId: userId,
      postId: postId,
      message: `Someone liked your post`,
    })

    return like
  },

  async unlikePost(
    userId: string,
    postId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

    await postRepository.deletePostLike(userId, postId)
    auditQueue.enqueue({
      userId,
      action: 'POST_UNLIKED',
      resource: 'Post',
      resourceId: postId,
      ipAddress,
      userAgent,
    })
    return { message: 'Unliked post successfully' }
  },

  async getPostLikes(postId: string, limit = 20, offset = 0) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

    const likes = await postRepository.getPostLikes(postId, limit, offset)
    const total = await postRepository.getPostLikesCount(postId)
    return { likes, total, limit, offset }
  },

  async getMyLikedPosts(userId: string, limit = 20, offset = 0) {
    const posts = await postRepository.getLikedPostsByUser(
      userId,
      limit,
      offset,
    )
    const total = await postRepository.getLikedPostsCountByUser(userId)
    return { posts, total, limit, offset }
  },

  async likeComment(
    userId: string,
    commentId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const comment = await postRepository.getCommentById(commentId)
    if (!comment)
      throw new UserError('COMMENT_NOT_FOUND', 'Comment not found', 404)

    const existing = await postRepository.getCommentLike(userId, commentId)
    if (existing)
      throw new UserError('ALREADY_LIKED', 'Already liked this comment', 400)

    const like = await postRepository.createCommentLike(userId, commentId)
    auditQueue.enqueue({
      userId,
      action: 'COMMENT_LIKED',
      resource: 'Comment',
      resourceId: commentId,
      ipAddress,
      userAgent,
    })

    notificationQueue.enqueue({
      userId: comment.authorId,
      type: 'COMMENT_LIKE',
      actorId: userId,
      commentId: commentId,
      message: `Someone liked your comment`,
    })

    return like
  },

  async unlikeComment(
    userId: string,
    commentId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const comment = await postRepository.getCommentById(commentId)
    if (!comment)
      throw new UserError('COMMENT_NOT_FOUND', 'Comment not found', 404)

    await postRepository.deleteCommentLike(userId, commentId)
    auditQueue.enqueue({
      userId,
      action: 'COMMENT_UNLIKED',
      resource: 'Comment',
      resourceId: commentId,
      ipAddress,
      userAgent,
    })
    return { message: 'Unliked comment successfully' }
  },

  // ==================== SHARES ====================

  async sharePost(
    userId: string,
    postId: string,
    data: { platform?: string },
    ipAddress: string,
    userAgent: string,
  ) {
    // 1. Verify post exists
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

    // 2. Create the share record
    const share = await postRepository.createShare(
      userId,
      postId,
      'POST',
      data.platform,
    )

    // 3. ALIGNED: Audit Log (Object Pattern)
    auditQueue.enqueue({
      userId,
      action: 'POST_SHARED',
      resource: 'Post',
      resourceId: postId,
      reason: `Shared post to ${data.platform || 'internal'}`,
      changes: { platform: data.platform },
      ipAddress,
      userAgent,
    })

    // 4. ALIGNED: Notification (Object Pattern)
    // Only notify if someone else shares the post
    if (post.authorId !== userId) {
      notificationQueue.enqueue({
        userId: post.authorId,
        type: 'POST_SHARE', // Maps to PRODUCT_SHARE or GENERAL in your typeMap
        actorId: userId,
        postId: postId,
        message: `Someone shared your post`,
      })
    }

    return share
  },

  async getPostShares(postId: string, limit = 20, offset = 0) {
    const post = await postRepository.getPostById(postId)
    if (!post) throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

    const shares = await postRepository.getPostShares(postId, limit, offset)
    const total = await postRepository.getPostSharesCount(postId)
    return { shares, total, limit, offset }
  },

  async getMyShares(userId: string, limit = 20, offset = 0) {
    const shares = await postRepository.getSharesByUserId(userId, limit, offset)
    const total = await postRepository.getSharesCountByUserId(userId)
    return { shares, total, limit, offset }
  },
}
