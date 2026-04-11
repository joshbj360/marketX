import { ref, readonly } from 'vue'
import type { INearbyStore } from '../types/map.types'

export function useNearbyStores() {
  const stores = ref<INearbyStore[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const hasMore = ref(false)
  const userLat = ref<number | null>(null)
  const userLng = ref<number | null>(null)
  const radius = ref(50) // km

  const fetchNearby = async (
    lat: number,
    lng: number,
    opts?: { limit?: number; offset?: number; radiusKm?: number },
  ) => {
    loading.value = true
    error.value = null
    const r = opts?.radiusKm ?? radius.value
    const limit = opts?.limit ?? 30
    const offset = opts?.offset ?? 0

    try {
      const data: any = await $fetch('/api/feed/nearby-stores', {
        query: { lat, lng, radius: r, limit, offset },
      })
      if (offset === 0) {
        stores.value = data.data
      } else {
        stores.value = [...stores.value, ...data.data]
      }
      total.value = data.meta.total
      hasMore.value = data.meta.hasMore
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Could not load nearby stores'
    } finally {
      loading.value = false
    }
  }

  const requestLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLat.value = pos.coords.latitude
          userLng.value = pos.coords.longitude
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 10000 },
      )
    })

  return {
    stores: readonly(stores),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    hasMore: readonly(hasMore),
    userLat: readonly(userLat),
    userLng: readonly(userLng),
    radius,
    fetchNearby,
    requestLocation,
  }
}
