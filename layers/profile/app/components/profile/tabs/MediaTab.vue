<template>
  <div class="p-4">
    <!-- Filter bar -->
    <div class="mb-4 flex items-center gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        @click="setFilter(f.value)"
        class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all"
        :class="
          activeFilter === f.value
            ? 'bg-brand text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
        "
      >
        <Icon :name="f.icon" size="13" />
        {{ f.label }}
        <span
          v-if="f.value === activeFilter && total > 0"
          class="rounded-full bg-white/25 px-1.5 text-[10px]"
        >{{ total }}</span>
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="loading && items.length === 0" class="grid grid-cols-3 gap-0.5 sm:grid-cols-4">
      <div
        v-for="i in 12"
        :key="i"
        class="aspect-square animate-pulse rounded-sm bg-gray-100 dark:bg-neutral-800"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!loading && items.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-16"
    >
      <Icon name="mdi:image-off-outline" size="52" class="text-gray-300 dark:text-neutral-700" />
      <p class="text-[14px] text-gray-500 dark:text-neutral-400">No media uploaded yet</p>
    </div>

    <!-- Grid -->
    <div v-else>
      <div class="grid grid-cols-3 gap-0.5 sm:grid-cols-4">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          @click="openLightbox(item)"
          class="group relative aspect-square overflow-hidden rounded-sm bg-gray-100 dark:bg-neutral-800"
        >
          <!-- Thumbnail -->
          <img
            v-if="item.type === 'VIDEO'"
            :src="videoThumb(item.url)"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <img
            v-else
            :src="item.url"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          <!-- Hover overlay -->
          <div
            class="absolute inset-0 flex items-end justify-between bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Icon
              :name="item.type === 'VIDEO' ? 'mdi:play-circle' : item.type === 'AUDIO' ? 'mdi:music' : 'mdi:image'"
              size="16"
              class="text-white drop-shadow"
            />
            <button
              type="button"
              @click.stop="copyUrl(item.url, item.id)"
              class="flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm hover:bg-white/30"
            >
              <Icon :name="copied === item.id ? 'mdi:check' : 'mdi:link'" size="11" />
              {{ copied === item.id ? 'Copied' : 'URL' }}
            </button>
          </div>

          <!-- Source badge -->
          <div class="pointer-events-none absolute left-1 top-1">
            <span
              v-if="item.postId"
              class="rounded bg-black/50 px-1 py-0.5 text-[9px] font-bold uppercase text-white"
            >Post</span>
            <span
              v-else-if="item.productId"
              class="rounded bg-brand/80 px-1 py-0.5 text-[9px] font-bold uppercase text-white"
            >Product</span>
          </div>
        </button>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="mt-4 flex justify-center">
        <button
          @click="loadMore"
          :disabled="loading"
          class="rounded-lg px-6 py-2 text-[13px] font-semibold text-brand transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-neutral-800"
        >
          {{ loading ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxItem"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          @click.self="lightboxItem = null"
        >
          <button
            class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            @click="lightboxItem = null"
          >
            <Icon name="mdi:close" size="20" />
          </button>

          <div class="max-h-[90vh] max-w-3xl w-full">
            <video
              v-if="lightboxItem.type === 'VIDEO'"
              :src="lightboxItem.url"
              class="max-h-[80vh] w-full rounded-xl object-contain"
              controls
              autoplay
            />
            <img
              v-else
              :src="lightboxItem.url"
              class="max-h-[80vh] w-full rounded-xl object-contain"
            />

            <!-- Info bar -->
            <div class="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
              <div>
                <p class="text-[12px] font-semibold text-white">
                  {{ lightboxItem.type }}
                  <span v-if="lightboxItem.postId" class="ml-2 text-white/60">· From a post</span>
                  <span v-else-if="lightboxItem.productId" class="ml-2 text-white/60">· From a product</span>
                </p>
                <p class="mt-0.5 text-[11px] text-white/50">
                  {{ formatDate(lightboxItem.created_at) }}
                </p>
              </div>
              <button
                type="button"
                @click="copyUrl(lightboxItem!.url, lightboxItem!.id)"
                class="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-[12px] font-semibold text-white hover:bg-white/25"
              >
                <Icon :name="copied === lightboxItem.id ? 'mdi:check' : 'mdi:content-copy'" size="14" />
                {{ copied === lightboxItem.id ? 'Copied!' : 'Copy URL' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface MediaItem {
  id: string
  url: string
  public_id: string | null
  type: 'IMAGE' | 'VIDEO' | 'AUDIO'
  created_at: string
  postId: string | null
  productId: number | null
  altText: string | null
}

const LIMIT = 30

const items = ref<MediaItem[]>([])
const total = ref(0)
const offset = ref(0)
const loading = ref(false)
const hasMore = ref(false)
const activeFilter = ref<string>('ALL')
const lightboxItem = ref<MediaItem | null>(null)
const copied = ref<string | null>(null)

const filters = [
  { value: 'ALL', label: 'All', icon: 'mdi:view-grid-outline' },
  { value: 'IMAGE', label: 'Images', icon: 'mdi:image-outline' },
  { value: 'VIDEO', label: 'Videos', icon: 'mdi:video-outline' },
  { value: 'AUDIO', label: 'Audio', icon: 'mdi:music-note-outline' },
]

const fetchMedia = async (reset = false) => {
  if (reset) {
    offset.value = 0
    items.value = []
  }
  loading.value = true
  try {
    const params: Record<string, string | number> = { limit: LIMIT, offset: offset.value }
    if (activeFilter.value !== 'ALL') params.type = activeFilter.value

    const res: any = await $fetch('/api/profile/media', { params })
    if (reset) {
      items.value = res.data
    } else {
      items.value.push(...res.data)
    }
    total.value = res.meta.total
    hasMore.value = res.meta.hasMore
  } catch {
    // silently fail — empty state shown
  } finally {
    loading.value = false
  }
}

const setFilter = (val: string) => {
  activeFilter.value = val
  fetchMedia(true)
}

const loadMore = () => {
  offset.value += LIMIT
  fetchMedia()
}

const openLightbox = (item: MediaItem) => {
  lightboxItem.value = item
}

const copyUrl = async (url: string, id: string) => {
  await navigator.clipboard.writeText(url).catch(() => {})
  copied.value = id
  setTimeout(() => { copied.value = null }, 2000)
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

onMounted(() => fetchMedia(true))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
