<!-- pages/index.vue -->
<template>
  <HomeLayout :narrow-feed="true">
    <!-- Initial Splash Screen -->
    <div class="w-full space-y-4 px-2 sm:px-4">
      <!-- Initial Splash Screen -->
      <Transition name="splash" mode="out-in">
        <SplashScreen
          v-if="!hasMounted || (pending && !mainFeed.length)"
          key="splash"
        />
        <div
          v-else-if="hasMounted && error"
          key="error"
          class="flex flex-col items-center justify-center gap-5 py-32 text-center"
        >
          <div class="rounded-full bg-red-50/80 p-5 dark:bg-red-950/30">
            <Icon
              name="mdi:wifi-off"
              size="48"
              class="text-red-500 dark:text-red-400"
            />
          </div>
          <div>
            <p
              class="text-lg font-semibold text-gray-800 dark:text-neutral-200"
            >
              {{ $t('feed.loadError') }}
            </p>
            <p class="mt-2 text-sm text-gray-500 dark:text-neutral-400">
              Please check your connection and try again.
            </p>
          </div>
          <button
            class="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand/90 hover:shadow-lg active:scale-95"
            @click="refresh()"
          >
            {{ $t('common.tryAgain') }}
          </button>
        </div>
      </Transition>

      <!-- Category tabs — inline on mobile, desktop uses SideNav -->
      <CategoryListMobile class="-mx-2 mb-3 sm:-mx-4" />

      <!-- Stories Section (Logged-in users only, hidden when showStories is off) -->
      <ClientOnly>
      <section
        v-if="profileStore.isLoggedIn && settings.showStories"
        class="pb-1"
      >
        <h2
          class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-500"
        >
          {{ $t('feed.todayInspo') }}
        </h2>

        <div class="relative">
          <!-- Scroll Arrows -->
          <button
            v-if="storiesScrollLeft > 0"
            aria-label="Scroll stories left"
            class="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
            @click="scrollStories('left')"
          >
            <Icon
              name="mdi:chevron-left"
              size="20"
              class="text-gray-600 dark:text-neutral-300"
            />
          </button>

          <button
            v-if="storiesCanScrollRight"
            aria-label="Scroll stories right"
            class="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
            @click="scrollStories('right')"
          >
            <Icon
              name="mdi:chevron-right"
              size="20"
              class="text-gray-600 dark:text-neutral-300"
            />
          </button>

          <!-- Stories Scroller -->
          <div
            ref="storiesScroller"
            class="scrollbar-hide flex gap-4 overflow-x-auto pb-4"
            @scroll="onStoriesScroll"
          >
            <!-- Add Story Button -->
            <div class="flex shrink-0 flex-col items-center gap-2">
              <button
                aria-label="Add your story"
                class="story-ring flex h-[70px] w-[70px] items-center justify-center rounded-full p-1 transition-all hover:scale-105 active:scale-95"
                @click="showUploadModal = true"
              >
                <div
                  class="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-neutral-900"
                >
                  <Icon name="mdi:plus" size="28" class="text-brand" />
                </div>
              </button>
              <span
                class="text-xs font-medium text-gray-500 dark:text-neutral-400"
              >
                {{ $t('feed.yourStory') }}
              </span>
            </div>

            <!-- User Stories -->
            <div
              v-for="story in stories"
              :key="story.id"
              class="group flex shrink-0 cursor-pointer flex-col items-center gap-2"
              @click="router.push(`/stories/${story.id}`)"
            >
              <div
                class="story-ring flex h-[70px] w-[70px] items-center justify-center rounded-full p-1 transition-all group-hover:scale-105 group-active:scale-95"
              >
                <img
                  :src="getMediaThumbnailUrl(story.media)"
                  :alt="story.author?.username || 'Story'"
                  class="h-full w-full rounded-full object-cover ring-2 ring-white dark:ring-neutral-950"
                />
              </div>
              <span
                class="w-[70px] truncate text-center text-xs font-medium text-gray-500 dark:text-neutral-400"
              >
                {{ story.author?.username || 'User' }}
              </span>
            </div>
          </div>
        </div>
      </section>
      </ClientOnly>

      <!-- Affiliate Program Banner (logged-in, not yet enrolled) -->
      <ClientOnly>
      <section v-if="profileStore.isLoggedIn && !isEnrolled">
        <NuxtLink
          :to="`/profile/${profileStore.me?.username}?tab=affiliate`"
          class="group flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-4 shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.99]"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20"
          >
            <Icon name="mdi:cash-multiple" size="26" class="text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-white">
              {{ $t('affiliate.joinTitle') }}
            </p>
            <p class="truncate text-[12px] text-white/80">
              {{ $t('affiliate.joinSubtitle') }}
            </p>
          </div>
          <div
            class="shrink-0 rounded-xl bg-white/20 px-3 py-1.5 text-[12px] font-bold text-white transition-colors group-hover:bg-white/30"
          >
            {{ $t('affiliate.enrollNow') }}
            <Icon name="mdi:arrow-right" size="14" class="ml-0.5 inline" />
          </div>
        </NuxtLink>
      </section>
      </ClientOnly>

      <!-- Near Me — optional via settings -->
      <section v-if="settings.showNearMe">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10"
            >
              <Icon
                name="mdi:map-marker-radius-outline"
                size="14"
                class="text-gray-500 dark:text-neutral-400"
              />
            </div>
            <h2 class="text-sm font-bold text-gray-800 dark:text-neutral-100">
              Near Me
            </h2>
          </div>
          <NuxtLink
            v-if="nearbyStores.length"
            to="/map"
            class="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            See all <Icon name="mdi:chevron-right" size="14" />
          </NuxtLink>
        </div>

        <!-- Loading skeleton -->
        <div
          v-if="nearbyLoading"
          class="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="flex shrink-0 flex-col items-center gap-2"
          >
            <div
              class="h-[60px] w-[60px] animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
            />
            <div
              class="h-2.5 w-12 animate-pulse rounded bg-gray-200 dark:bg-neutral-800"
            />
          </div>
        </div>

        <!-- Store chips -->
        <div
          v-else-if="nearbyStores.length"
          class="scrollbar-hide flex gap-3 overflow-x-auto pb-2"
        >
          <NuxtLink
            v-for="store in nearbyStores"
            :key="store.store_slug"
            :to="`/sellers/profile/${store.store_slug}`"
            class="group flex shrink-0 flex-col items-center gap-1.5 outline-none"
          >
            <div
              class="relative"
              :class="
                store.isOpenNow ? 'near-me-ring-open' : 'near-me-ring-closed'
              "
            >
              <div
                class="h-[60px] w-[60px] overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <img
                  v-if="store.store_logo"
                  :src="store.store_logo"
                  :alt="store.store_name ?? ''"
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center rounded-full bg-brand/10 text-sm font-black text-brand"
                >
                  {{
                    (store.store_name ?? store.store_slug ?? '?')
                      .slice(0, 2)
                      .toUpperCase()
                  }}
                </div>
              </div>
              <span
                v-if="store.hasActiveDeal"
                class="absolute -right-0.5 -top-0.5 rounded-full bg-brand px-1 py-px text-[8px] font-black leading-tight text-white"
                >DEAL</span
              >
            </div>
            <p
              class="w-[64px] truncate text-center text-[11px] font-semibold text-gray-700 group-hover:text-brand dark:text-neutral-300"
            >
              {{ store.store_name || store.store_slug }}
            </p>
            <p class="text-[10px] text-gray-400 dark:text-neutral-500">
              {{ store.distanceKm.toFixed(1) }}km
            </p>
          </NuxtLink>
        </div>

        <!-- No location — prompt to enable -->
        <div v-else>
          <button
            class="flex w-full items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3.5 text-left transition-colors hover:border-brand/40 hover:bg-brand/5 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-brand/30"
            :disabled="nearbyRequesting"
            @click="requestNearbyLocation"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10"
            >
              <Icon
                v-if="nearbyRequesting"
                name="mdi:loading"
                size="18"
                class="animate-spin text-brand"
              />
              <Icon
                v-else
                name="mdi:crosshairs-gps"
                size="18"
                class="text-brand"
              />
            </div>
            <div class="min-w-0">
              <p
                class="text-[13px] font-semibold text-gray-800 dark:text-neutral-200"
              >
                {{
                  nearbyRequesting
                    ? 'Getting your location…'
                    : 'See stores near you'
                }}
              </p>
              <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                Allow location to discover nearby stores
              </p>
            </div>
            <Icon
              name="mdi:chevron-right"
              size="18"
              class="ml-auto shrink-0 text-gray-300 dark:text-neutral-600"
            />
          </button>
        </div>
      </section>

      <!-- Shop Today Banner -->
      <section v-if="settings.showShopToday">
        <FeedProductShelf
          v-if="shopTodayItems.length"
          :products="shopTodayItems"
          @open-product="openProduct"
        />
        <!-- Reserve height while loading to prevent CLS -->
        <div
          v-else
          class="h-52 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        />
      </section>

      <!-- Feed tabs (desktop only) -->
      <div
        class="-mx-2 mb-4 mt-4 hidden items-center gap-1 border-b border-gray-100 px-2 pb-3 md:flex dark:border-neutral-800"
      >
        <button
          v-for="tab in FEED_TABS"
          :key="tab.id"
          class="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors"
          :class="
            activeTab === tab.id
              ? 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white'
              : 'text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100'
          "
          @click="setTab(tab.id)"
        >
          <Icon :name="tab.icon" size="14" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Main Feed — posts interleaved with product shelves every 4 cards -->
      <section class="space-y-6">
        <template v-for="(chunk, ci) in feedChunks" :key="ci">
          <template v-for="item in chunk" :key="item.id">
            <ShopProductCard
              v-if="item.type === 'PRODUCT' && item.product"
              :product="item.product"
              @mouseenter="prefetchProduct(item.product.id)"
              @touchstart.passive="prefetchProduct(item.product.id)"
              @open-detail="openProduct"
              @open-comments="commentProduct = $event"
              @market="marketProduct = $event"
            />
            <PostCard
              v-else-if="item.type === 'POST'"
              :post="item"
              @open-comments="openPostCommentsModal"
              @open-details="openPostModal"
              @deleted="removeFromFeed"
              @open-product="openProduct"
            />
          </template>

          <!-- Product shelf injected after every chunk (except the last) -->
          <FeedProductShelf
            v-if="ci < feedChunks.length - 1 && shopTodayItems.length"
            :products="shelfSlice(ci)"
            @open-product="openProduct"
          />
        </template>
      </section>

      <!-- Infinite Scroll Trigger -->
      <div ref="loadMoreTrigger" class="h-16" />

      <!-- Loading More -->
      <div
        v-if="feedStore.isLoading && mainFeed.length > 0"
        class="flex items-center justify-center gap-3 py-8"
      >
        <div
          class="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent"
        />
        <span class="text-sm text-gray-500 dark:text-neutral-400">
          {{ $t('common.loadingMore') }}
        </span>
      </div>

      <!-- End of Feed Message -->
      <div
        v-if="
          !feedStore.canLoadMore && mainFeed.length > 0 && !feedStore.isLoading
        "
        class="py-12 text-center text-sm text-gray-500 dark:text-neutral-400"
      >
        You've reached the end ✨ Keep exploring!
      </div>

      <!-- Modals -->
      <ProductCommentModal
        :is-open="!!commentProduct"
        :product="commentProduct"
        @close="commentProduct = null"
      />

      <PostCommentModal
        :is-open="!!commentPost"
        :post="commentPost"
        @close="commentPost = null"
      />

      <ProductDetailModal
        v-if="selectedProduct"
        :product="selectedProduct"
        :loading="productDetailLoading"
        @close="selectedProduct = null"
        @open-comments="
          (p) => {
            commentProduct = p
            selectedProduct = null
          }
        "
      />
      <ProductMarketModal
        :is-open="!!marketProduct"
        :product="marketProduct"
        @close="marketProduct = null"
      />

      <PostDetailModal
        v-if="selectedPost"
        :post="selectedPost"
        @close="selectedPost = null"
      />

      <StoryUploadModal
        :is-open="showUploadModal"
        @close="showUploadModal = false"
        @posted="handleStoryPosted"
      />
    </div>

    <!-- Right Sidebar Slot -->
    <template #right-sidebar>
      <RightSideNav />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from '#imports'

import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import SplashScreen from '~~/layers/feed/app/components/SplashScreen.vue'
import CategoryListMobile from '~~/layers/core/app/layouts/children/TopMobileCategory.vue'
import StoryUploadModal from '~~/layers/feed/app/components/modals/StoryUploadModal.vue'
import ProductDetailModal from '~~/layers/commerce/app/components/modals/ProductDetailModal.vue'
import PostDetailModal from '~~/layers/social/app/components/modals/PostDetailModal.vue'
import ProductMarketModal from '~~/layers/commerce/app/components/modals/ProductMarketModal.vue'
import PostCommentModal from '~~/layers/social/app/components/modals/PostCommentModal.vue'
import ProductCommentModal from '~~/layers/commerce/app/components/modals/ProductCommentModal.vue'
import ShopProductCard from '~~/layers/commerce/app/components/ShopProductCard.vue'
import FeedProductShelf from '~~/layers/feed/app/components/FeedProductShelf.vue'
import PostCard from '~~/layers/social/app/components/PostCard.vue'
import RightSideNav from '~~/layers/core/app/layouts/children/RightSideNav.vue'

import { getCachedLocation } from '~~/layers/map/app/composables/useMapSellers'
import type { IMapSeller } from '~~/layers/map/app/types/map.types'
import { useFeedTab } from '~~/layers/feed/app/composables/useFeedTab'
import { useSettings } from '~~/layers/profile/app/composables/useSettings'
import { useFeedApi } from '~~/layers/feed/app/services/feed.api'
import { useProductDetail } from '~~/layers/commerce/app/composables/useProductDetail'
import { useFeedStore } from '~~/layers/feed/app/stores/feed.stores'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useFollow } from '~~/layers/profile/app/composables/useFollow'
import { useAffiliate } from '~~/layers/commerce/app/composables/useAffiliate'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import type { IProduct } from '~~/layers/social/app/types/post.types'

const router = useRouter()
const feedStore = useFeedStore()
const profileStore = useProfileStore()
const { settings } = useSettings()
const { checkFollowingBatch } = useFollow()
const { stories, fetchStories } = useStory()
const { activeTab, setTab, FEED_TABS } = useFeedTab()
const { isEnrolled, fetchAffiliateStatus: fetchAffiliate } = useAffiliate()

// SEO
useSeo().setHomePage()

// States
const commentProduct = ref<IProduct | null>(null)
const commentPost = ref<IFeedItem | null>(null)
const {
  selectedProduct,
  detailLoading: productDetailLoading,
  openProduct,
  prefetchProduct,
} = useProductDetail()
const marketProduct = ref<IProduct | null>(null)
const selectedPost = ref<IFeedItem | null>(null)
const showUploadModal = ref(false)

// Stories scroller refs & state
const storiesScroller = ref<HTMLElement | null>(null)
const storiesScrollLeft = ref(0)
const storiesCanScrollRight = ref(false)

const onStoriesScroll = () => {
  if (!storiesScroller.value) return
  storiesScrollLeft.value = storiesScroller.value.scrollLeft
  storiesCanScrollRight.value =
    storiesScroller.value.scrollLeft + storiesScroller.value.clientWidth <
    storiesScroller.value.scrollWidth - 10
}

const scrollStories = (dir: 'left' | 'right') => {
  if (!storiesScroller.value) return
  storiesScroller.value.scrollBy({
    left: dir === 'left' ? -240 : 240,
    behavior: 'smooth',
  })
}

// Feed loading (client-only, tab-aware)
const fetchFeedForTab = async (
  tab: string,
  opts: { limit: number; offset?: number } = { limit: 20 },
) => {
  const api = useFeedApi()
  const o = { limit: opts.limit, offset: opts.offset ?? 0 }

  if (tab === 'following') {
    const res = await api.getFollowingFeed(o)
    return { items: res.items ?? [], meta: res.meta }
  }
  if (tab === 'trending') {
    const res = await api.getTrendingFeed(o)
    return { items: (res as any).items ?? [], meta: (res as any).meta }
  }
  if (tab === 'deals') {
    const res: any = await api.getDealsFeed(o)
    const items = (res.data ?? []).map((p: any) => ({
      ...p,
      type: 'PRODUCT',
      product: p,
    }))
    return {
      items,
      meta: res.meta ?? { total: items.length, hasMore: false, ...o },
    }
  }
  // for-you (default)
  const res = await api.getHomeFeed(o)
  return {
    items: (res as any).items ?? (res as any).data ?? [],
    meta: (res as any).meta,
  }
}

const pending = ref(false)
const error = ref<any>(null)

const loadTabFeed = async () => {
  pending.value = true
  error.value = null
  feedStore.setLoading(true)
  try {
    const result = await fetchFeedForTab(activeTab.value, { limit: 20 })
    feedStore.setInitialFeed(result.items, result.meta, 'main')
    if (profileStore.userId && result.items.length) {
      const authorIds: string[] = []
      const idToUsername: Record<string, string> = {}
      for (const item of result.items) {
        if (item.author?.id && item.author?.username) {
          authorIds.push(item.author.id)
          idToUsername[item.author.id] = item.author.username
        }
      }
      const unique = [...new Set(authorIds)]
      if (unique.length) checkFollowingBatch(unique, 'USER', idToUsername)
    }
  } catch (e) {
    error.value = e
  } finally {
    pending.value = false
    feedStore.setLoading(false)
  }
}

const refresh = () => loadTabFeed()

// Re-fetch when tab changes
watch(activeTab, () => {
  feedStore.setInitialFeed(
    [],
    { total: 0, hasMore: false, limit: 20, offset: 0 } as any,
    'main',
  )
  loadTabFeed()
})

const mainFeed = computed(() => feedStore.mainFeed ?? [])

// Split feed into chunks of 4 — a product shelf is injected between each chunk
const CHUNK_SIZE = 4
const feedChunks = computed(() => {
  const items = mainFeed.value
  const chunks = []
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE))
  }
  return chunks
})

// Shop Today — lazy loaded, client-side only
const shopTodayItems = ref<any[]>([])
const loadShopToday = async () => {
  try {
    const res: any = await $fetch('/api/feed/shop-today')
    shopTodayItems.value = res.data ?? []
  } catch {
    // non-critical
  }
}

// Each shelf shows a different window of 6 products so they don't all look the same
const SHELF_SIZE = 6
const shelfSlice = (chunkIndex: number) => {
  const items = shopTodayItems.value
  if (!items.length) return []
  const start = (chunkIndex * SHELF_SIZE) % items.length
  const end = start + SHELF_SIZE
  return end <= items.length
    ? items.slice(start, end)
    : [...items.slice(start), ...items.slice(0, end - items.length)]
}

// Near Me — fetch nearby stores using cached or live location
const nearbyStores = ref<IMapSeller[]>([])
const nearbyLoading = ref(false)
const nearbyRequesting = ref(false)

const fetchNearbyWithCoords = async (lat: number, lng: number) => {
  nearbyLoading.value = true
  try {
    const data: any = await $fetch('/api/map/sellers', {
      query: { lat, lng, radius: 20000, limit: 12 },
    })
    nearbyStores.value = data.data ?? []
  } catch {
    // non-critical
  } finally {
    nearbyLoading.value = false
  }
}

const loadNearbyStores = async () => {
  if (!import.meta.client) return

  // 1. Cached location — fastest path
  const cached = getCachedLocation()
  if (cached) {
    await fetchNearbyWithCoords(cached.lat, cached.lng)
    return
  }

  // 2. No cache — check permission before showing skeleton
  nearbyLoading.value = true

  const getPos = (): Promise<GeolocationPosition | null> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8000 },
      )
    })

  try {
    const perm = await navigator.permissions
      ?.query({ name: 'geolocation' })
      .catch(() => null)
    if (!perm || perm.state === 'denied') {
      nearbyLoading.value = false
      return
    }
    if (perm.state === 'granted') {
      const pos = await getPos()
      if (pos) {
        await fetchNearbyWithCoords(pos.coords.latitude, pos.coords.longitude)
      } else {
        nearbyLoading.value = false
      }
    } else {
      // prompt state — show the button instead
      nearbyLoading.value = false
    }
  } catch {
    nearbyLoading.value = false
  }
}

// User taps "See stores near you" → request permission explicitly
const requestNearbyLocation = () => {
  if (!navigator.geolocation) return
  nearbyRequesting.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      nearbyRequesting.value = false
      fetchNearbyWithCoords(pos.coords.latitude, pos.coords.longitude)
    },
    () => {
      nearbyRequesting.value = false
    },
    { enableHighAccuracy: false, timeout: 12000 },
  )
}

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

const loadMore = async () => {
  if (!feedStore.canLoadMore || feedStore.isLoading) return
  feedStore.setLoading(true)
  try {
    const result = await fetchFeedForTab(activeTab.value, {
      limit: 20,
      offset: feedStore.currentOffset,
    })
    const items = result?.items ?? []
    const meta = {
      ...(result?.meta ?? {}),
      // Trust the server's hasMore; only override if server omitted it
      hasMore: result?.meta?.hasMore ?? items.length > 0,
    }
    feedStore.appendToFeed(items, meta, 'main')
  } catch {
    // silently fail
  } finally {
    feedStore.setLoading(false)
  }
}

const hasMounted = ref(false)

onMounted(() => {
  hasMounted.value = true
  loadTabFeed()
  loadShopToday()
  loadNearbyStores()

  if (profileStore.isLoggedIn) {
    fetchAffiliate().catch(() => {})
    setTimeout(() => {
      fetchStories()
        .catch(() => {})
        .then(() => nextTick(onStoriesScroll))
    }, 1000)
  }

  observer.value = new IntersectionObserver(
    (entries) => entries[0]?.isIntersecting && loadMore(),
    { rootMargin: '300px' },
  )
})

watch(loadMoreTrigger, (el) => {
  if (el) observer.value?.observe(el)
})

onUnmounted(() => observer.value?.disconnect())

// Modal handlers
const openPostCommentsModal = (post: IFeedItem) => {
  selectedPost.value = post
}

const openPostModal = (post: IFeedItem) => {
  selectedPost.value = post
}

const removeFromFeed = (postId: string) => {
  feedStore.removeItem(postId)
}

const handleStoryPosted = async () => {
  showUploadModal.value = false
  await Promise.all([refresh(), fetchStories().catch(() => {})])
}
</script>

<style scoped>
.story-ring {
  background: linear-gradient(135deg, #f02c56, #ff9a3c, #a855f7, #9333ea);
  padding: 3px;
}

/* Near Me store rings */
.near-me-ring-open {
  padding: 2px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.near-me-ring-closed {
  padding: 2px;
  border-radius: 9999px;
  background: rgba(156, 163, 175, 0.3);
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.splash-enter-active,
.splash-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.splash-enter-from,
.splash-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
