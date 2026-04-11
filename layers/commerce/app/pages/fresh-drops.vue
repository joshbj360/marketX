<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="true">
    <div class="mx-auto w-full max-w-5xl px-4 pb-20 md:pb-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          <Icon name="mdi:lightning-bolt-outline" size="22" class="-mt-0.5 inline text-brand" />
          {{ $t('nav.freshDrops') }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-neutral-400">New listings from the last 7 days — tomatoes from a farm, a new sneaker drop, today's bakes</p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending && products.length === 0" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800" style="aspect-ratio:3/4" />
      </div>

      <!-- Empty -->
      <div v-else-if="!pending && products.length === 0" class="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 dark:bg-rose-950/30">
          <Icon name="mdi:lightning-bolt-outline" size="40" class="text-brand" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">No new drops yet</h2>
          <p class="mt-2 max-w-sm text-sm text-gray-500 dark:text-neutral-400">Nothing was listed in the last 7 days. Check back soon.</p>
        </div>
        <NuxtLink to="/" class="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90">
          Back to Feed
        </NuxtLink>
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
            <!-- NEW badge -->
            <span class="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
              NEW
            </span>
            <!-- Deal badge -->
            <span
              v-if="product.isDeal"
              class="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white"
            >
              DEAL
            </span>
          </div>

          <!-- Info -->
          <div class="flex flex-1 flex-col p-3">
            <p class="line-clamp-2 text-xs font-semibold text-gray-800 dark:text-neutral-200">{{ product.title }}</p>
            <p class="mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500">
              {{ product.seller?.store_name || product.store_slug }}
              <span v-if="product.seller?.locationLabel" class="text-gray-300 dark:text-neutral-600"> · {{ product.seller.locationLabel }}</span>
            </p>
            <div class="mt-auto pt-2">
              <p class="text-sm font-bold text-brand">{{ formatPrice(effectivePrice(product)) }}</p>
              <p v-if="product.discount" class="text-xs text-gray-400 line-through">{{ formatPrice(product.price) }}</p>
              <DealCountdown v-if="product.isDeal && product.dealEndsAt" :ends-at="product.dealEndsAt" class="mt-1" />
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
import DealCountdown from '~~/layers/commerce/app/components/DealCountdown.vue'

useSeoMeta({
  title: 'Fresh Drops',
  description: 'New listings from stores you follow on MarketX.',
  ogTitle: 'Fresh Drops | MarketX',
})

const { formatPrice } = useCurrency()

const products = ref<any[]>([])
const pending = ref(false)
const hasMore = ref(false)
let offset = 0

const effectivePrice = (p: any) =>
  p.discount ? p.price * (1 - p.discount / 100) : p.price

const fetchDrops = async () => {
  pending.value = true
  try {
    const res: any = await $fetch('/api/feed/fresh-drops', { query: { limit: 20, offset } })
    products.value = offset === 0 ? res.data : [...products.value, ...res.data]
    hasMore.value = res.meta.hasMore
  } catch {
    // non-critical
  } finally {
    pending.value = false
  }
}

const loadMore = async () => { offset += 20; await fetchDrops() }

onMounted(fetchDrops)
</script>
