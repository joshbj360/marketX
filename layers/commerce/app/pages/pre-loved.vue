<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="true">
    <div class="mx-auto w-full max-w-5xl px-4 pb-20 md:pb-6">
      <!-- Header -->
      <div class="mb-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          <Icon name="mdi:heart-circle-outline" size="22" class="-mt-0.5 inline text-pink-500" />
          {{ $t('nav.thrift') }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-neutral-400">Pre-owned items from sellers near you — new arrivals every day</p>
      </div>

      <!-- Condition filter chips -->
      <div class="mb-5 flex flex-wrap gap-2">
        <button
          v-for="c in CONDITIONS"
          :key="c.value"
          class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
          :class="selectedCondition === c.value
            ? 'border-pink-400 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
            : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'"
          @click="setCondition(c.value)"
        >
          {{ c.label }}
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending && products.length === 0" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800" style="aspect-ratio:3/4" />
      </div>

      <!-- Empty -->
      <div v-else-if="!pending && products.length === 0" class="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-pink-50 dark:bg-pink-950/30">
          <Icon name="mdi:heart-circle-outline" size="40" class="text-pink-500" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Nothing here yet</h2>
          <p class="mt-2 max-w-sm text-sm text-gray-500 dark:text-neutral-400">
            {{ selectedCondition ? 'Try a different condition filter.' : 'No pre-loved items listed yet. Check back soon.' }}
          </p>
        </div>
        <button
          v-if="selectedCondition"
          class="rounded-xl border border-pink-200 px-6 py-2.5 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
          @click="setCondition('')"
        >
          Clear filter
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/sellers/profile/${product.store_slug}/products/${product.slug}`"
          class="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
        >
          <!-- Image -->
          <div class="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-neutral-700">
            <img
              v-if="product.media?.[0]?.url"
              :src="product.media[0].url"
              :alt="product.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Icon name="mdi:image-outline" size="32" class="text-gray-300" />
            </div>
            <!-- Condition badge -->
            <span
              v-if="product.condition"
              class="absolute left-2 top-2 rounded-full bg-pink-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
            >
              {{ conditionLabel(product.condition) }}
            </span>
          </div>

          <!-- Info -->
          <div class="flex flex-1 flex-col p-3">
            <p class="line-clamp-2 text-xs font-semibold text-gray-800 dark:text-neutral-200">{{ product.title }}</p>
            <p class="mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500">{{ product.seller?.store_name || product.store_slug }}</p>
            <div class="mt-auto pt-2">
              <p class="text-sm font-bold text-brand">{{ formatPrice(product.price) }}</p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="mt-8 flex justify-center">
        <button
          class="rounded-xl border border-gray-200 px-8 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          :disabled="pending"
          @click="loadMore"
        >
          {{ pending ? $t('common.loading') : $t('affiliate.loadMore') }}
        </button>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'

useSeoMeta({
  title: 'Pre-loved',
  description: 'Discover pre-owned and thrift items from sellers on MarketX.',
  ogTitle: 'Pre-loved | MarketX',
})

const { formatPrice } = useCurrency()

const CONDITIONS = [
  { value: '', label: 'All' },
  { value: 'NEW_WITH_TAGS', label: 'New with tags' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
]

const CONDITION_LABELS: Record<string, string> = {
  NEW_WITH_TAGS: 'New w/ tags',
  LIKE_NEW: 'Like new',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
}

const conditionLabel = (val: string) => CONDITION_LABELS[val] ?? val

const products = ref<any[]>([])
const pending = ref(false)
const hasMore = ref(false)
const selectedCondition = ref('')
let offset = 0

const fetchProducts = async (reset = false) => {
  if (reset) { offset = 0; products.value = [] }
  pending.value = true
  try {
    const query: any = { limit: 20, offset }
    if (selectedCondition.value) query.condition = selectedCondition.value
    const res: any = await $fetch('/api/feed/pre-loved', { query })
    products.value = offset === 0 ? res.data : [...products.value, ...res.data]
    hasMore.value = res.meta.hasMore
  } catch {
    // non-critical
  } finally {
    pending.value = false
  }
}

const setCondition = (val: string) => {
  selectedCondition.value = val
  fetchProducts(true)
}

const loadMore = async () => { offset += 20; await fetchProducts() }

onMounted(fetchProducts)
</script>
