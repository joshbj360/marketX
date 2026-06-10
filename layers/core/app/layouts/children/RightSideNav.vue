<!-- ~~/layers/core/app/layouts/children/RightSideNav.vue -->
<template>
  <div
    class="flex h-full flex-col border-l border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- ── Search Bar ────────────────────────────────────────────────────────── -->
    <div
      class="shrink-0 border-b border-gray-200/70 p-3 dark:border-neutral-800/70"
    >
      <div ref="searchRoot" class="relative">
        <div
          class="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 transition-colors focus-within:bg-gray-50 focus-within:ring-2 focus-within:ring-brand/25 dark:bg-neutral-800 dark:focus-within:bg-neutral-700/80"
        >
          <Icon
            name="mdi:magnify"
            size="15"
            class="shrink-0 text-gray-400 dark:text-neutral-500"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search MarketX…"
            class="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-neutral-500"
            @focus="searchFocused = true"
            @keydown.escape="clearSearch"
          />
          <button v-if="searchQuery" class="shrink-0" @click="clearSearch">
            <Icon
              name="mdi:close-circle"
              size="14"
              class="text-gray-400 dark:text-neutral-500"
            />
          </button>
          <Icon
            v-else-if="searchLoading"
            name="mdi:loading"
            size="14"
            class="animate-spin text-brand"
          />
        </div>

        <!-- Search results dropdown -->
        <Transition name="search-drop">
          <div
            v-if="showSearchResults"
            class="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            <!-- Searching spinner -->
            <div
              v-if="searchLoading && !searchResults"
              class="flex items-center justify-center p-5"
            >
              <Icon name="mdi:loading" size="20" class="animate-spin text-gray-300 dark:text-neutral-600" />
            </div>

            <!-- No results -->
            <div
              v-else-if="searchResults && !hasSearchHits"
              class="p-4 text-center text-[13px] text-gray-400 dark:text-neutral-500"
            >
              No results for "{{ searchQuery }}"
            </div>

            <!-- Results -->
            <div v-else-if="searchResults" class="max-h-[400px] overflow-y-auto">
              <!-- Products -->
              <template v-if="searchResults.products?.length">
                <p class="px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">Products</p>
                <NuxtLink
                  v-for="p in searchResults.products.slice(0, 3)"
                  :key="p.id"
                  :to="`/product/${p.slug}`"
                  class="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                  @click="clearSearch"
                >
                  <div
                    class="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800"
                  >
                    <img
                      v-if="p.media?.[0]?.url"
                      :src="imgThumb(p.media[0].url) ?? p.media[0].url"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center"
                    >
                      <Icon name="mdi:shopping-outline" size="14" class="text-gray-400" />
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-medium text-gray-900 dark:text-white">{{ p.title }}</p>
                    <p class="text-[11px] text-gray-400 dark:text-neutral-500">{{ formatPrice(p.price ?? 0) }}</p>
                  </div>
                </NuxtLink>
              </template>

              <!-- Stores -->
              <template v-if="searchResults.stores?.length">
                <p class="px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">Stores</p>
                <NuxtLink
                  v-for="s in searchResults.stores.slice(0, 3)"
                  :key="s.id"
                  :to="`/sellers/profile/${s.store_slug}`"
                  class="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                  @click="clearSearch"
                >
                  <StoreAvatar
                    :store-name="s.store_name ?? undefined"
                    :logo="s.store_logo ?? undefined"
                    size="sm"
                  />
                  <p class="truncate text-[13px] font-medium text-gray-900 dark:text-white">{{ s.store_name }}</p>
                </NuxtLink>
              </template>

              <!-- People -->
              <template v-if="searchResults.users?.length">
                <p class="px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">People</p>
                <NuxtLink
                  v-for="u in searchResults.users.slice(0, 3)"
                  :key="u.id"
                  :to="`/profile/${u.username}`"
                  class="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                  @click="clearSearch"
                >
                  <Avatar :username="u.username" :avatar="u.avatar ?? undefined" size="sm" />
                  <p class="truncate text-[13px] font-medium text-gray-900 dark:text-white">@{{ u.username }}</p>
                </NuxtLink>
              </template>

              <!-- Full search page link -->
              <div class="border-t border-gray-100 p-2.5 dark:border-neutral-800">
                <NuxtLink
                  :to="`/search?q=${encodeURIComponent(searchQuery)}`"
                  class="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-semibold text-brand transition-colors hover:bg-brand/5"
                  @click="clearSearch"
                >
                  See all results
                  <Icon name="mdi:arrow-right" size="14" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── Tab Bar ───────────────────────────────────────────────────────────── -->
    <div
      class="flex shrink-0 gap-1 border-b border-gray-200 bg-gray-50/80 p-2 backdrop-blur-sm dark:border-neutral-800/50 dark:bg-neutral-900/70"
    >
      <button
        class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all"
        :class="
          activeTab === 'discover'
            ? 'border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
        "
        @click="activeTab = 'discover'"
      >
        <Icon name="mdi:compass-outline" size="17" />
        <span>Discover</span>
      </button>

      <button
        class="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-semibold transition-all"
        :class="
          activeTab === 'ai'
            ? 'bg-brand text-white shadow-sm shadow-brand/20'
            : 'text-gray-500 hover:bg-gray-100 hover:text-brand dark:text-neutral-400 dark:hover:bg-neutral-800'
        "
        @click="activeTab = 'ai'"
      >
        <div
          v-if="activeTab === 'ai'"
          class="pointer-events-none absolute inset-0 bg-white/15 blur-sm"
        />
        <Icon
          :name="activeTab === 'ai' ? 'mdi:robot-happy' : 'mdi:robot-happy-outline'"
          size="17"
          class="relative z-10"
        />
        <span class="relative z-10">MarketX AI</span>
      </button>
    </div>

    <!-- ── Discover Tab ──────────────────────────────────────────────────────── -->
    <div
      v-show="activeTab === 'discover'"
      class="custom-scrollbar flex-1 overflow-y-auto"
    >
      <div class="pb-8">

        <!-- ── Who to Follow ────────────────────────────────────────────────── -->
        <div class="border-b border-gray-100 dark:border-neutral-800">
          <div class="flex items-center justify-between px-4 pb-2 pt-4">
            <h3 class="text-[17px] font-extrabold text-gray-900 dark:text-white">Who to follow</h3>
            <NuxtLink
              to="/sellers"
              class="text-[13px] font-medium text-brand hover:underline"
            >Show more</NuxtLink>
          </div>

          <!-- Skeleton (only when no fallback data yet) -->
          <div
            v-if="loadingTrending && !whoToFollow.length"
            class="space-y-0"
          >
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center gap-3 px-4 py-3"
            >
              <div class="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
              <div class="flex-1 space-y-2">
                <div class="h-3 w-28 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                <div class="h-2.5 w-20 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              </div>
              <div class="h-7 w-16 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
            </div>
          </div>

          <!-- Seller rows (Twitter-style) -->
          <div v-else>
            <div
              v-for="seller in whoToFollow.slice(0, 5)"
              :key="seller.id"
              class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/60"
            >
              <NuxtLink
                :to="`/sellers/profile/${seller.store_slug}`"
                class="relative shrink-0"
              >
                <StoreAvatar
                  :store-name="seller.store_name ?? undefined"
                  :logo="seller.store_logo ?? undefined"
                  size="lg"
                />
                <div
                  v-if="seller.is_verified"
                  class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white dark:ring-neutral-900"
                >
                  <Icon name="mdi:check" size="10" class="text-white" />
                </div>
              </NuxtLink>

              <NuxtLink
                :to="`/sellers/profile/${seller.store_slug}`"
                class="min-w-0 flex-1"
              >
                <p class="truncate text-[13px] font-bold text-gray-900 transition-colors hover:text-brand dark:text-white">
                  {{ seller.store_name }}
                </p>
                <p class="text-[11px] text-gray-500 dark:text-neutral-400">
                  {{ formatNumber(getFollowerCount(seller)) }} followers
                </p>
              </NuxtLink>

              <ClientOnly>
                <button
                  v-if="profileStore.isLoggedIn"
                  class="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all"
                  :class="
                    followedIds.has(seller.id)
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                  "
                  @click.stop.prevent="toggleFollow(seller)"
                >
                  {{ followedIds.has(seller.id) ? 'Following' : 'Follow' }}
                </button>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- ── Flash Sales ──────────────────────────────────────────────────── -->
        <div
          v-if="loadingDeals || activeDeals.length"
          class="border-b border-gray-100 dark:border-neutral-800"
        >
          <div class="flex items-center justify-between px-4 pb-2 pt-4">
            <h3 class="text-[17px] font-extrabold text-gray-900 dark:text-white">Flash Sales</h3>
            <NuxtLink
              to="/deals"
              class="text-[13px] font-medium text-brand hover:underline"
            >See all</NuxtLink>
          </div>

          <!-- Skeleton -->
          <div v-if="loadingDeals && !hasData">
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center gap-3 px-4 py-2.5"
            >
              <div class="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-800" />
              <div class="flex-1 space-y-2">
                <div class="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                <div class="h-2.5 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                <div class="h-2 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              </div>
            </div>
          </div>

          <!-- Deal rows -->
          <div v-else>
            <NuxtLink
              v-for="deal in activeDeals.slice(0, 3)"
              :key="deal.id"
              :to="`/product/${deal.slug}`"
              class="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/60"
            >
              <div
                class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800"
              >
                <img
                  v-if="deal.media?.[0]?.url"
                  :src="imgThumb(deal.media[0].url) ?? deal.media[0].url"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <div v-else class="flex h-full w-full items-center justify-center">
                  <Icon name="mdi:tag-outline" size="18" class="text-gray-400" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-semibold text-gray-900 dark:text-white">{{ deal.title }}</p>
                <div class="mt-0.5 flex items-center gap-1.5">
                  <span class="text-[13px] font-bold text-brand">{{ formatPrice(dealPrice(deal)) }}</span>
                  <span
                    v-if="deal.discount"
                    class="rounded bg-brand/10 px-1 py-0.5 text-[10px] font-bold text-brand"
                  >-{{ Math.round(deal.discount) }}%</span>
                </div>
                <DealCountdown
                  v-if="deal.dealEndsAt"
                  :ends-at="String(deal.dealEndsAt)"
                  class="mt-0.5"
                />
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- ── What's Happening ─────────────────────────────────────────────── -->
        <div class="border-b border-gray-100 dark:border-neutral-800">
          <div class="flex items-center justify-between px-4 pb-2 pt-4">
            <h3 class="text-[17px] font-extrabold text-gray-900 dark:text-white">What's happening</h3>
          </div>

          <!-- Skeleton -->
          <div v-if="loadingTrending && !hasData" class="space-y-0">
            <div
              v-for="i in 4"
              :key="i"
              class="space-y-1.5 px-4 py-3"
            >
              <div class="h-2.5 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              <div class="h-3.5 w-32 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              <div class="h-2 w-20 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            </div>
          </div>

          <!-- Trending hashtags -->
          <div v-else>
            <div
              v-for="tag in trendingTags.slice(0, 5)"
              :key="tag.id"
              class="cursor-pointer px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/60"
              @click="navigateTo(`/discover?tag=${tag.name}`)"
            >
              <p class="text-[11px] text-gray-400 dark:text-neutral-500">Trending · Products</p>
              <p class="text-[14px] font-bold text-gray-900 dark:text-white">#{{ tag.name }}</p>
              <p class="text-[11px] text-gray-500 dark:text-neutral-400">
                {{ formatNumber(tag._count?.products ?? 0) }} products
              </p>
            </div>

            <!-- Trending products -->
            <template v-if="trendingProducts.length">
              <p class="px-4 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                Trending Products
              </p>
              <NuxtLink
                v-for="p in trendingProducts.slice(0, 3)"
                :key="p.id"
                :to="`/product/${p.slug}`"
                class="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/60"
              >
                <div
                  class="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800"
                >
                  <img
                    v-if="p.media?.[0]?.url"
                    :src="imgThumb(p.media[0].url) ?? p.media[0].url"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <Icon name="mdi:shopping-outline" size="16" class="text-gray-400" />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[13px] font-semibold text-gray-900 dark:text-white">{{ p.title }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                    {{ p.seller?.store_name ?? p.store_slug }}
                  </p>
                </div>
                <p class="shrink-0 text-[13px] font-bold text-brand">{{ formatPrice(p.price) }}</p>
              </NuxtLink>
            </template>

            <!-- Empty state -->
            <div
              v-if="!trendingTags.length && !trendingProducts.length && hasData"
              class="px-4 py-5 text-center text-[13px] text-gray-400 dark:text-neutral-500"
            >
              Nothing trending right now
            </div>
          </div>
        </div>

        <!-- ── Footer ──────────────────────────────────────────────────────── -->
        <div class="px-4 py-5 text-center">
          <div
            class="flex flex-wrap justify-center gap-x-3 gap-y-2 text-[11px] font-medium text-gray-400 dark:text-neutral-500"
          >
            <NuxtLink to="/about" class="hover:text-gray-700 dark:hover:text-neutral-300">About</NuxtLink>
            <NuxtLink to="/help" class="hover:text-gray-700 dark:hover:text-neutral-300">Help</NuxtLink>
            <NuxtLink to="/terms" class="hover:text-gray-700 dark:hover:text-neutral-300">Terms</NuxtLink>
            <NuxtLink to="/privacy" class="hover:text-gray-700 dark:hover:text-neutral-300">Privacy</NuxtLink>
            <NuxtLink to="/map" class="hover:text-gray-700 dark:hover:text-neutral-300">Near Me</NuxtLink>
          </div>
          <p class="mt-3 text-[11px] text-gray-400 dark:text-neutral-600">
            © {{ new Date().getFullYear() }} {{ $config.public.siteName || 'MarketX' }}. All rights reserved.
          </p>
        </div>

      </div>
    </div>

    <!-- ── AI Tab ────────────────────────────────────────────────────────────── -->
    <div
      v-show="activeTab === 'ai'"
      class="flex flex-1 flex-col overflow-hidden"
    >
      <ClientOnly>
        <DassaChat
          v-if="authStore.accessToken"
          :token="authStore.accessToken"
          :default-mode="profileStore.me?.role === 'SELLER' ? 'seller' : 'buyer'"
          class="flex-1"
        />
        <div
          v-else
          class="flex flex-1 items-center justify-center text-sm text-gray-400 dark:text-neutral-500"
        >
          Sign in to use DassaAI
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useAuthStore } from '~~/layers/core/app/stores/auth.store'
import { useLayoutData } from '~~/layers/core/app/composables/useLayoutData'
import { useRightSidebarData, type SidebarSeller } from '~~/layers/core/app/composables/useRightSidebarData'
import { useSocialApi } from '~~/layers/profile/app/services/social.api'
import { imgThumb } from '~~/layers/core/app/utils/cloudinary'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'
import StoreAvatar from '~~/layers/profile/app/components/StoreAvatar.vue'
import DassaChat from '~~/layers/ai/app/components/dassa/Chat.vue'
import DealCountdown from '~~/layers/commerce/app/components/DealCountdown.vue'

// ── Stores & data ─────────────────────────────────────────────────────────────

const profileStore = useProfileStore()
const authStore = useAuthStore()
const { data: layoutData } = useLayoutData()
const {
  trendingTags,
  trendingProducts,
  featuredSellers,
  activeDeals,
  loadingTrending,
  loadingDeals,
  hasData,
  load: loadSidebarData,
} = useRightSidebarData()

const activeTab = ref<'discover' | 'ai'>('discover')

// Who to follow: use fetched featuredSellers when available, fall back to layout topSellers immediately
const topSellers = computed(() => layoutData.value?.topSellers ?? [])
const whoToFollow = computed((): SidebarSeller[] =>
  featuredSellers.value.length
    ? featuredSellers.value
    : (topSellers.value as unknown as SidebarSeller[]),
)

// ── Follow state ──────────────────────────────────────────────────────────────

const socialApi = useSocialApi()
const followedIds = ref(new Set<string>())
const followerCountOverrides = ref(new Map<string, number>())

interface MinSeller {
  id: string
  store_slug: string
  followers_count?: number | null
}

const getFollowerCount = (seller: MinSeller) =>
  followerCountOverrides.value.get(seller.id) ?? seller.followers_count ?? 0

const toggleFollow = async (seller: MinSeller) => {
  const { id, store_slug: slug } = seller
  const wasFollowing = followedIds.value.has(id)
  const current = getFollowerCount(seller)

  if (wasFollowing) {
    followedIds.value.delete(id)
    followerCountOverrides.value.set(id, Math.max(0, current - 1))
  } else {
    followedIds.value.add(id)
    followerCountOverrides.value.set(id, current + 1)
  }

  try {
    if (wasFollowing) await socialApi.unfollowSeller(slug)
    else await socialApi.followSeller(slug)
  } catch {
    if (wasFollowing) {
      followedIds.value.add(id)
      followerCountOverrides.value.set(id, current)
    } else {
      followedIds.value.delete(id)
      followerCountOverrides.value.set(id, current)
    }
  }
}

// ── Search ────────────────────────────────────────────────────────────────────

interface SearchHit {
  id: string | number
  title?: string
  name?: string
  username?: string
  slug?: string
  store_slug?: string
  store_name?: string | null
  store_logo?: string | null
  avatar?: string | null
  price?: number
  media?: Array<{ url: string; type: string }>
}
interface SearchResults {
  products?: SearchHit[]
  stores?: SearchHit[]
  users?: SearchHit[]
  tags?: Array<{ id: number; name: string; _count: { products: number } }>
}

const searchRoot = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const searchFocused = ref(false)
const searchLoading = ref(false)
const searchResults = ref<SearchResults | null>(null)

const hasSearchHits = computed(() =>
  !!(
    searchResults.value?.products?.length ||
    searchResults.value?.stores?.length ||
    searchResults.value?.users?.length
  ),
)

const showSearchResults = computed(
  () => searchFocused.value && searchQuery.value.length >= 2,
)

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = null
  searchFocused.value = false
  searchLoading.value = false
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const doSearch = async (q: string) => {
  if (q.length < 2) {
    searchResults.value = null
    searchLoading.value = false
    return
  }
  searchLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; data: SearchResults }>(
      `/api/search?q=${encodeURIComponent(q)}&limit=5`,
    )
    searchResults.value = res.data ?? null
  } catch {
    searchResults.value = null
  } finally {
    searchLoading.value = false
  }
}

watch(searchQuery, (q) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!q.trim()) {
    searchResults.value = null
    searchLoading.value = false
    return
  }
  searchLoading.value = true
  debounceTimer = setTimeout(() => doSearch(q.trim()), 300)
})

const onOutsideClick = (e: MouseEvent) => {
  if (searchRoot.value && !searchRoot.value.contains(e.target as Node)) {
    searchFocused.value = false
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

const { formatPrice } = useCurrency()

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const dealPrice = (deal: { price: number; discount?: number | null }) => {
  if (!deal.discount || deal.discount <= 0) return deal.price
  return Math.round(deal.price * (1 - deal.discount / 100))
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  document.addEventListener('click', onOutsideClick)
  await loadSidebarData()
  if (profileStore.isLoggedIn) {
    try {
      const res = await socialApi.getFollowedSellerIds()
      followedIds.value = new Set(res.data ?? [])
    } catch {
      // non-critical
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
/* Custom thin scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}
.dark .custom-scrollbar {
  scrollbar-color: #4b5563 transparent;
}

/* Search dropdown transition */
.search-drop-enter-active,
.search-drop-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.search-drop-enter-from,
.search-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
