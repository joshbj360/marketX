import { BaseApiClient } from '~~/layers/core/app/services/base.api'
import type {
  IComment,
  ICreateCommentData,
  IPaginatedResponse,
} from '../../../profile/app/types/profile.types'

export class CommentApiClient extends BaseApiClient {
  async getPostComments(
    postId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<IPaginatedResponse<IComment>> {
    return this.request(
      `/api/posts/${postId}/comments?limit=${limit}&offset=${offset}`,
      { method: 'GET' },
    )
  }

  async createComment(
    postId: string,
    data: ICreateCommentData,
  ): Promise<IComment> {
    const response = await this.request<{ success: boolean; data: IComment }>(
      `/api/posts/${postId}/comments`,
      { method: 'POST', body: data },
    )
    return response.data
  }

  async deleteComment(postId: string, commentId: string): Promise<any> {
    return this.request(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    })
  }

  async likeComment(postId: string, commentId: string): Promise<any> {
    return this.request(`/api/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    })
  }

  async unlikeComment(postId: string, commentId: string): Promise<any> {
    return this.request(`/api/posts/${postId}/comments/${commentId}/like`, {
      method: 'DELETE',
    })
  }
}

let instance: CommentApiClient | null = null
export const useCommentApi = () => {
  if (!instance) instance = new CommentApiClient()
  return instance
}
