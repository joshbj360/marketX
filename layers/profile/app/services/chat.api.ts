import { BaseApiClient } from '~~/layers/core/app/services/base.api'

export class ChatApiClient extends BaseApiClient {
  async getConversations(limit: number = 20, offset: number = 0): Promise<any> {
    return this.request(
      `/api/chat/conversations?limit=${limit}&offset=${offset}`,
      { method: 'GET' },
    )
  }

  async createConversation(targetId: string): Promise<any> {
    return this.request('/api/chat/conversations', {
      method: 'POST',
      body: { targetId },
    })
  }

  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<any> {
    return this.request(
      `/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
      { method: 'GET' },
    )
  }

  async sendMessage(conversationId: string, text: string): Promise<any> {
    return this.request(
      `/api/chat/conversations/${conversationId}/messages`,
      { method: 'POST', body: { text } },
    )
  }

  async createStoreConversation(storeId: string, productId?: number): Promise<any> {
    return this.request('/api/chat/conversations', {
      method: 'POST',
      body: { storeId, productId },
    })
  }
}

let instance: ChatApiClient | null = null
export const useChatApi = () => {
  if (!instance) instance = new ChatApiClient()
  return instance
}
