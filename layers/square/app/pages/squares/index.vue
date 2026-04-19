<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="true" :custom-padding="true">
    <div class="mx-auto max-w-5xl pb-20 pt-6 md:pb-0 lg:px-4">

      <!-- Page header -->
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Market Squares
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            Localised communities of shops and buyers — find yours.
          </p>
        </div>
        <!-- Map shortcut -->
        <NuxtLink
          to="/map"
          class="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-brand/30 hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
        >
          <Icon name="mdi:map-marker-radius-outline" size="16" />
          View on Map
        </NuxtLink>
      </div>

      <!-- Search bar -->
      <div class="relative mb-6">
        <Icon
          name="mdi:magnify"
          size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Search squares by name, city, or category…"
          class="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500"
        />
      </div>

      <!-- Type filter tabs -->
      <div class="mb-6 flex items-center gap-2">
        <button
          v-for="tab in TABS"
          :key="tab.value"
          class="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
          :class="
            activeType === tab.value
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
          "
          @click="activeType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading skeletons -->
      <div v-if="pending" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 6"
          :key="i"
          class="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="h-28 bg-gray-100 dark:bg-neutral-800" />
          <div class="p-4 space-y-2">
            <div class="h-4 w-3/4 rounded-md bg-gray-100 dark:bg-neutral-800" />
            <div class="h-3 w-1/2 rounded-md bg-gray-100 dark:bg-neutral-800" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-24 text-center">
        <Icon name="mdi:store-off-outline" size="52" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
        <p class="text-sm text-gray-500 dark:text-neutral-400">Failed to load squares. Please try again.</p>
        <button class="mt-4 text-xs font-semibold text-brand hover:underline" @click="refresh()">Retry</button>
      </div>

      <template v-else>
        <!-- Geographic squares -->
        <section v-if="geoSquares.length && activeType !== 'CATEGORY'" class="mb-8">
          <div class="mb-3 flex items-center gap-2">
            <Icon name="mdi:map-marker" size="16" class="text-amber-500" />
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-500">
              Location Communities
            </h2>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SquareCard
              v-for="sq in geoSquares"
              :key="sq.id"
              :square="sq"
              :following="following.has(sq.id)"
              :follow-loading="followLoading.has(sq.id)"
              @toggle-follow="toggleFollow(sq)"
            />
          </div>
        </section>

        <!-- Category squares -->
        <section v-if="catSquares.length && activeType !== 'GEOGRAPHIC'">
          <div class="mb-3 flex items-center gap-2">
            <Icon name="mdi:tag-multiple-outline" size="16" class="text-purple-500" />
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-500">
              Category Communities
            </h2>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SquareCard
              v-for="sq in catSquares"
              :key="sq.id"
              :square="sq"
              :following="following.has(sq.id)"
              :follow-loading="followLoading.has(sq.id)"
              @toggle-follow="toggleFollow(sq)"
            />
          </div>
        </section>

        <!-- Empty state -->
        <div
          v-if="!geoSquares.length && !catSquares.length"
          class="py-24 text-center"
        >
          <Icon name="mdi:storefront-outline" size="52" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
          <p class="text-sm font-semibold text-gray-500 dark:text-neutral-400">No squares found</p>
          <p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">Try a different search or check back later</p>
        </div>

        <!-- Load more -->
        <div v-if="hasMore" ref="loadMoreTrigger" class="mt-6 flex justify-center">
          <button
            class="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-brand/30 hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
            :disabled="loadingMore"
            @click="loadMore"
          >
            <Icon v-if="loadingMore" name="mdi:loading" size="16" class="mr-1.5 inline animate-spin" />
            Load more
          </button>
        </div>
      </template>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import SquareCard from '../../components/SquareCard.vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'

useSeoMeta({
  title: 'Market Squares — MarketX',
  description: 'Localised communities of shops and buyers. Find your market square.',
})

const profileStore = useProfileStore()

// ── Filters ──────────────────────────────────────────────────────────────────
const TABS = [
  { label: 'All', value: '' },
  { label: '📍 Location', value: 'GEOGRAPHIC' },
  { label: '🏷️ Category', value: 'CATEGORY' },
]
const activeType = ref('')
const search = ref('')

// ── Fetch ─────────────────────────────────────────────────────────────────────
const limit = 30
const offset = ref(0)
const allSquares = ref<any[]>([])
const total = ref(0)
const loadingMore = ref(false)

const queryParams = computed(() => ({
  limit,
  offset: 0,
  ...(activeType.value ? { type: activeType.value } : {}),
  ...(search.value.trim() ? { search: search.value.trim() } : {}),
}))

const { data, pending, error, refresh } = await useFetch('/api/squares', {
  query: queryParams,
  watch: [queryParams],
  onResponse({ response }) {
    allSquares.value = response._data?.data ?? []
    total.value = response._data?.meta?.total ?? 0
    offset.value = allSquares.value.length
  },
})

// Sync initial data
watch(data, (d: any) => {
  if (d?.data) {
    allSquares.value = d.data
    total.value = d.meta?.total ?? 0
    offset.value = allSquares.value.length
  }
}, { immediate: true })

const hasMore = computed(() => allSquares.value.length < total.value)

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const res: any = await $fetch('/api/squares', {
      query: {
        ...queryParams.value,
        offset: offset.value,
      },
    })
    allSquares.value = [...allSquares.value, ...(res.data ?? [])]
    total.value = res.meta?.total ?? total.value
    offset.value = allSquares.value.length
  } finally {
    loadingMore.value = false
  }
}

// ── Split by type ─────────────────────────────────────────────────────────────
const geoSquares = computed(() =>
  allSquares.value.filter((s) => s.type === 'GEOGRAPHIC'),
)
const catSquares = computed(() =>
  allSquares.value.filter((s) => s.type === 'CATEGORY'),
)

// ── Follow state ─────────────────────────────────────────────────────────────
const following = ref<Set<string>>(new Set())
const followLoading = ref<Set<string>>(new Set())

const toggleFollow = async (sq: any) => {
  if (!profileStore.isLoggedIn) {
    navigateTo('/user-login')
    return
  }
  const alreadyFollowing = following.value.has(sq.id)
  following.value = new Set(following.value)
  alreadyFollowing ? following.value.delete(sq.id) : following.value.add(sq.id)
  followLoading.value = new Set([...followLoading.value, sq.id])
  try {
    await $fetch(`/api/squares/${sq.slug}/follow`, {
      method: alreadyFollowing ? 'DELETE' : 'POST',
    })
  } catch {
    // revert on error
    following.value = new Set(following.value)
    alreadyFollowing ? following.value.add(sq.id) : following.value.delete(sq.id)
  } finally {
    followLoading.value = new Set([...followLoading.value].filter((id) => id !== sq.id))
  }
}

// Debounce search
let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    offset.value = 0
    allSquares.value = []
  }, 350)
})
</script>
