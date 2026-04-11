import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useProfileApi } from '~~/layers/profile/app/services/profile.api'
import { BRAND } from '~~/layers/core/app/utils/brand'

const STORAGE_KEY = `${BRAND.storagePrefix}_settings`

export interface AppSettings {
  autoMute: boolean
  textSize: 'small' | 'medium' | 'large'
  compactFeed: boolean
  showLikeCounts: boolean
  showCaptions: boolean
  showNearMe: boolean
  showShopToday: boolean
  showStories: boolean
  currency: string
  theme: string
  language: string
}

const defaults: AppSettings = {
  autoMute: true,
  textSize: 'medium',
  compactFeed: false,
  showLikeCounts: true,
  showCaptions: true,
  showNearMe: true,
  showShopToday: true,
  showStories: true,
  currency: 'NGN',
  theme: 'system',
  language: 'en',
}

const settings = ref<AppSettings>({ ...defaults })
let initialized = false

// Map client camelCase keys → DB snake_case columns
const DB_KEY_MAP: Record<keyof AppSettings, string> = {
  autoMute: 'auto_mute',
  textSize: 'text_size',
  compactFeed: 'compact_feed',
  showLikeCounts: 'show_like_counts',
  showCaptions: 'show_captions',
  showNearMe: 'show_near_me',
  showShopToday: 'show_shop_today',
  showStories: 'show_stories',
  currency: 'currency',
  theme: 'theme',
  language: 'language',
}

interface DbSettings {
  auto_mute: boolean
  text_size: 'small' | 'medium' | 'large'
  compact_feed: boolean
  show_like_counts: boolean
  show_captions: boolean
  show_near_me: boolean
  show_shop_today: boolean
  show_stories: boolean
  currency: string
  theme: string
  language: string
}

// Map DB snake_case → camelCase
const fromDb = (db: Partial<DbSettings>): Partial<AppSettings> => ({
  autoMute: db.auto_mute ?? defaults.autoMute,
  textSize: db.text_size ?? defaults.textSize,
  compactFeed: db.compact_feed ?? defaults.compactFeed,
  showLikeCounts: db.show_like_counts ?? defaults.showLikeCounts,
  showCaptions: db.show_captions ?? defaults.showCaptions,
  showNearMe: db.show_near_me ?? defaults.showNearMe,
  showShopToday: db.show_shop_today ?? defaults.showShopToday,
  showStories: db.show_stories ?? defaults.showStories,
  currency: db.currency ?? defaults.currency,
  theme: db.theme ?? defaults.theme,
  language: db.language ?? defaults.language,
})

const load = () => {
  if (!import.meta.client) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) Object.assign(settings.value, JSON.parse(stored))
  } catch {
    /* ignore */
  }
}

const save = () => {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
}

const applyTextSize = (size: AppSettings['textSize']) => {
  if (!import.meta.client) return
  document.documentElement.classList.remove(
    'text-size-small',
    'text-size-large',
  )
  if (size !== 'medium')
    document.documentElement.classList.add(`text-size-${size}`)
}

// Debounced server sync — batches rapid changes into one request
let syncTimer: ReturnType<typeof setTimeout> | null = null
const pendingPatch: Partial<DbSettings> = {}

const flushToServer = async () => {
  if (!import.meta.client || Object.keys(pendingPatch).length === 0) return
  const profileStore = useProfileStore()
  if (!profileStore.isLoggedIn) return

  const payload = { ...pendingPatch }
  Object.keys(pendingPatch).forEach(
    (k) => delete pendingPatch[k as keyof DbSettings],
  )

  try {
    const profileApi = useProfileApi()
    await profileApi.updateSettings(payload)
  } catch {
    /* non-critical — local settings are still applied */
  }
}

const scheduleSync = (dbKey: string, value: AppSettings[keyof AppSettings]) => {
  pendingPatch[dbKey as keyof DbSettings] = value
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(flushToServer, 800)
}

export const useSettings = () => {
  if (import.meta.client && !initialized) {
    initialized = true
    load()
    applyTextSize(settings.value.textSize)
  }

  const update = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    settings.value[key] = value
    save()
    if (key === 'textSize') applyTextSize(value as AppSettings['textSize'])
    scheduleSync(DB_KEY_MAP[key], value)
  }

  const reset = () => {
    Object.assign(settings.value, defaults)
    save()
    applyTextSize(defaults.textSize)
    // Sync all defaults to server
    for (const [k, v] of Object.entries(defaults)) {
      pendingPatch[DB_KEY_MAP[k as keyof AppSettings] as keyof DbSettings] = v
    }
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(flushToServer, 800)
  }

  /**
   * Called by the auth flow after login/init.
   * Merges server settings on top of localStorage (server wins).
   */
  const hydrateFromServer = (serverSettings: Partial<DbSettings>) => {
    const mapped = fromDb(serverSettings)
    Object.assign(settings.value, mapped)
    save()
    applyTextSize(settings.value.textSize)
  }

  return { settings: readonly(settings), update, reset, hydrateFromServer }
}
