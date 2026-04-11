import type { IComment } from '~~/layers/profile/app/types/profile.types'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Map<string, IComment>>(new Map())
  const postComments = ref<IComment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getCommentById = (id: string) => comments.value.get(id)

  const addComment = (comment: IComment) => {
    comments.value.set(comment.id, comment)
  }

  const setPostComments = (newComments: IComment[]) => {
    postComments.value = newComments
  }

  const addPostComment = (comment: IComment) => {
    postComments.value.unshift(comment)
    comments.value.set(comment.id, comment)
  }

  const updateComment = (id: string, updates: Partial<IComment>) => {
    const comment = comments.value.get(id)
    if (comment) comments.value.set(id, { ...comment, ...updates })
  }

  const deleteComment = (id: string) => {
    comments.value.delete(id)
    postComments.value = postComments.value.filter((c) => c.id !== id)
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  const clearComments = () => {
    comments.value.clear()
    postComments.value = []
  }

  return {
    comments,
    postComments,
    isLoading,
    error,
    getCommentById,
    addComment,
    setPostComments,
    addPostComment,
    updateComment,
    deleteComment,
    setLoading,
    setError,
    clearComments,
  }
})
