<template>
  <!-- Set hide-right-sidebar to false so HomeLayout automatically injects RightSideNav -->
  <HomeLayout
    :narrow-feed="true"
    :hide-right-sidebar="false"
    :custom-padding="true"
  >
    <!-- ─── FULL-SCREEN IMMERSIVE CONTAINER ──────────────────────────── -->
    <!-- Fixed to cover the screen, but perfectly avoids the desktop RightSideNav -->
    <div
      ref="containerRef"
      class="scrollbar-hide fixed inset-0 z-0 snap-y snap-mandatory overflow-y-auto bg-black transition-all duration-300 md:left-20 lg:right-[420px] xl:left-72 min-[1500px]:right-[calc(50vw-330px)]"
    >
      <!-- ─── INITIAL LOADING STATE ────────────────────────────────── -->
      <div
        v-if="pending && !reels.length"
        class="flex h-[100dvh] w-full flex-col items-center justify-center gap-4"
      >
        <div class="relative flex h-16 w-16 items-center justify-center">
          <div
            class="absolute inset-0 rounded-full border-4 border-white/10"
          ></div>
          <div
            class="absolute inset-0 animate-spin rounded-full border-4 border-brand border-t-transparent"
          ></div>
        </div>
        <p class="animate-pulse text-sm font-medium text-white/60">
          Loading Reels...
        </p>
      </div>

      <!-- ─── ERROR STATE ──────────────────────────────────────────── -->
      <div
        v-else-if="error && !reels.length"
        class="flex h-[100dvh] w-full flex-col items-center justify-center gap-5 px-6 text-center"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-white/5"
        >
          <Icon name="mdi:wifi-off" size="40" class="text-white/50" />
        </div>
        <div>
          <h3 class="mb-1 text-lg font-bold text-white">Connection Error</h3>
          <p class="max-w-[250px] text-sm text-white/60">
            We couldn't load the reels feed. Please check your internet.
          </p>
        </div>
        <button
          @click="refresh(true)"
          class="rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
        >
          Try Again
        </button>
      </div>

      <!-- ─── EMPTY STATE ──────────────────────────────────────────── -->
      <div
        v-else-if="!reels.length"
        class="flex h-[100dvh] w-full flex-col items-center justify-center gap-4"
      >
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-white/5"
        >
          <Icon name="mdi:video-off-outline" size="40" class="text-white/30" />
        </div>
        <h3 class="text-lg font-bold text-white">No Reels Yet</h3>
        <p class="text-sm text-white/50">Check back later for new content!</p>
      </div>

      <!-- ─── REELS FEED ───────────────────────────────────────────── -->
      <template v-else>
        <div
          v-for="(reel, index) in reels"
          :key="reel.id"
          class="reel-slide relative mx-auto flex h-[100dvh] w-full max-w-[560px] snap-start snap-always justify-center bg-black"
          :data-index="index"
        >
          <ReelItem
            :reel="reel"
            :is-active="index === activeIndex"
            :index="index"
            @open-comments="openComments"
          />
        </div>

        <!-- Infinite Scroll Sentinel -->
        <div
          ref="sentinelRef"
          class="flex h-20 w-full snap-start items-center justify-center bg-transparent"
        >
          <Icon
            v-if="isFetching && hasMore"
            name="eos-icons:loading"
            size="24"
            class="animate-spin text-white/50"
          />
        </div>
      </template>
    </div>

    <!-- ─── MODALS ─────────────────────────────────────────────────── -->
    <PostDetailModal
      v-if="activeCommentReel"
      :post="activeCommentReel"
      @close="activeCommentReel = null"
    />
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import ReelItem from '~~/layers/feed/app/components/ReelItem.vue'
import PostDetailModal from '~~/layers/social/app/components/modals/PostDetailModal.vue'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import { useFeed } from '~~/layers/feed/app/composables/useFeed'

// ─── SEO ──────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Reels · Styli',
  description:
    'Watch immersive, full-screen fashion reels from creators and sellers.',
})

// ─── STATE & COMPOSABLES ──────────────────────────────────────────────
const { fetchReels: fetchReelsApi } = useFeed()
const LIMIT = 10

const reels = ref<IFeedItem[]>([])
const activeIndex = ref(0)
const activeCommentReel = ref<IFeedItem | null>(null)

// DOM Refs
const containerRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

// Pagination & Status
const offset = ref(0)
const hasMore = ref(true)
const isFetching = ref(false)
const pending = ref(true)
const error = ref(false)

// ─── DATA FETCHING ────────────────────────────────────────────────────
const fetchReels = async (reset = false) => {
  if (isFetching.value || (!hasMore.value && !reset)) return

  isFetching.value = true
  try {
    const targetOffset = reset ? 0 : offset.value
    const res = await fetchReelsApi(LIMIT, targetOffset)

    // Adapt to whatever your API specifically returns
    const incoming: IFeedItem[] = res?.data ?? res?.items ?? []

    if (reset) {
      reels.value = incoming
      offset.value = LIMIT
    } else {
      // Deduplicate to be safe
      const existingIds = new Set(reels.value.map((r) => r.id))
      const newItems = incoming.filter((r) => !existingIds.has(r.id))
      reels.value.push(...newItems)
      offset.value += newItems.length
    }

    hasMore.value = res?.meta?.hasMore ?? incoming.length === LIMIT
    error.value = false
  } catch (err) {
    console.error('[Reels] Failed to fetch:', err)
    error.value = true
  } finally {
    isFetching.value = false
    pending.value = false
  }
}

const refresh = () => {
  pending.value = true
  fetchReels(true)
}

const openComments = (reel: IFeedItem) => {
  activeCommentReel.value = reel
}

// ─── OBSERVERS (Auto-play & Infinite Scroll) ──────────────────────────
let feedObserver: IntersectionObserver | null = null

const setupObservers = () => {
  if (feedObserver) feedObserver.disconnect()
  if (!containerRef.value) return

  feedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 1. Infinite Scroll: If Sentinel comes into view
          if (entry.target === sentinelRef.value) {
            if (hasMore.value && !isFetching.value) {
              fetchReels()
            }
          }
          // 2. Active Reel: If a video slide comes into view (60% visible)
          else {
            const idx = entry.target.getAttribute('data-index')
            if (idx !== null) {
              activeIndex.value = parseInt(idx, 10)
            }
          }
        }
      })
    },
    {
      root: containerRef.value, // Must be the scroll container!
      threshold: 0.6, // 60% of the video must be visible to trigger auto-play
    },
  )

  // Observe Sentinel
  if (sentinelRef.value) {
    feedObserver.observe(sentinelRef.value)
  }

  // Observe Video Slides
  const slides = containerRef.value.querySelectorAll('.reel-slide')
  slides.forEach((slide) => feedObserver?.observe(slide))
}

// ─── LIFECYCLE ────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchReels(true)
  nextTick(() => setupObservers())
})

watch(
  reels,
  async () => {
    // Re-setup observers when new items are added to the DOM
    await nextTick()
    setupObservers()
  },
  { deep: true },
)

onUnmounted(() => {
  if (feedObserver) feedObserver.disconnect()
})
</script>

<style scoped>
/* Ensures exact screen height for snap scrolling.
  Uses `dvh` (Dynamic Viewport Height) so it works perfectly on mobile 
  browsers where the URL bar collapses and changes screen height.
*/
.reel-slide {
  height: 100dvh;
  width: 100%;
}

/* Hide Scrollbar but keep functionality */
.scrollbar-hide {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
