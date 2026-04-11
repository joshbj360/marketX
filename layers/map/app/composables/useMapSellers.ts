import { ref, readonly } from 'vue'
import type {
  IMapSeller,
  IMapSellerPreview,
  MapFilter,
} from '../types/map.types'

const LOCATION_KEY = 'reelshop:map:location'
const LOCATION_TTL_MS = 60 * 60 * 1000 // 1 hour

function saveLocation(lat: number, lng: number) {
  try {
    localStorage.setItem(
      LOCATION_KEY,
      JSON.stringify({ lat, lng, ts: Date.now() }),
    )
  } catch (err: any) {
    console.log(err)
  }
}

/** Returns cached coords if they exist and are < 1 hour old, otherwise null */
export function getCachedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > LOCATION_TTL_MS) return null
    return { lat: parsed.lat, lng: parsed.lng }
  } catch {
    return null
  }
}

export function useMapSellers() {
  const sellers = ref<IMapSeller[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const hasMore = ref(false)
  const userLat = ref<number | null>(null)
  const userLng = ref<number | null>(null)
  const radiusKm = ref(50)
  const activeFilter = ref<MapFilter>('all')
  const search = ref('')
  const categorySlug = ref('')

  // ── Location ────────────────────────────────────────────────────────────────
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
          saveLocation(pos.coords.latitude, pos.coords.longitude)
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => {
          error.value =
            err.code === 1
              ? 'Location permission denied. Enable location in your browser.'
              : 'Could not determine your location.'
          reject(err)
        },
        { enableHighAccuracy: false, timeout: 12000 },
      )
    })

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchSellers = async (opts?: {
    lat?: number
    lng?: number
    radius?: number
    filter?: MapFilter
    offset?: number
    append?: boolean
    search?: string
    category?: string
  }) => {
    const lat = opts?.lat ?? userLat.value
    const lng = opts?.lng ?? userLng.value
    if (lat === null || lng === null) return

    loading.value = true
    error.value = null

    const filter = opts?.filter ?? activeFilter.value
    const offset = opts?.offset ?? 0
    const append = opts?.append ?? false
    const q = opts?.search ?? search.value
    const cat = opts?.category ?? categorySlug.value

    try {
      const data: any = await $fetch('/api/map/sellers', {
        query: {
          lat,
          lng,
          radius: opts?.radius ?? radiusKm.value,
          limit: 100,
          offset,
          filter: filter === 'all' ? undefined : filter,
          search: q || undefined,
          category: cat || undefined,
        },
      })
      sellers.value = append ? [...sellers.value, ...data.data] : data.data
      total.value = data.meta.total
      hasMore.value = data.meta.hasMore
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Could not load nearby stores'
    } finally {
      loading.value = false
    }
  }

  // ── Preview ──────────────────────────────────────────────────────────────────
  const fetchPreview = async (
    storeSlug: string,
  ): Promise<IMapSellerPreview | null> => {
    if (userLat.value === null || userLng.value === null) return null
    try {
      const data: any = await $fetch(`/api/map/sellers/${storeSlug}/preview`, {
        query: { lat: userLat.value, lng: userLng.value },
      })
      return data.data
    } catch {
      return null
    }
  }

  const setFilter = async (f: MapFilter) => {
    activeFilter.value = f
    await fetchSellers({ filter: f, offset: 0 })
  }

  const setSearch = async (q: string) => {
    search.value = q
    await fetchSellers({ search: q, offset: 0 })
  }

  const setCategorySlug = async (slug: string) => {
    categorySlug.value = slug
    await fetchSellers({ category: slug, offset: 0 })
  }

  /** Hydrate from a cached location without triggering the browser permission prompt */
  const setLocation = (lat: number, lng: number) => {
    userLat.value = lat
    userLng.value = lng
  }

  return {
    sellers: readonly(sellers),
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    hasMore: readonly(hasMore),
    userLat: readonly(userLat),
    userLng: readonly(userLng),
    radiusKm,
    activeFilter: readonly(activeFilter),
    search: readonly(search),
    categorySlug: readonly(categorySlug),
    requestLocation,
    fetchSellers,
    fetchPreview,
    setFilter,
    setSearch,
    setCategorySlug,
    setLocation,
  }
}

