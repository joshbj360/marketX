<template>
  <div v-if="products && products.length > 0">
    <!-- Single product -->
    <div
      v-if="products.length === 1"
      class="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <button
        class="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        @click.stop="emit('select-product', products[0].id)"
      >
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-200 dark:bg-neutral-700"
        >
          <img
            v-if="products[0].image"
            :src="products[0].image"
            :alt="products[0].title"
            class="h-full w-full object-cover"
          />
          <Icon v-else name="mdi:shopping" size="16" class="text-gray-500 dark:text-neutral-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-gray-800 dark:text-neutral-200">{{ products[0].title }}</p>
          <p class="text-sm font-bold text-brand">{{ formatPrice(products[0].price) }}</p>
        </div>
      </button>
      <button
        class="cart-btn shrink-0"
        :class="addedIds.has(products[0].id) ? 'cart-btn-added' : 'cart-btn-default'"
        :aria-label="`Add ${products[0].title} to cart`"
        @click.stop="handleAddToCart(products[0])"
      >
        <Icon :name="addedIds.has(products[0].id) ? 'mdi:check' : 'mdi:cart-plus'" size="16" />
        <span class="hidden text-xs font-semibold sm:inline">
          {{ addedIds.has(products[0].id) ? 'Added' : 'Add' }}
        </span>
      </button>
    </div>

    <!-- Multiple products: horizontal scroll -->
    <div v-else>
      <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
        <Icon name="mdi:shopping-outline" size="11" class="-mt-0.5 inline" />
        {{ contentType === 'INSPIRATION' ? 'Shop this look' : contentType === 'EDUCATIONAL' ? 'Products used' : 'Tagged products' }}
      </p>
      <div class="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        <div
          v-for="product in products"
          :key="product.id"
          class="w-[120px] shrink-0 rounded-xl border border-gray-100 bg-gray-50 p-2 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <button
            class="mb-1.5 block w-full"
            @click.stop="emit('select-product', product.id)"
          >
            <div class="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-neutral-700">
              <img
                :src="product.image || '/placeholder.png'"
                :alt="product.title"
                class="h-full w-full object-cover"
              />
            </div>
            <p class="mt-1 truncate text-[11px] text-gray-700 dark:text-neutral-300">{{ product.title }}</p>
            <p class="text-xs font-bold text-brand">{{ formatPrice(product.price) }}</p>
          </button>
          <button
            class="cart-btn-sm w-full"
            :class="addedIds.has(product.id) ? 'cart-btn-sm-added' : 'cart-btn-sm-default'"
            :aria-label="`Add ${product.title} to cart`"
            @click.stop="handleAddToCart(product)"
          >
            <Icon :name="addedIds.has(product.id) ? 'mdi:check' : 'mdi:cart-plus'" size="13" />
            <span class="text-[10px] font-semibold">{{ addedIds.has(product.id) ? 'Added' : 'Add' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  products: Array<{ id: number; title: string; price: number; image: string | null; slug?: string }>
  contentType: string
}>()

const emit = defineEmits<{
  'select-product': [id: number]
}>()

const { formatPrice } = useCurrency()

// Products open the detail modal for variant selection — no direct add-to-cart.
// addedIds tracks nothing yet; placeholder so the template bindings don't throw.
const addedIds = new Set<number>()

const handleAddToCart = (product: { id: number }) => {
  emit('select-product', product.id)
}
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }

.cart-btn {
  @apply flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 transition-all;
}
.cart-btn-default {
  @apply bg-brand/10 text-brand hover:bg-brand/20 dark:bg-brand/20;
}
.cart-btn-added {
  @apply bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400;
}

.cart-btn-sm {
  @apply flex items-center justify-center gap-1 rounded-lg px-2 py-1 transition-all;
}
.cart-btn-sm-default {
  @apply bg-brand/10 text-brand hover:bg-brand/20 dark:bg-brand/20;
}
.cart-btn-sm-added {
  @apply bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400;
}
</style>
