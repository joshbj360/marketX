<template>
  <div class="mt-5 space-y-8">
    <!-- Horizontal strips -->
    <section>
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="mdi:lightning-bolt" size="18" class="text-amber-400" />
          <h2
            class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
          >
            Fresh Drops
          </h2>
        </div>
        <button
          class="text-xs font-semibold text-brand hover:underline"
          @click="activeTab = 'fresh'"
        >
          See all →
        </button>
      </div>
      <div class="scroll-strip-wrap">
        <div
          v-if="stripsLoading && !freshStrip.length"
          class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800"
          />
        </div>
        <div
          v-else-if="freshStrip.length"
          class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2"
        >
          <div
            v-for="product in freshStrip"
            :key="product.id"
            class="w-40 shrink-0 snap-start"
          >
            <ProductCardMini :product="product" @open-detail="emit('open-detail', $event)" />
          </div>
        </div>
        <div class="scroll-fade-right" />
      </div>
    </section>

    <section>
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="mdi:tag-heart-outline" size="18" class="text-brand" />
          <h2
            class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
          >
            Hot Deals
          </h2>
        </div>
        <button
          class="text-xs font-semibold text-brand hover:underline"
          @click="activeTab = 'deals'"
        >
          See all →
        </button>
      </div>
      <div class="scroll-strip-wrap">
        <div
          v-if="stripsLoading && !dealStrip.length"
          class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800"
          />
        </div>
        <div
          v-else-if="dealStrip.length"
          class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2"
        >
          <div
            v-for="product in dealStrip"
            :key="product.id"
            class="w-40 shrink-0 snap-start"
          >
            <ProductCardMini :product="product" @open-detail="emit('open-detail', $event)" />
          </div>
        </div>
        <div class="scroll-fade-right" />
      </div>
    </section>

    <section>
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon name="mdi:recycle" size="18" class="text-emerald-500" />
          <h2
            class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
          >
            Pre-loved
          </h2>
        </div>
        <button
          class="text-xs font-semibold text-brand hover:underline"
          @click="activeTab = 'preloved'"
        >
          See all →
        </button>
      </div>
      <div class="scroll-strip-wrap">
        <div
          v-if="stripsLoading && !prelovedStrip.length"
          class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800"
          />
        </div>
        <div
          v-else-if="prelovedStrip.length"
          class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2"
        >
          <div
            v-for="product in prelovedStrip"
            :key="product.id"
            class="w-40 shrink-0 snap-start"
          >
            <ProductCardMini :product="product" @open-detail="emit('open-detail', $event)" />
          </div>
        </div>
        <div class="scroll-fade-right" />
      </div>
    </section>

    <!-- Trending main content -->
    <div v-if="trendingLoading" class="space-y-8">
      <div class="flex gap-2 overflow-x-auto pb-1">
        <div
          v-for="n in 10"
          :key="n"
          class="h-8 w-20 shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-neutral-800"
        />
      </div>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="n in 8"
          :key="n"
          class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        />
      </div>
    </div>

    <template v-else>
      <section v-if="trendingTags.length">
        <div class="mb-3 flex items-center gap-2">
          <Icon name="mdi:fire" size="18" class="text-orange-500" />
          <h2
            class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
          >
            Trending Tags
          </h2>
        </div>
        <div
          class="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          <button
            v-for="tag in trendingTags"
            :key="tag.id"
            class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-700 transition-all hover:border-brand/40 hover:bg-brand/5 hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-brand/50 dark:hover:text-brand"
            @click="navigateTo({ query: { tagName: tag.name } }, { replace: true })"
          >
            <span class="text-gray-400 dark:text-neutral-500">#</span>
            {{ tag.name }}
            <span
              class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500 dark:bg-neutral-800 dark:text-neutral-400"
              >{{ tag._count.products }}</span
            >
          </button>
        </div>
      </section>

      <section v-if="trendingProducts.length">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="mdi:trending-up" size="18" class="text-brand" />
            <h2
              class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
            >
              Hot Right Now
            </h2>
          </div>
          <button
            class="text-xs font-semibold text-brand hover:underline"
            @click="activeTab = 'products'"
          >
            See all →
          </button>
        </div>
        <div
          class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <ProductCardMini
            v-for="product in trendingProducts"
            :key="product.id"
            :product="product"
            @open-detail="emit('open-detail', $event)"
          />
        </div>
      </section>

      <section v-if="featuredSellers.length">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="mdi:store-check-outline" size="18" class="text-brand" />
            <h2
              class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
            >
              Top Stores
            </h2>
          </div>
          <button
            class="text-xs font-semibold text-brand hover:underline"
            @click="activeTab = 'sellers'"
          >
            See all →
          </button>
        </div>
        <!-- Mobile: horizontal scroll strip -->
        <div class="scroll-strip-wrap md:hidden">
          <div
            class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
          >
            <NuxtLink
              v-for="seller in featuredSellers"
              :key="seller.id"
              :to="`/sellers/profile/${seller.store_slug}`"
              class="group flex w-[100px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 text-center transition-all dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div
                class="h-14 w-14 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <img
                  v-if="seller.store_logo"
                  :src="seller.store_logo"
                  :alt="seller.store_name"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-purple-600"
                >
                  <Icon name="mdi:storefront" size="20" class="text-white" />
                </div>
              </div>
              <div class="w-full min-w-0">
                <p
                  class="truncate text-[11px] font-bold text-gray-900 group-hover:text-brand dark:text-neutral-100"
                >
                  {{ seller.store_name }}
                </p>
                <p class="text-[10px] text-gray-400 dark:text-neutral-500">
                  {{ formatNum(seller.followers_count || 0) }} followers
                </p>
              </div>
            </NuxtLink>
          </div>
          <div class="scroll-fade-right" />
        </div>
        <!-- Desktop grid -->
        <div class="hidden gap-3 sm:grid-cols-3 md:grid lg:grid-cols-6">
          <NuxtLink
            v-for="seller in featuredSellers"
            :key="seller.id"
            :to="`/sellers/profile/${seller.store_slug}`"
            class="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div
              class="h-14 w-14 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <img
                v-if="seller.store_logo"
                :src="seller.store_logo"
                :alt="seller.store_name"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-purple-600"
              >
                <Icon name="mdi:storefront" size="22" class="text-white" />
              </div>
            </div>
            <div class="w-full min-w-0">
              <p
                class="truncate text-xs font-bold text-gray-900 transition-colors group-hover:text-brand dark:text-neutral-100"
              >
                {{ seller.store_name }}
              </p>
              <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                {{ formatNum(seller.followers_count || 0) }} followers
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <div
        v-if="
          !trendingProducts.length &&
          !trendingTags.length &&
          !featuredSellers.length
        "
        class="py-24 text-center"
      >
        <Icon
          name="mdi:fire-off"
          size="48"
          class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
        />
        <p class="text-sm text-gray-500 dark:text-neutral-400">
          Nothing trending yet
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { IProduct } from '~~/layers/commerce/app/types/commerce.types'
import ProductCardMini from '~~/layers/commerce/app/components/ProductCardMini.vue'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useDiscoverFilters } from '~~/layers/commerce/app/composables/useDiscoverFilters'

const emit = defineEmits<{
  'open-detail': [product: IProduct]
}>()

const { activeTab, filters: discoverFilters } = useDiscoverFilters()
const { fetchProducts } = useProduct()

const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const trendingLoading = ref(false)
const trendingProducts = ref<IProduct[]>([])
const trendingTags = ref<any[]>([])
const featuredSellers = ref<any[]>([])

const freshStrip = ref<IProduct[]>([])
const dealStrip = ref<IProduct[]>([])
const prelovedStrip = ref<IProduct[]>([])
const stripsLoading = ref(false)

const loadTrending = async () => {
  trendingLoading.value = true
  try {
    const res = await $fetch<any>('/api/feed/trending')
    if (res?.data) {
      trendingProducts.value = res.data.trendingProducts ?? []
      trendingTags.value = res.data.trendingTags ?? []
      featuredSellers.value = res.data.featuredSellers ?? []
    }
  } catch {
    //
  } finally {
    trendingLoading.value = false
  }
}

const loadStrips = async () => {
  stripsLoading.value = true
  const [fresh, deals, preloved] = await Promise.allSettled([
    fetchProducts({ status: 'PUBLISHED', limit: 10, offset: 0 }),
    fetchProducts({ status: 'PUBLISHED', limit: 10, offset: 0, minDiscount: 1 }),
    fetchProducts({ status: 'PUBLISHED', limit: 10, offset: 0, isThrift: true }),
  ])
  freshStrip.value =
    fresh.status === 'fulfilled' ? (fresh.value?.products ?? []) : []
  dealStrip.value =
    deals.status === 'fulfilled' ? (deals.value?.products ?? []) : []
  prelovedStrip.value =
    preloved.status === 'fulfilled' ? (preloved.value?.products ?? []) : []
  stripsLoading.value = false
}

watch(
  () => discoverFilters.trending.timeRange,
  () => loadTrending(),
)

onMounted(() => {
  loadTrending()
  loadStrips()
})
</script>

<style scoped>
.scroll-strip-wrap {
  position: relative;
}

.scroll-fade-right {
  position: absolute;
  top: 0;
  right: -1px;
  bottom: 4px;
  width: 52px;
  pointer-events: none;
  background: linear-gradient(to right, transparent, #f9fafb);
}

:global(.dark) .scroll-fade-right {
  background: linear-gradient(to right, transparent, #030712);
}
</style>
