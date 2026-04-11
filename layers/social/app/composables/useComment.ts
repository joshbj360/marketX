import { useCommentApi } from '../services/comment.api'
import { useCommentStore } from '../store/comment.store'

export const useComment = () => {
  const commentApi = useCommentApi()
  const commentStore = useCommentStore()

  const isLoading = computed(() => commentStore.isLoading)
  const error = computed(() => commentStore.error)

  const fetchPostComments = async (postId: string) => {
    commentStore.setLoading(true)
    commentStore.setError(null)
    try {
      const result = await commentApi.getPostComments(postId)
      commentStore.setPostComments(result.data)
      return result
    } catch (error: any) {
      commentStore.setError(error.message || 'Failed to fetch comments')
      throw error
    } finally {
      commentStore.setLoading(false)
    }
  }

  const createComment = async (postId: string, data: any) => {
    commentStore.setLoading(true)
    commentStore.setError(null)
    try {
      const result = await commentApi.createComment(postId, data)
      commentStore.addPostComment(result)
      return result
    } catch (error: any) {
      commentStore.setError(error.message || 'Failed to create comment')
      throw error
    } finally {
      commentStore.setLoading(false)
    }
  }

  const likeComment = async (postId: string, commentId: string) => {
    return commentApi.likeComment(postId, commentId)
  }

  const unlikeComment = async (postId: string, commentId: string) => {
    return commentApi.unlikeComment(postId, commentId)
  }

  return {
    isLoading,
    error,
    fetchPostComments,
    createComment,
    likeComment,
    unlikeComment,
  }
}
