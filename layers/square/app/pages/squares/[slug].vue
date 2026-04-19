<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="true" :custom-padding="true">
    <div class="sq-profile-wrap relative w-full pb-20 md:pb-0">

      <!-- Loading skeleton -->
      <div v-if="pending" class="animate-pulse space-y-4 pt-4">
        <div class="h-44 rounded-2xl bg-gray-100 dark:bg-neutral-800" />
        <div class="h-5 w-48 rounded-md bg-gray-100 dark:bg-neutral-800" />
        <div class="h-4 w-32 rounded-md bg-gray-100 dark:bg-neutral-800" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-24 text-center">
        <Icon name="mdi:store-off-outline" size="52" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
        <p class="text-sm font-semibold text-gray-500 dark:text-neutral-400">Square not found</p>
        <NuxtLink to="/discover?tab=squares" class="mt-4 inline-block text-xs text-brand hover:underline">Browse all squares</NuxtLink>
      </div>

      <template v-else-if="square">
        <!-- ── Banner ─────────────────────────────────────────────────────── -->
        <div class="relative h-44 overflow-hidden rounded-2xl">
          <img
            v-if="square.bannerUrl"
            :src="square.bannerUrl"
            :alt="square.name"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="h-full w-full"
            :style="`background: linear-gradient(135deg, ${square.accentColor || '#f59e0b'}55, ${square.accentColor || '#f59e0b'}11)`"
          />
          <!-- Type pill -->
          <span class="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {{ square.type === 'GEOGRAPHIC' ? '📍 Location' : '🏷️ Category' }}
          </span>
        </div>

        <!-- ── Header row ──────────────────────────────────────────────────── -->
        <div class="relative -mt-7 px-1">
          <div class="flex items-end justify-between gap-3">
            <!-- Icon -->
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-md dark:border-neutral-900 dark:bg-neutral-900"
              :style="`border-color: ${square.accentColor || '#f59e0b'}66`"
            >
              <img v-if="square.iconUrl" :src="square.iconUrl" :alt="square.name" class="h-full w-full object-cover rounded-xl" />
              <span v-else class="text-xl font-black" :style="`color: ${square.accentColor || '#f59e0b'}`">
                {{ square.name.slice(0, 2).toUpperCase() }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 pb-1">
              <button
                class="rounded-full px-5 py-2 text-sm font-bold transition-all"
                :class="isFollowing
                  ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-700/50'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/30'"
                :disabled="followLoading"
                @click="toggleFollow"
              >
                <Icon v-if="followLoading" name="eos-icons:loading" size="14" class="inline mr-1" />
                {{ isFollowing ? 'Following' : 'Follow' }}
              </button>
              <NuxtLink
                v-if="canJoin"
                :to="`/squares/${square.slug}/join`"
                class="rounded-full bg-gray-900 px-5 py-2 text-sm font-bold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
              >
                Join as Seller
              </NuxtLink>
            </div>
          </div>

          <!-- Name + location -->
          <div class="mt-3">
            <h1 class="text-xl font-black text-gray-900 dark:text-neutral-100">{{ square.name }}</h1>
            <p v-if="square.city || square.state" class="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">
              📍 {{ [square.city, square.state, square.country].filter(Boolean).join(', ') }}
            </p>
            <p v-if="square.description" class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
              {{ square.description }}
            </p>
          </div>

          <!-- Stats row -->
          <div class="mt-4 flex items-center gap-5 border-b border-gray-100 pb-4 dark:border-neutral-800">
            <div class="text-center">
              <p class="text-lg font-black text-gray-900 dark:text-neutral-100">{{ formatNum(square.memberCount || 0) }}</p>
              <p class="text-[11px] text-gray-500 dark:text-neutral-400">Sellers</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-black text-gray-900 dark:text-neutral-100">{{ formatNum(square.followerCount || 0) }}</p>
              <p class="text-[11px] text-gray-500 dark:text-neutral-400">Followers</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-black text-gray-900 dark:text-neutral-100">{{ formatNum(square.postCount || 0) }}</p>
              <p class="text-[11px] text-gray-500 dark:text-neutral-400">Posts</p>
            </div>
          </div>

          <!-- Officers row -->
          <div v-if="square.officers?.length" class="mt-4 mb-2">
            <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">Leadership</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="officer in square.officers"
                :key="officer.id"
                class="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs dark:bg-neutral-800"
              >
                <img v-if="officer.profile?.avatar" :src="officer.profile.avatar" class="h-5 w-5 rounded-full object-cover" />
                <Icon v-else name="mdi:account" size="14" class="text-gray-400" />
                <span class="font-semibold text-gray-700 dark:text-neutral-300">{{ officer.profile?.username }}</span>
                <span class="text-gray-400 dark:text-neutral-500">· {{ officerLabel(officer.role) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Feed tabs ────────────────────────────────────────────────────── -->
        <div class="mt-5">
          <div class="mb-4 flex gap-1 border-b border-gray-100 dark:border-neutral-800">
            <button
              v-for="t in feedTabs"
              :key="t.key"
              class="pb-2 pr-4 text-sm font-semibold transition-colors"
              :class="feedTab === t.key
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400'"
              @click="feedTab = t.key"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- Feed content -->
          <div v-if="feedLoading && !feedItems.length" class="space-y-4">
            <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800" />
          </div>
          <div v-else-if="!feedLoading && !feedItems.length" class="py-20 text-center">
            <Icon name="mdi:storefront-outline" size="44" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
            <p class="text-sm text-gray-500 dark:text-neutral-400">No activity in this square yet</p>
          </div>
          <div v-else class="space-y-4">
            <!-- Products tab — horizontal shelf -->
            <template v-if="feedTab === 'products'">
              <FeedProductShelf
                v-if="productItems.length"
                :products="productItems"
                :label="square.name"
                @open-product="openDetail"
              />
            </template>

            <!-- All / Posts tab — post chunks with a product shelf every 4 posts -->
            <template v-else>
              <template v-for="(chunk, ci) in postChunks" :key="ci">
                <NuxtLink
                  v-for="item in chunk"
                  :key="item.id"
                  :to="`/post/${item.id}`"
                  class="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <img
                    v-if="item.author?.avatar"
                    :src="item.author.avatar"
                    class="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  <Icon v-else name="mdi:account" size="36" class="shrink-0 text-gray-300 dark:text-neutral-600" />
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-gray-700 dark:text-neutral-300">@{{ item.author?.username }}</p>
                    <p class="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-neutral-400">{{ item.caption || item.content }}</p>
                  </div>
                </NuxtLink>

                <!-- Inject product shelf after each chunk (except the last) -->
                <FeedProductShelf
                  v-if="ci < postChunks.length - 1 && productItems.length"
                  :products="shelfSlice(ci)"
                  :label="square.name"
                  @open-product="openDetail"
                />
              </template>

              <!-- Trailing shelf if no posts at all -->
              <FeedProductShelf
                v-if="!postChunks.length && productItems.length"
                :products="productItems"
                :label="square.name"
                @open-product="openDetail"
              />
            </template>
          </div>

          <!-- Load more -->
          <div ref="feedTrigger" class="mt-6 h-6" />
          <div v-if="feedLoading && feedItems.length" class="flex justify-center py-6">
            <Icon name="eos-icons:loading" size="24" class="text-amber-500" />
          </div>
        </div>
      </template>
    </div>

    <!-- Product detail modal -->
    <ProductDetailModal
      :product="selectedProduct"
      :loading="detailLoading"
      @close="selectedProduct = null"
    />
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import FeedProductShelf from '~~/layers/feed/app/components/FeedProductShelf.vue'
import ProductDetailModal from '~~/layers/commerce/app/components/modals/ProductDetailModal.vue'
import { useProductDetail } from '~~/layers/commerce/app/composables/useProductDetail'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// ── Fetch Square ──────────────────────────────────────────────────────────────
const { data: squareData, pending, error } = await useFetch(() => `/api/squares/${slug.value}`)
const square = computed(() => (squareData.value as any)?.data)

useSeoMeta({
  title: computed(() => square.value ? `${square.value.name} Square | MarketX` : 'Square | MarketX'),
  description: computed(() => square.value?.description ?? `Discover sellers and products in ${square.value?.name} Square`),
})

// ── Follow ─────────────────────────────────────────────────────────────────────
const isFollowing = ref((squareData.value as any)?.data?.isFollowing ?? false)
const followLoading = ref(false)

const toggleFollow = async () => {
  if (followLoading.value || !square.value) return
  followLoading.value = true
  try {
    if (isFollowing.value) {
      await $fetch(`/api/squares/${square.value.slug}/follow`, { method: 'DELETE' })
      isFollowing.value = false
      if (square.value) square.value.followerCount = Math.max(0, (square.value.followerCount ?? 0) - 1)
    } else {
      await $fetch(`/api/squares/${square.value.slug}/follow`, { method: 'POST' })
      isFollowing.value = true
      if (square.value) square.value.followerCount = (square.value.followerCount ?? 0) + 1
    }
  } catch {
    //
  } finally {
    followLoading.value = false
  }
}

// Seller can join if logged in and has a seller profile
const canJoin = computed(() => !!square.value)

// ── Feed ───────────────────────────────────────────────────────────────────────
const feedTabs = [
  { key: 'all', label: 'All' },
  { key: 'posts', label: 'Posts' },
  { key: 'products', label: 'Products' },
]
const feedTab = ref<'all' | 'posts' | 'products'>('all')
const feedItems = ref<any[]>([])
const feedTotal = ref(0)
const feedLoading = ref(false)
const feedTrigger = ref<HTMLElement | null>(null)
const feedOffset = ref(0)
const FEED_LIMIT = 20

const loadFeed = async (reset = false) => {
  if (!square.value) return
  if (reset) { feedItems.value = []; feedTotal.value = 0; feedOffset.value = 0 }
  if (feedLoading.value) return
  feedLoading.value = true
  try {
    const res = await $fetch<any>(`/api/feed/squares/${square.value.slug}`, {
      params: { limit: FEED_LIMIT, offset: feedOffset.value, type: feedTab.value },
    })
    const items = res?.data?.items ?? []
    feedItems.value.push(...items)
    feedTotal.value = res?.data?.meta?.total ?? feedItems.value.length
    feedOffset.value += items.length
  } catch {
    //
  } finally {
    feedLoading.value = false
  }
}

const feedHasMore = computed(() => feedOffset.value < feedTotal.value)

// Split feed items by type for display
const productItems = computed(() =>
  feedItems.value
    .filter((i) => i.type === 'PRODUCT' && i.product)
    .map((i) => i.product),
)

const postItems = computed(() =>
  feedItems.value.filter((i) => i.type === 'POST'),
)

// Chunk posts into groups of 4 — a product shelf is injected between each chunk
const CHUNK_SIZE = 4
const postChunks = computed(() => {
  const items = postItems.value
  const chunks = []
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE))
  }
  return chunks
})

// Rotate through products so each shelf slot shows different items
const SHELF_SIZE = 6
const shelfSlice = (chunkIndex: number) => {
  const items = productItems.value
  if (!items.length) return []
  const start = (chunkIndex * SHELF_SIZE) % items.length
  const end = start + SHELF_SIZE
  return end <= items.length
    ? items.slice(start, end)
    : [...items.slice(start), ...items.slice(0, end - items.length)]
}

watch(feedTab, () => loadFeed(true))
watch(square, (sq) => { if (sq) loadFeed() }, { immediate: true })

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && feedHasMore.value) loadFeed()
    },
    { rootMargin: '300px' },
  )
  watchEffect(() => {
    if (feedTrigger.value) observer.observe(feedTrigger.value)
  })
  onUnmounted(() => observer.disconnect())
})

// ── Product detail ────────────────────────────────────────────────────────────
const { selectedProduct, detailLoading, openProduct: openDetail } = useProductDetail()

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const officerLabel = (role: string) => ({
  CHAIRMAN: 'Chairman',
  SECRETARY: 'Secretary',
  TREASURER: 'Treasurer',
  MODERATOR: 'Moderator',
  GOVT_REP: 'Govt Rep',
}[role] ?? role)
</script>

<style scoped>
.sq-profile-wrap {
  padding-top: calc(3.5rem + env(safe-area-inset-top, 0px));
}
@media (min-width: 768px) {
  .sq-profile-wrap { padding-top: 0; }
}
</style>
