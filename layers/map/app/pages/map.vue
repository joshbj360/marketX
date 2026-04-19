<!-- /map — Full-screen store discovery map (Snapchat-style) -->
<template>
  <div class="map-page">
    <div class="map-split">
      <!-- ── LEFT: store panel (desktop only) ──────────────────────────── -->
      <div class="panel-area">
        <ClientOnly>
          <MapStorePanel
            v-if="locationGranted"
            :sellers="sellers as any"
            :selected-seller="selectedSeller as any"
            :active-filter="activeFilter"
            :active-category="categorySlug"
            :radius-km="radiusKm"
            :loading="loading"
            :fetch-preview="fetchPreview as any"
            @select="onSelectSeller"
            @update:filter="onFilterChange"
            @update:category="onCategoryChange"
            @update:search="onSearchChange"
            @update:radius="onRadiusChange"
            @recenter="handleAllowLocation"
          />
          <div
            v-else
            class="flex h-full flex-col items-center justify-center gap-4 p-6 text-center"
            style="background: rgba(10, 15, 30, 0.96)"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full bg-white/5"
            >
              <Icon
                name="mdi:map-marker-radius-outline"
                size="28"
                class="text-brand"
              />
            </div>
            <div>
              <p class="text-sm font-bold text-white">Near Me</p>
              <p class="mt-1 text-xs text-white/40">
                Allow location to see stores
              </p>
            </div>
          </div>
        </ClientOnly>
      </div>

      <!-- ── RIGHT: map area ─────────────────────────────────────────────── -->
      <div class="map-area">
        <!-- Map canvas -->
        <ClientOnly>
          <MapView
            v-if="locationGranted"
            :sellers="sellers as any"
            :squares="mapSquares"
            :user-lat="userLat"
            :user-lng="userLng"
            :selected-slug="selectedSeller?.store_slug ?? null"
            :radius-km="radiusKm"
            class="map-fill"
            @select-seller="onSelectSeller"
            @select-square="onSelectSquare"
            @deselect="selectedSeller = null"
          />
          <template #fallback>
            <div class="map-fill flex items-center justify-center bg-[#1a1a2e]">
              <Icon
                name="mdi:loading"
                size="32"
                class="animate-spin text-white/40"
              />
            </div>
          </template>
        </ClientOnly>

        <!-- Location gate -->
        <Transition name="fade">
          <div
            v-if="!locationGranted"
            class="map-fill flex flex-col items-center justify-center gap-6 bg-[#0f172a] p-8 text-center"
          >
            <div class="relative flex h-24 w-24 items-center justify-center">
              <div
                class="absolute inset-0 animate-ping rounded-full bg-brand/20"
              />
              <div
                class="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 ring-1 ring-brand/30"
              >
                <Icon
                  name="mdi:map-marker-radius-outline"
                  size="40"
                  class="text-brand"
                />
              </div>
            </div>
            <div>
              <h2 class="text-xl font-black text-white">
                Discover stores near you
              </h2>
              <p class="mt-2 max-w-xs text-sm text-white/50">
                Allow location access to find sellers, deals, and products
                around you.
              </p>
            </div>
            <button
              class="flex items-center gap-2 rounded-2xl bg-brand px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand/30 transition active:scale-95"
              :disabled="loading"
              @click="handleAllowLocation"
            >
              <Icon
                v-if="loading"
                name="mdi:loading"
                size="18"
                class="animate-spin"
              />
              <Icon v-else name="mdi:crosshairs-gps" size="18" />
              {{ loading ? 'Getting location…' : 'Allow Location' }}
            </button>
            <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
          </div>
        </Transition>

        <!-- ── Top bar (mobile only) ──────────────────────────────────────── -->
        <div v-if="locationGranted" class="map-top-ui pointer-events-none">
          <button
            class="map-glass-btn pointer-events-auto"
            aria-label="Back"
            @click="$router.back()"
          >
            <Icon name="mdi:arrow-left" size="20" class="text-white" />
          </button>

          <!-- Mobile search — functional, debounced -->
          <div
            class="pointer-events-auto flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 backdrop-blur-md lg:hidden"
          >
            <Icon name="mdi:magnify" size="18" class="shrink-0 text-white/50" />
            <input
              v-model="mobileSearch"
              type="search"
              placeholder="Search stores, products…"
              class="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
              @input="onMobileSearchInput"
            />
            <button
              v-if="mobileSearch"
              class="shrink-0 text-white/40"
              @click="clearMobileSearch"
            >
              <Icon name="mdi:close-circle" size="16" />
            </button>
          </div>

          <!-- On desktop, just a back+recenter row (panel has search) -->
          <div class="hidden flex-1 lg:flex" />

          <button
            class="map-glass-btn pointer-events-auto lg:hidden"
            aria-label="Recenter"
            @click="handleAllowLocation"
          >
            <Icon name="mdi:crosshairs-gps" size="20" class="text-white" />
          </button>
        </div>

        <!-- ── Filter + radius pills (mobile only) ────────────────────────── -->
        <div
          v-if="locationGranted"
          class="map-pills pointer-events-none lg:hidden"
        >
          <div class="pointer-events-auto space-y-2">
            <MapFilterPills
              :active="activeFilter"
              :total-count="sellers.length"
              :deal-count="sellers.filter((s) => s.hasActiveDeal).length"
              :premium-count="sellers.filter((s) => s.isPremium).length"
              :verified-count="sellers.filter((s) => s.is_verified).length"
              @update:active="onFilterChange"
            />
            <!-- Radius row -->
            <div
              class="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2 backdrop-blur-md"
            >
              <Icon
                name="mdi:map-marker-radius-outline"
                size="14"
                class="shrink-0 text-white/40"
              />
              <input
                type="range"
                :value="radiusKm"
                min="5"
                max="500"
                step="5"
                class="mobile-slider flex-1"
                @change="
                  onRadiusChange(
                    Number(($event.target as HTMLInputElement).value),
                  )
                "
              />
              <span
                class="min-w-[44px] shrink-0 text-right text-[11px] font-bold text-white/60"
                >{{ radiusKm }} km</span
              >
            </div>
          </div>
        </div>

        <!-- ── Bottom sheet (mobile only) ────────────────────────────────── -->
        <div
          v-if="locationGranted && selectedSeller"
          class="map-sheet lg:hidden"
        >
          <MapBottomSheet
            :seller="selectedSeller as any"
            :fetch-preview="fetchPreview as any"
            @close="selectedSeller = null"
          />
        </div>

        <!-- ── Floating count badge (mobile, no selection) ───────────────── -->
        <Transition name="fade">
          <div
            v-if="locationGranted && !selectedSeller && sellers.length > 0"
            class="map-count-badge lg:hidden"
          >
            <Icon name="mdi:store-outline" size="13" />
            {{ sellers.length }} store{{ sellers.length !== 1 ? 's' : '' }}
            nearby
          </div>
        </Transition>
      </div>
      <!-- /map-area -->
    </div>
    <!-- /map-split -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MapView from '~~/layers/map/app/components/MapView.vue'
import MapFilterPills from '~~/layers/map/app/components/MapFilterPills.vue'
import MapBottomSheet from '~~/layers/map/app/components/MapBottomSheet.vue'
import MapStorePanel from '~~/layers/map/app/components/MapStorePanel.vue'
import {
  useMapSellers,
  getCachedLocation,
} from '~~/layers/map/app/composables/useMapSellers'
import type { IMapSeller, IMapSquare, MapFilter } from '~~/layers/map/app/types/map.types'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Near Me | MarketX',
  description: 'Discover sellers and products near your location.',
})

const {
  sellers,
  loading,
  error,
  userLat,
  userLng,
  activeFilter,
  radiusKm,
  categorySlug,
  requestLocation,
  fetchSellers,
  fetchPreview,
  setFilter,
  setSearch,
  setCategorySlug,
  setLocation,
} = useMapSellers()

const locationGranted = ref(false)
const selectedSeller = ref<IMapSeller | null>(null)
const mobileSearch = ref('')

// ── Squares ───────────────────────────────────────────────────────────────────
const mapSquares = ref<IMapSquare[]>([])

const fetchSquares = async () => {
  try {
    const res = await $fetch<any>('/api/map/squares')
    mapSquares.value = res?.data ?? []
  } catch {
    // non-critical — map still works without squares
  }
}

const onSelectSquare = (square: IMapSquare) => {
  // Deselect any seller and navigate to the Square page
  selectedSeller.value = null
  navigateTo(`/squares/${square.slug}`)
}

// ── Location ──────────────────────────────────────────────────────────────────
const handleAllowLocation = async () => {
  try {
    const { lat, lng } = await requestLocation()
    locationGranted.value = true
    await fetchSellers({ lat, lng })
  } catch {}
}

// ── Event handlers ────────────────────────────────────────────────────────────
const onSelectSeller = (seller: IMapSeller) => {
  selectedSeller.value = seller
}

const onFilterChange = async (filter: MapFilter) => {
  selectedSeller.value = null
  await setFilter(filter)
}

const onCategoryChange = async (slug: string) => {
  selectedSeller.value = null
  await setCategorySlug(slug)
}

const onSearchChange = async (q: string) => {
  selectedSeller.value = null
  await setSearch(q)
}

const onRadiusChange = (km: number) => {
  selectedSeller.value = null
  radiusKm.value = km
  fetchSellers({ radius: km })
}

// Mobile search — debounced
let mobileSearchTimer: ReturnType<typeof setTimeout> | null = null
const onMobileSearchInput = () => {
  if (mobileSearchTimer) clearTimeout(mobileSearchTimer)
  mobileSearchTimer = setTimeout(() => {
    selectedSeller.value = null
    setSearch(mobileSearch.value.trim())
  }, 400)
}
const clearMobileSearch = () => {
  mobileSearch.value = ''
  setSearch('')
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(() => {
  if (!import.meta.client) return

  fetchSquares()

  const cached = getCachedLocation()
  if (cached) {
    const { lat, lng } = cached
    setLocation(lat, lng)
    locationGranted.value = true
    fetchSellers({ lat, lng })
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((r) => {
        if (r.state === 'granted') handleAllowLocation()
      })
      .catch(() => {})
    return
  }

  navigator.permissions
    ?.query({ name: 'geolocation' })
    .then((r) => {
      if (r.state === 'granted') handleAllowLocation()
    })
    .catch(() => {})
})
</script>

<style scoped>
.map-page {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow: hidden;
  background: #0f172a;
}
.map-split {
  display: flex;
  height: 100%;
  width: 100%;
}
.map-area {
  position: relative;
  flex: 1;
  min-width: 0;
}
.panel-area {
  display: none;
  width: 340px;
  flex-shrink: 0;
}
@media (min-width: 1024px) {
  .panel-area {
    display: flex;
    flex-direction: column;
  }
}
.map-fill {
  position: absolute;
  inset: 0;
}

/* ── Top bar ─────────────────────────────────────────────────────────────────── */
.map-top-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: max(env(safe-area-inset-top, 0px), 12px) 12px 12px;
}
.map-glass-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 150ms;
}
.map-glass-btn:hover {
  background: rgba(0, 0, 0, 0.6);
}

/* ── Filter pills area ────────────────────────────────────────────────────────── */
.map-pills {
  position: absolute;
  top: calc(max(env(safe-area-inset-top, 0px), 12px) + 58px);
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 12px;
}

/* ── Bottom sheet ─────────────────────────────────────────────────────────────── */
.map-sheet {
  position: absolute;
  inset: 0;
  z-index: 30;
  pointer-events: none;
}
.map-sheet > * {
  pointer-events: auto;
}

/* ── Count badge ──────────────────────────────────────────────────────────────── */
.map-count-badge {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 5px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Mobile range slider ──────────────────────────────────────────────────────── */
.mobile-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
}
.mobile-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f43f5e;
  border: 2px solid #fff;
  box-shadow: 0 0 6px rgba(244, 63, 94, 0.5);
  cursor: pointer;
}
.mobile-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f43f5e;
  border: 2px solid #fff;
  cursor: pointer;
}
</style>
