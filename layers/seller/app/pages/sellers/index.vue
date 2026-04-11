<template>
  <HomeLayout :narrow-feed="false">
    <div class="space-y-6 pb-20 md:pb-6">
      <!-- Page Header -->
      <section
        class="rounded-2xl border border-gray-100 bg-white py-8 text-center dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-neutral-100">
          Discover Stores
        </h1>
        <p class="text-sm text-gray-500 dark:text-neutral-400">
          Follow your favorite creators and get inspired by their style.
        </p>
      </section>

      <!-- Search -->
      <div class="relative">
        <Icon
          name="mdi:magnify"
          size="18"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search stores…"
          class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm transition-all focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/10 dark:border-neutral-800 dark:bg-neutral-900"
        />
      </div>

      <!-- Loading Skeleton -->
      <div
        v-if="isLoading && !sellers.length"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="h-52 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        />
      </div>

      <!-- Error -->
      <div
        v-else-if="loadError"
        class="py-16 text-center text-sm text-red-500 dark:text-red-400"
      >
        Failed to load stores.
        <button @click="load(true)" class="font-semibold underline">
          Try again
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="!isLoading && !sellers.length" class="py-16 text-center">
        <Icon
          name="mdi:store-search-outline"
          size="64"
          class="mx-auto mb-4 text-gray-300 dark:text-neutral-700"
        />
        <h2 class="text-lg font-semibold text-gray-700 dark:text-neutral-300">
          No stores found
        </h2>
        <p
          v-if="searchQuery"
          class="mt-1 text-sm text-gray-500 dark:text-neutral-500"
        >
          Try a different search term.
        </p>
      </div>

      <!-- Store Grid -->
      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <NuxtLink
          v-for="seller in sellers"
          :key="seller.id"
          :to="`/sellers/profile/${seller.store_slug}`"
          class="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <!-- Banner -->
          <div
            class="relative h-20 overflow-hidden bg-gradient-to-br from-brand to-brand-dark"
          >
            <img
              v-if="seller.store_banner"
              :src="seller.store_banner"
              :alt="seller.store_name"
              class="h-full w-full object-cover opacity-80"
            />
          </div>

          <div class="relative -mt-6 px-3 pb-3">
            <!-- Logo -->
            <div
              class="mb-2 h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-neutral-900 dark:bg-neutral-900"
            >
              <img
                v-if="seller.store_logo"
                :src="seller.store_logo"
                :alt="seller.store_name"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-brand"
              >
                <Icon name="mdi:storefront" size="20" class="text-white" />
              </div>
            </div>

            <div class="flex items-start justify-between gap-1">
              <div class="min-w-0">
                <div class="flex items-center gap-1">
                  <p
                    class="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-brand dark:text-neutral-100"
                  >
                    {{ seller.store_name }}
                  </p>
                  <Icon
                    v-if="seller.is_verified"
                    name="mdi:check-decagram"
                    size="14"
                    class="shrink-0 text-blue-500"
                  />
                </div>
                <p
                  class="mt-0.5 text-[11px] text-gray-500 dark:text-neutral-400"
                >
                  {{ formatNumber(seller.followers_count || 0) }} followers ·
                  {{ seller._count?.products || 0 }} items
                </p>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Load More -->
      <div ref="loadMoreTrigger" class="h-10" />
      <div v-if="isLoadingMore" class="flex justify-center py-4">
        <Icon name="eos-icons:loading" size="28" class="text-brand" />
      </div>
    </div>

    <template #left-sidebar>
      <!-- The layout handles this -->
    </template>

    <!-- Right Sidebar -->
    <template #right-sidebar>
      <RightSideNavSeller />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import RightSideNavSeller from '~~/layers/core/app/layouts/children/RightSideNavSeller.vue'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'

const LIMIT = 12

const sellers = ref<any[]>([])
const total = ref(0)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const loadError = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const searchQuery = ref('')
let debounce: ReturnType<typeof setTimeout> | null = null

const hasMore = computed(() => sellers.value.length < total.value)

const load = async (reset = false) => {
  if (reset) {
    sellers.value = []
    total.value = 0
  }
  if (isLoading.value || isLoadingMore.value) return
  loadError.value = false

  const isFirst = sellers.value.length === 0
  if (isFirst) isLoading.value = true
  else isLoadingMore.value = true

  try {
    const res = await $fetch<any>('/api/seller/featured', {
      params: {
        limit: LIMIT,
        offset: sellers.value.length,
        search: searchQuery.value || undefined,
      },
    })
    if (res?.data) {
      sellers.value.push(...res.data)
      total.value = res.meta?.total ?? res.data.length
    }
  } catch {
    loadError.value = true
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

watch(searchQuery, (val) => {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(() => load(true), 350)
})

onMounted(() => {
  load()

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value) load()
    },
    { rootMargin: '200px' },
  )
  watchEffect(() => {
    if (loadMoreTrigger.value) observer.observe(loadMoreTrigger.value)
  })
  onUnmounted(() => observer.disconnect())
})

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
</script>
