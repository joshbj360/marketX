<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div
      class="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-neutral-900"
    >
      <!-- Header -->
      <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Tag Products
          </h3>
          <button
            @click="$emit('select', selectedProducts)"
            class="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-[#d81b36]"
          >
            Done
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <Icon
            name="mdi:magnify"
            size="20"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full rounded-lg bg-gray-50 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>

      <!-- Products List -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isLoading" class="py-8 text-center">
          <Icon
            name="eos-icons:loading"
            size="32"
            class="animate-spin text-brand"
          />
        </div>

        <div
          v-else-if="filteredProducts.length === 0"
          class="py-8 text-center text-gray-500 dark:text-neutral-400"
        >
          No products found
        </div>

        <div v-else class="grid grid-cols-2 gap-3">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            @click="toggleProduct(product)"
            class="relative overflow-hidden rounded-lg border-2 text-left transition-all"
            :class="
              isSelected(product.id)
                ? 'border-brand ring-2 ring-brand/20'
                : 'border-gray-200 hover:border-brand/50 dark:border-neutral-700'
            "
          >
            <div
              class="aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-800"
            >
              <img
                v-if="getProductImage(product)"
                :src="getProductImage(product)"
                :alt="product.title"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Icon
                  name="mdi:image-outline"
                  size="40"
                  class="text-gray-300"
                />
              </div>
            </div>
            <div class="bg-white p-2 dark:bg-neutral-800">
              <p
                class="truncate text-sm font-medium text-gray-900 dark:text-neutral-100"
              >
                {{ product.title }}
              </p>
              <p class="text-xs text-gray-600 dark:text-neutral-400">
                {{ formatPrice(product.price) }}
              </p>
            </div>
            <div
              v-if="isSelected(product.id)"
              class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand"
            >
              <Icon name="mdi:check" size="16" class="text-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'

const props = defineProps<{ selected: any[] }>()
const emit = defineEmits(['select', 'close'])

const { fetchSellerProducts, isLoading } = useProduct()
const sellerStore = useSellerStore()

const searchQuery = ref('')
const selectedProducts = ref([...props.selected])
const products = ref<any[]>([])

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const getProductImage = (product: any) => {
  if (product.media?.length) return product.media[0].url
  return null
}

import { formatProductPrice } from '~~/shared/utils/currency'
const formatPrice = (price: number) => formatProductPrice(price, 'NGN')

const isSelected = (productId: number) =>
  selectedProducts.value.some((p) => p.id === productId)

const toggleProduct = (product: any) => {
  if (isSelected(product.id)) {
    selectedProducts.value = selectedProducts.value.filter(
      (p) => p.id !== product.id,
    )
  } else {
    selectedProducts.value.push({
      id: product.id,
      name: product.title,
      price: product.price,
      thumbnail: product.media?.[0]?.url ?? null,
    })
  }
}

onMounted(async () => {
  const storeSlug = sellerStore.sellers?.[0]?.store_slug
  if (!storeSlug) return
  try {
    const result: any = await fetchSellerProducts(storeSlug, {
      status: 'PUBLISHED',
      limit: 100,
    })
    products.value = result?.products || []
  } catch {
    // Not a seller or no products
  }
})
</script>
