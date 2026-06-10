<template>
  <div class="mt-5">
    <CategoryPills
      v-if="props.categories.length"
      :categories="props.categories"
      :model-value="props.selectedCategory"
      class="mb-4"
      @update:model-value="emit('update:selectedCategory', $event)"
    />

    <div
      v-if="sellersLoading && !sellers.length"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
      />
    </div>

    <div
      v-else-if="!sellersLoading && !sellers.length"
      class="py-24 text-center"
    >
      <Icon
        name="mdi:store-search-outline"
        size="48"
        class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
      />
      <p class="text-sm text-gray-500 dark:text-neutral-400">
        No stores found{{ props.searchInput ? ` for "${props.searchInput}"` : '' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <NuxtLink
        v-for="seller in sellers"
        :key="seller.id"
        :to="`/sellers/profile/${seller.store_slug}`"
        class="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="relative h-20 overflow-hidden">
          <img
            :src="seller.store_banner || `https://picsum.photos/seed/${encodeURIComponent(seller.store_slug)}/400/80`"
            :alt="seller.store_name"
            class="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <!-- subtle dark scrim so the logo chip pops -->
          <div class="pointer-events-none absolute inset-0 bg-black/20" />
        </div>
        <div class="relative -mt-6 px-3 pb-4">
          <div
            class="mb-2 h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-neutral-900 dark:bg-neutral-900"
          >
            <img
              v-if="seller.store_logo"
              :src="imgAvatar(seller.store_logo)"
              :alt="seller.store_name"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-brand"
            >
              <Icon name="mdi:storefront" size="18" class="text-white" />
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
                  size="13"
                  class="shrink-0 text-blue-500"
                />
              </div>
              <p class="mt-0.5 text-[11px] text-gray-500 dark:text-neutral-400">
                {{ formatNum(seller.followers_count || 0) }} followers ·
                {{ seller._count?.products || 0 }} items
              </p>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div ref="sellerTrigger" class="mt-6 h-10" />
    <div
      v-if="sellersLoading && sellers.length"
      class="flex justify-center py-8"
    >
      <Icon name="eos-icons:loading" size="24" class="text-brand" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Category } from '~~/shared/types/category'
import CategoryPills from '~~/layers/commerce/app/components/CategoryPills.vue'
import { useDiscoverFilters } from '~~/layers/commerce/app/composables/useDiscoverFilters'
import { imgAvatar } from '~~/layers/core/app/utils/cloudinary'

const props = defineProps<{
  searchInput: string
  selectedCategory: string | null
  categories: Category[]
}>()

const emit = defineEmits<{
  'update:selectedCategory': [value: string | null]
}>()

const { filters: discoverFilters } = useDiscoverFilters()

const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const sellers = ref<any[]>([])
const sellersTotal = ref(0)
const sellersLoading = ref(false)
const sellerTrigger = ref<HTMLElement | null>(null)
let sellersGen = 0

const sellerHasMore = computed(() => sellers.value.length < sellersTotal.value)

const loadData = async (reset = false) => {
  if (reset) {
    sellers.value = []
    sellersTotal.value = 0
    sellersGen++
    sellersLoading.value = false
  }
  if (sellersLoading.value) return
  sellersLoading.value = true
  const gen = sellersGen
  try {
    const res = await $fetch<any>('/api/seller/featured', {
      params: {
        limit: 20,
        offset: sellers.value.length,
        search: props.searchInput.trim() || undefined,
        categorySlug: props.selectedCategory || undefined,
        hasDeals: discoverFilters.sellers.hasDeals || undefined,
      },
    })
    if (gen !== sellersGen) return
    if (res?.data) {
      sellers.value.push(...res.data)
      sellersTotal.value = res.meta?.total ?? res.data.length
    }
  } catch {
    //
  } finally {
    if (gen === sellersGen) sellersLoading.value = false
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.searchInput,
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => loadData(true), 350)
  },
)

watch(() => props.selectedCategory, () => loadData(true))

watch(
  () => discoverFilters.sellers.hasDeals,
  () => loadData(true),
)

onMounted(() => {
  loadData()

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && sellerHasMore.value) loadData()
    },
    { rootMargin: '400px' },
  )

  watch(
    sellerTrigger,
    (el) => {
      if (el) observer.observe(el)
    },
    { immediate: true },
  )

  onUnmounted(() => observer.disconnect())
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
