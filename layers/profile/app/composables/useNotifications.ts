import { useNotificationApi } from '../services/notification.api'
import { useNotificationStore } from '../stores/notification.store'
import { extractErrorMessage } from '~~/layers/core/app/utils/errors'

export const useNotifications = () => {
  const notificationApi = useNotificationApi()
  const notificationStore = useNotificationStore()

  const isLoading = computed(() => notificationStore.isLoading)
  const error = computed(() => notificationStore.error)
  const notifications = computed(() => notificationStore.notifications)

  const fetchNotifications = async () => {
    notificationStore.setLoading(true)
    notificationStore.setError(null)
    try {
      const result = await notificationApi.getNotifications()
      notificationStore.setNotifications(result.data)
      return result
    } catch (error: unknown) {
      notificationStore.setError(
        extractErrorMessage(error, 'Failed to fetch notifications'),
      )
      throw error
    } finally {
      notificationStore.setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      notificationStore.markAsRead(id)
      return true
    } catch (error: unknown) {
      notificationStore.setError(
        extractErrorMessage(error, 'Failed to mark as read'),
      )
      throw error
    }
  }

  return { isLoading, error, notifications, fetchNotifications, markAsRead }
}
