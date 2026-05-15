<template>
  <div class="mt-5">
    <CategoryPills
      v-if="props.categories.length"
      :categories="props.categories"
      :model-value="props.selectedCategory"
      class="mb-3"
      @update:model-value="emit('update:selectedCategory', $event)"
    />

    <div class="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="f in productFilters"
        :key="f.key"
        class="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all"
        :class="
          productFilter === f.key
            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
            : 'border border-gray-200 text-gray-600 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-400'
        "
        @click="productFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <div
      v-if="productsLoading && !products.length"
      class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <div
        v-for="n in 10"
        :key="n"
        class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
      />
    </div>

    <div
      v-else-if="!productsLoading && !products.length"
      class="py-24 text-center"
    >
      <Icon
        name="mdi:text-search"
        size="48"
        class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
      />
      <p class="text-sm text-gray-500 dark:text-neutral-400">
        No products found{{ props.searchInput ? ` for "${props.searchInput}"` : '' }}
      </p>
      <button
        v-if="props.searchInput"
        class="mt-3 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        @click="emit('clear-search')"
      >
        Clear search
      </button>
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <ProductCardMini
        v-for="product in products"
        :key="product.id"
        :product="product"
        @open-detail="emit('open-detail', $event)"
      />
    </div>

    <div ref="productTrigger" class="mt-6 h-10" />
    <div
      v-if="productsLoading && products.length"
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
  'clear-search': []
}>()

const { filters: discoverFilters } = useDiscoverFilters()
const { fetchProducts } = useProduct()

const productFilters = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New Arrivals' },
  { key: 'thrift', label: 'Thrift' },
  { key: 'deals', label: 'On Sale' },
]

const PROD_LIMIT = 24
const productFilter = ref('all')
const products = ref<IProduct[]>([])
const productsTotal = ref(0)
const productsLoading = ref(false)
const productTrigger = ref<HTMLElement | null>(null)
let productsGen = 0

const productHasMore = computed(() => products.value.length < productsTotal.value)

const loadData = async (reset = false) => {
  if (reset) {
    products.value = []
    productsTotal.value = 0
    productsGen++
    productsLoading.value = false
  }
  if (productsLoading.value) return
  productsLoading.value = true
  const gen = productsGen
  try {
    const params: any = { status: 'PUBLISHED' }
    if (props.searchInput.trim()) params.search = props.searchInput.trim()
    if (productFilter.value === 'thrift') params.isThrift = true
    if (productFilter.value === 'deals') params.minDiscount = 1
    if (props.selectedCategory) params.categorySlug = props.selectedCategory
    if (discoverFilters.products.sortBy !== 'newest')
      params.sortBy = discoverFilters.products.sortBy
    if (discoverFilters.products.minPrice != null)
      params.minPrice = discoverFilters.products.minPrice
    if (discoverFilters.products.maxPrice != null)
      params.maxPrice = discoverFilters.products.maxPrice
    const result = await fetchProducts({
      ...params,
      limit: PROD_LIMIT,
      offset: products.value.length,
    })
    if (gen !== productsGen) return
    products.value.push(...(result?.products ?? []))
    productsTotal.value = result?.total ?? 0
  } catch {
    //
  } finally {
    if (gen === productsGen) productsLoading.value = false
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
watch(productFilter, () => loadData(true))

watch(
  () => ({ ...discoverFilters.products }),
  () => loadData(true),
  { deep: true },
)

onMounted(() => {
  loadData()

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && productHasMore.value) loadData()
    },
    { rootMargin: '400px' },
  )

  watch(
    productTrigger,
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
