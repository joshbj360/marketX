import { usePostApi } from '../services/post.api'
import { usePostStore } from '../store/post.store'
import { useProfileStore } from '../../../profile/app/stores/profile.store'
import type { ICreatePostData, IPost } from '../types/post.types'
import type { IFeedItem } from '../../../feed/app/types/feed.types'

/**
 * Normalize an IPost (from profile/user API) into IFeedItem shape.
 * IPost has media as an array; IFeedItem has a single media object.
 * All components that open PostDetailModal must use IFeedItem.
 */
export function normalizePost(post: IPost | any): IFeedItem {
  const mediaArr = Array.isArray(post.media)
    ? post.media
    : post.media
      ? [post.media]
      : []
  const contentMedia = mediaArr.filter((m: any) => !m.isBgMusic)
  const bgMusicRaw = mediaArr.find((m: any) => m.isBgMusic)
  const rawMedia = contentMedia[0] ?? null

  return {
    id: post.id,
    type: 'POST',
    created_at: post.created_at ?? post.createdAt ?? new Date(),
    author: {
      id: post.author?.id ?? post.authorId ?? '',
      username: post.author?.username ?? '',
      avatar: post.author?.avatar ?? null,
      role: ((post.author?.role ?? 'USER') as string).toLowerCase() as
        | 'user'
        | 'seller',
    },
    media: rawMedia
      ? {
          id: rawMedia.id,
          url: rawMedia.url,
          type: rawMedia.type,
          thumbnailUrl: rawMedia.thumbnailUrl,
        }
      : undefined,
    mediaItems: contentMedia.map((m: any) => ({
      id: m.id,
      url: m.url,
      type: m.type,
    })),
    bgMusic: bgMusicRaw
      ? { id: bgMusicRaw.id, url: bgMusicRaw.url }
      : undefined,
    caption: post.caption ?? '',
    content: post.content ?? null,
    contentType: post.contentType ?? 'EXPERIENCE',
    likeCount: post._count?.likes ?? post.likeCount ?? 0,
    commentCount: post._count?.comments ?? post.commentCount ?? 0,
    shareCount: post._count?.shares ?? post.shareCount ?? 0,
    taggedProducts: post.taggedProducts ?? [],
  }
}

export const usePost = () => {
  const postApi = usePostApi()
  const postStore = usePostStore()
  const profileStore = useProfileStore()

  const isLoading = computed(() => postStore.isLoading)
  const error = computed(() => postStore.error)

  const createPost = async (data: ICreatePostData) => {
    postStore.setLoading(true)
    postStore.setError(null)
    try {
      const result = await postApi.createPost(data)
      postStore.addPosts([result])
      profileStore.addMyPost(result)
      return result
    } catch (error: any) {
      postStore.setError(error.message || 'Failed to create post')
      throw error
    } finally {
      postStore.setLoading(false)
    }
  }

  const fetchUserFeed = async (limit: number = 20, offset: number = 0) => {
    postStore.setLoading(true)
    postStore.setError(null)
    try {
      const result = await postApi.getUserFeed(limit, offset)
      postStore.addPosts(result.data)
      return result
    } catch (error: any) {
      postStore.setError(error.message || 'Failed to fetch feed')
      throw error
    } finally {
      postStore.setLoading(false)
    }
  }

  const fetchUserPosts = async (username: string, limit = 9, offset = 0) => {
    postStore.setLoading(true)
    try {
      // Use the specific endpoint for user profile posts
      const result = await postApi.getUserPosts(username, limit, offset)

      // We pass username so the store knows which Map key to update
      postStore.addPosts(result.data, username)

      return result
    } catch (e: any) {
      postStore.setError(e.message)
      throw e
    } finally {
      postStore.setLoading(false)
    }
  }

  const getPostById = async (id: string) => {
    postStore.setLoading(true)
    postStore.setError(null)
    try {
      const result = await postApi.getPostById(id)
      postStore.addPosts([result])
      return result
    } catch (error: any) {
      postStore.setError(error.message || 'Post not found')
      throw error
    } finally {
      postStore.setLoading(false)
    }
  }

  const likePost = async (id: string) => {
    try {
      postStore.addLikedPost(id)
      await postApi.likePost(id)
      return true
    } catch (error: any) {
      postStore.removeLikedPost(id)
      postStore.setError(error.message || 'Failed to like post')
      throw error
    }
  }

  const unlikePost = async (id: string) => {
    try {
      postStore.removeLikedPost(id)
      await postApi.unlikePost(id)
      return true
    } catch (error: any) {
      postStore.addLikedPost(id)
      postStore.setError(error.message || 'Failed to unlike post')
      throw error
    }
  }

  const savePost = async (id: string) => {
    try {
      await postApi.savePost(id)
      postStore.addSavedPosts([{ id }])
      return true
    } catch (error: any) {
      postStore.setError(error.message || 'Failed to save post')
      throw error
    }
  }

  const fetchSavedPosts = async (limit = 9, offset = 0) => {
    postStore.setLoading(true)
    try {
      const result = await postApi.getSavedPosts(limit, offset)
      postStore.addSavedPosts(result.data)
      return result
    } catch (e: any) {
      postStore.setError(e.message)
    } finally {
      postStore.setLoading(false)
    }
  }

  const unsavePost = async (postId: string) => {
    try {
      await postApi.unsavePost(postId)
      postStore.removeSavedPost(postId)
    } catch (e: any) {
      postStore.setError(e.message)
    }
  }

  const fetchUserLikedPosts = async (
    username: string,
    limit = 20,
    offset = 0,
  ) => {
    postStore.setLoading(true)
    try {
      const result = await postApi.getUserLikedPosts(username, limit, offset)
      postStore.addLikedPostsByUser(result.data, username)
      return result
    } catch (e: any) {
      postStore.setError(e.message)
      throw e
    } finally {
      postStore.setLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    try {
      await postApi.deletePost(id)
      postStore.deletePost(id)
      profileStore.removeMyPost(id)
    } catch (error: any) {
      postStore.setError(error.message || 'Failed to delete post')
      throw error
    }
  }

  const updatePost = async (
    id: string,
    data: {
      caption?: string
      content?: string
      contentType?: string
      visibility?: string
    },
  ) => {
    try {
      const updated = await postApi.updatePost(id, data)
      postStore.updatePost(id, updated)
      return updated
    } catch (error: any) {
      postStore.setError(error.message || 'Failed to update post')
      throw error
    }
  }

  return {
    isLoading,
    error,
    normalizePost,
    createPost,
    fetchUserFeed,
    fetchUserPosts,
    getPostById,
    likePost,
    unlikePost,
    savePost,
    fetchSavedPosts,
    unsavePost,
    fetchUserLikedPosts,
    deletePost,
    updatePost,
  }
}
