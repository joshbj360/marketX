<!-- layers/map/app/components/StoreMap.vue -->
<template>
  <div ref="mapEl" class="h-full w-full rounded-2xl" aria-label="Store map" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { INearbyStore } from '../types/map.types'

const props = defineProps<{
  stores: INearbyStore[]
  userLat: number | null
  userLng: number | null
  selectedId?: string | null
}>()

const emit = defineEmits<{ 'select-store': [store: INearbyStore] }>()

const mapEl = ref<HTMLElement | null>(null)
let map: any = null
let L: any = null
const markerMap = new Map<string, any>()

onMounted(async () => {
  if (!import.meta.client) return
  // Dynamic import — Leaflet requires DOM
  L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  // Fix default icon paths broken by Vite
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  const centerLat = props.userLat ?? 6.5244
  const centerLng = props.userLng ?? 3.3792 // Lagos default

  map = L.map(mapEl.value, { zoomControl: true }).setView([centerLat, centerLng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  // User dot
  if (props.userLat && props.userLng) {
    const userIcon = L.divIcon({
      html: '<div class="user-dot"></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })
    L.marker([props.userLat, props.userLng], { icon: userIcon })
      .addTo(map)
      .bindTooltip('You are here', { permanent: false })
  }

  renderMarkers()
})

onUnmounted(() => {
  map?.remove()
  map = null
})

watch(() => props.stores, renderMarkers, { deep: true })

function renderMarkers() {
  if (!map || !L) return

  // Remove old markers not in new list
  const newIds = new Set(props.stores.map((s) => s.id))
  for (const [id, marker] of markerMap.entries()) {
    if (!newIds.has(id)) {
      map.removeLayer(marker)
      markerMap.delete(id)
    }
  }

  for (const store of props.stores) {
    if (markerMap.has(store.id)) continue
    const storeIcon = L.divIcon({
      html: `<div class="store-pin" title="${store.store_name || store.store_slug}">
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#F43F5E"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [28, 36],
      iconAnchor: [14, 36],
      popupAnchor: [0, -36],
    })

    const marker = L.marker([store.latitude, store.longitude], { icon: storeIcon })
      .addTo(map)
      .on('click', () => emit('select-store', store))

    markerMap.set(store.id, marker)
  }
}
</script>

<style>
.user-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #F43F5E;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #F43F5E;
}
.store-pin { cursor: pointer; }
.store-pin:hover svg path { fill: #E11D48; }
</style>
