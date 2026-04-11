import { useAuthStore } from '~~/layers/core/app/stores/auth.store'
import type { INotification } from '../types/profile.types'

// SSE EventSource singleton — one stream per logged-in user
let eventSource: EventSource | null = null

// ─── Notification sound (Web Audio API) ─────────────────────────────────────
function playNotificationChime() {
  if (!import.meta.client) return
  try {
    const ctx = new AudioContext()
    // Two-note chime: C6 → E6
    const notes = [
      { freq: 1047, start: 0, duration: 0.18 },
      { freq: 1319, start: 0.14, duration: 0.28 },
    ]
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start)
      gain.gain.setValueAtTime(0, ctx.currentTime + note.start)
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + note.start + 0.01)
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + note.start + note.duration,
      )
      osc.start(ctx.currentTime + note.start)
      osc.stop(ctx.currentTime + note.start + note.duration)
    }
    // Auto-close AudioContext after chime finishes
    setTimeout(() => ctx.close(), 700)
  } catch {
    // AudioContext may be blocked by browser until user interaction — silent fail
  }
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<INotification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Sound preference — persisted in localStorage
  const soundEnabled = ref(
    import.meta.client
      ? localStorage.getItem('notificationSoundEnabled') !== 'false'
      : true,
  )

  const setSoundEnabled = (val: boolean) => {
    soundEnabled.value = val
    if (import.meta.client) {
      localStorage.setItem('notificationSoundEnabled', String(val))
    }
  }

  const getUnreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.read),
  )

  const setNotifications = (newNotifications: INotification[]) => {
    notifications.value = newNotifications
    updateUnreadCount()
  }
  const addNotification = (notification: INotification) => {
    // Deduplicate
    if (notifications.value.some((n) => n.id === notification.id)) return
    notifications.value.unshift(notification)
    updateUnreadCount()
    if (soundEnabled.value) playNotificationChime()
  }
  const markAsRead = (id: number) => {
    const n = notifications.value.find((n) => n.id === id)
    if (n) n.read = true
    updateUnreadCount()
  }
  const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter((n) => !n.read).length
  }
  const deleteNotification = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
    updateUnreadCount()
  }
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  const setError = (err: string | null) => {
    error.value = err
  }
  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
  }

  // ─── SSE stream ─────────────────────────────────────────────────────────────

  /**
   * Open the SSE stream — call this after the user logs in.
   *
   * The browser's EventSource API handles:
   *   - Auto-reconnect if the connection drops (with exponential backoff)
   *   - Deduplication of event IDs (if we ever add them)
   */
  const connectStream = () => {
    if (!import.meta.client) return
    if (eventSource) return // already connected

    const authStore = useAuthStore()
    const token = authStore.accessToken
    if (!token) return

    const url = `/api/notifications/stream?token=${encodeURIComponent(token)}`
    eventSource = new EventSource(url)

    // Server sends: event: connected
    eventSource.addEventListener('connected', () => {
      console.log('[Notifications] SSE stream connected')
    })

    // Server sends: event: notification  data: { ...notificationObject }
    eventSource.addEventListener('notification', (e: MessageEvent) => {
      try {
        const notification = JSON.parse(e.data)
        addNotification(notification)
      } catch {
        /* ignore malformed events */
      }
    })

    eventSource.onerror = () => {
      // EventSource auto-reconnects — we just log it
      console.warn('[Notifications] SSE stream error, will reconnect...')
    }
  }

  /**
   * Close the SSE stream — call this on logout.
   */
  const disconnectStream = () => {
    eventSource?.close()
    eventSource = null
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    soundEnabled,
    getUnreadNotifications,
    setNotifications,
    addNotification,
    markAsRead,
    updateUnreadCount,
    deleteNotification,
    setLoading,
    setError,
    clearNotifications,
    setSoundEnabled,
    connectStream,
    disconnectStream,
  }
})
