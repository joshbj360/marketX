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
      v-if="dealLoading && !dealProducts.length"
      class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <div
        v-for="n in 10"
        :key="n"
        class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
      />
    </div>

    <div
      v-else-if="!dealLoading && !dealProducts.length"
      class="py-24 text-center"
    >
      <Icon
        name="mdi:tag-heart-outline"
        size="48"
        class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
      />
      <p class="text-sm text-gray-500 dark:text-neutral-400">
        No deals right now{{ props.searchInput ? ` for "${props.searchInput}"` : '' }}
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <ProductCardMini
        v-for="product in dealProducts"
        :key="product.id"
        :product="product"
        @open-detail="emit('open-detail', $event)"
      />
    </div>

    <div ref="dealTrigger" class="mt-6 h-10" />
    <div
      v-if="dealLoading && dealProducts.length"
      class="flex justify-center py-8"
    >
      <Icon name="eos-icons:loading" size="24" class="text-brand" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { IProduct } from '~~/layers/commerce/app/types/commerce.types'
import type { Category } from '~~/shared/types/category'
import ProductCardMini from '~~/layers/commerce/app/components/ProductCardMini.vue'
import CategoryPills from '~~/layers/commerce/app/components/CategoryPills.vue'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useDiscoverFilters } from '~~/layers/commerce/app/composables/useDiscoverFilters'

const props = defineProps<{
  searchInput: string
  selectedCategory: string | null
  categories: Category[]
}>()

const emit = defineEmits<{
  'open-detail': [product: IProduct]
  'update:selectedCategory': [value: string | null]
}>()

const { filters: discoverFilters } = useDiscoverFilters()
const { fetchProducts } = useProduct()

const PROD_LIMIT = 24
const dealProducts = ref<IProduct[]>([])
const dealTotal = ref(0)
const dealLoading = ref(false)
const dealTrigger = ref<HTMLElement | null>(null)
let dealGen = 0

const dealHasMore = computed(() => dealProducts.value.length < dealTotal.value)

const loadData = async (reset = false) => {
  if (reset) {
    dealProducts.value = []
    dealTotal.value = 0
    dealGen++
    dealLoading.value = false
  }
  if (dealLoading.value) return
  dealLoading.value = true
  const gen = dealGen
  try {
    const params: any = {
      status: 'PUBLISHED',
      minDiscount: Math.max(1, discoverFilters.deals.minDiscount),
    }
    if (props.searchInput.trim()) params.search = props.searchInput.trim()
    if (props.selectedCategory) params.categorySlug = props.selectedCategory
    if (discoverFilters.deals.maxPrice != null)
      params.maxPrice = discoverFilters.deals.maxPrice
    const result = await fetchProducts({
      ...params,
      limit: PROD_LIMIT,
      offset: dealProducts.value.length,
    })
    if (gen !== dealGen) return
    dealProducts.value.push(...(result?.products ?? []))
    dealTotal.value = result?.total ?? 0
  } catch {
    //
  } finally {
    if (gen === dealGen) dealLoading.value = false
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
  () => ({ ...discoverFilters.deals }),
  () => loadData(true),
  { deep: true },
)

onMounted(() => {
  loadData()

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && dealHasMore.value) loadData()
    },
    { rootMargin: '400px' },
  )

  watch(
    dealTrigger,
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
