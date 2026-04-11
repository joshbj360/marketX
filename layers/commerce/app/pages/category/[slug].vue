<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="true">
    <div class="w-full pb-20 md:pb-0">
      <!-- Header -->
      <div class="mb-5">
        <NuxtLink
          to="/"
          class="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand dark:text-neutral-400"
        >
          <Icon name="mdi:arrow-left" size="16" /> All
        </NuxtLink>
        <h1 class="text-[22px] font-bold text-gray-900 dark:text-neutral-100">
          {{ categoryName }}
        </h1>
        <p
          v-if="total > 0"
          class="mt-0.5 text-[13px] text-gray-400 dark:text-neutral-500"
        >
          {{ total.toLocaleString() }} products
        </p>
      </div>

      <!-- Skeleton -->
      <div
        v-if="isLoading && !products.length"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
      >
        <div v-for="i in 10" :key="i" class="animate-pulse">
          <div
            class="mb-2 aspect-square rounded-2xl bg-gray-100 dark:bg-neutral-800"
          />
          <div
            class="mb-1.5 h-3 w-3/4 rounded bg-gray-100 dark:bg-neutral-800"
          />
          <div class="h-3 w-1/2 rounded bg-gray-100 dark:bg-neutral-800" />
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!isLoading && !products.length"
        class="flex flex-col items-center justify-center gap-3 py-24"
      >
        <Icon
          name="mdi:tag-off-outline"
          size="48"
          class="text-gray-300 dark:text-neutral-600"
        />
        <p
          class="text-[15px] font-semibold text-gray-600 dark:text-neutral-400"
        >
          No products in this category yet
        </p>
      </div>

      <!-- Grid -->
      <div
        v-else
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
      >
        <ProductCardMini
          v-for="product in products"
          :key="product.id"
          :product="product"
          @open-detail="openDetail"
          @market="marketProduct = $event"
        />
      </div>

      <!-- Infinite scroll trigger -->
      <div ref="trigger" class="mt-4 h-10" />

      <!-- Loading more -->
      <div
        v-if="isLoading && products.length > 0"
        class="flex items-center justify-center gap-2 py-6"
      >
        <Icon name="eos-icons:loading" size="20" class="text-brand" />
        <span class="text-xs text-gray-400 dark:text-neutral-500"
          >Loading more…</span
        >
      </div>
    </div>

    <ProductDetailModal
      :product="selectedProduct"
      :loading="detailLoading"
      @close="selectedProduct = null"
    />
    <ProductMarketModal
      :is-open="!!marketProduct"
      :product="marketProduct"
      @close="marketProduct = null"
    />
  </HomeLayout>
</template>

<script setup lang="ts">
import type { IProduct } from '~~/layers/commerce/app/types/commerce.types'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import ProductCardMini from '~~/layers/commerce/app/components/ProductCardMini.vue'
import ProductDetailModal from '~~/layers/commerce/app/components/modals/ProductDetailModal.vue'
import ProductMarketModal from '~~/layers/commerce/app/components/modals/ProductMarketModal.vue'
import { useProductDetail } from '~~/layers/commerce/app/composables/useProductDetail'

const route = useRoute()
const { fetchProducts, isLoading } = useProduct()
const { setCategoryPage } = useSeo()

const slug = computed(() => route.params.slug as string)
const categoryName = computed(() => {
  // Prettify slug → "womens-fashion" → "Women's Fashion"
  return slug.value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
})

watch(slug, (s) => setCategoryPage(categoryName.value, s), { immediate: true })

const products = ref<IProduct[]>([])
const total = ref(0)
const offset = ref(0)
const {
  selectedProduct,
  detailLoading,
  openProduct: openDetail,
} = useProductDetail()
const marketProduct = ref<IProduct | null>(null)
const trigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const LIMIT = 24
const hasMore = computed(() => products.value.length < total.value)

const load = async (reset = false) => {
  if (reset) {
    products.value = []
    offset.value = 0
  }
  if (isLoading.value) return
  try {
    const result = await fetchProducts({
      status: 'PUBLISHED',
      categorySlug: slug.value,
      limit: LIMIT,
      offset: offset.value,
    })
    const incoming = result?.products ?? []
    products.value.push(...incoming)
    total.value = result?.total ?? 0
    offset.value += incoming.length
  } catch {
    /* noop */
  }
}

// Re-load when slug changes (navigating between categories)
watch(slug, () => load(true))

onMounted(() => {
  load()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isLoading.value) load()
    },
    { threshold: 0.1 },
  )
  if (trigger.value) observer.observe(trigger.value)
})

onUnmounted(() => observer?.disconnect())
</script>
