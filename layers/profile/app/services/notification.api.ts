import { BaseApiClient } from '~~/layers/core/app/services/base.api'
import type { INotification, IPaginatedResponse } from '../types/profile.types'

export class NotificationApiClient extends BaseApiClient {
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
  ): Promise<IPaginatedResponse<INotification>> {
    return this.request(
      `/api/shared/notifications?limit=${limit}&offset=${offset}`,
      { method: 'GET' },
    )
  }

  async markAsRead(id: number): Promise<{ success: boolean; data: INotification }> {
    return this.request(`/api/shared/notifications/${id}`, {
      method: 'PATCH',
      silent: true,
    })
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    return this.request('/api/shared/notifications/read-all', {
      method: 'PATCH',
      silent: true,
    })
  }
}

let instance: NotificationApiClient | null = null
export const useNotificationApi = () => {
  if (!instance) instance = new NotificationApiClient()
  return instance
}
