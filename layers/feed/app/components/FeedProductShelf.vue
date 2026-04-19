<!-- app/components/feed/FeedProductShelf.vue -->
<!-- Horizontally scrollable shoppable product shelf injected between feed posts -->
<template>
  <div class="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10">
          <Icon
            name="mdi:shopping-outline"
            size="16"
            class="text-gray-500 dark:text-neutral-400"
          />
        </div>
        <span class="text-[13px] font-bold tracking-wide text-gray-900 dark:text-white">{{ label || 'Shop Today' }}</span>
      </div>
      <NuxtLink
        to="/fresh-drops"
        class="flex items-center gap-0.5 text-[12px] font-medium text-gray-400 transition hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        See all
        <Icon name="mdi:arrow-right" size="14" />
      </NuxtLink>
    </div>

    <!-- Scroll container wrapper (for fade cues) -->
    <div class="relative">
      <!-- Left fade cue -->
      <div
        class="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent dark:from-neutral-950"
        :class="{ 'opacity-0': scrolledToStart }"
      />
      <!-- Right fade cue -->
      <div
        class="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent dark:from-neutral-950"
        :class="{ 'opacity-0': scrolledToEnd }"
      />

      <!-- Scroll track -->
      <div
        ref="trackRef"
        class="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-4 pt-1"
        style="scrollbar-width: none; -ms-overflow-style: none;"
        @scroll="onScroll"
      >
        <button
          v-for="product in products"
          :key="product.id"
          class="group flex w-[130px] flex-none flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition hover:border-brand/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand/30"
          @click="$emit('open-product', product)"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
            <img
              v-if="product.media?.[0]?.url"
              :src="product.media[0].type === 'VIDEO' ? videoThumb(product.media[0].url) : imgThumb(product.media[0].url)"
              :alt="product.title"
              loading="lazy"
              width="130"
              height="130"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Icon name="mdi:image-outline" size="28" class="text-gray-300 dark:text-neutral-700" />
            </div>
            <!-- Badge -->
            <span
              v-if="product.isDeal"
              class="absolute left-1.5 top-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
            >SALE</span>
            <span
              v-else-if="product.discount"
              class="absolute left-1.5 top-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm"
            >−{{ product.discount }}%</span>
          </div>

          <!-- Info -->
          <div class="flex flex-1 flex-col p-2.5">
            <p class="line-clamp-2 text-[11px] leading-tight text-gray-700 dark:text-neutral-300">
              {{ product.title }}
            </p>
            <div class="mt-auto flex items-center gap-1.5 pt-1.5">
              <span
                class="text-[13px] font-bold text-gray-900 dark:text-neutral-100"
              >
                {{ formatPrice(effectivePrice(product)) }}
              </span>
              <span
                v-if="product.discount"
                class="text-[10px] text-gray-400 line-through dark:text-neutral-600"
              >{{ formatPrice(product.price) }}</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Dot indicators -->
    <div v-if="products.length > 3" class="flex items-center justify-center gap-1.5 pb-3">
      <span
        v-for="i in dotCount"
        :key="i"
        class="block h-1.5 rounded-full transition-all duration-300"
        :class="activeDot === i - 1
          ? 'w-4 bg-brand'
          : 'w-1.5 bg-gray-200 dark:bg-neutral-700'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { videoThumb, imgThumb } from '~~/layers/core/app/utils/cloudinary'

const props = defineProps<{
  products: Array<{
    id: number
    title: string
    price: number
    discount?: number | null
    isDeal?: boolean
    media?: Array<{ url: string; type?: string }>
  }>
  label?: string
}>()

defineEmits<{ 'open-product': [product: (typeof props.products)[number]] }>()

const { formatPrice } = useCurrency()

const effectivePrice = (p: { price: number; discount?: number | null }) =>
  p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price

// Scroll state
const trackRef = ref<HTMLElement | null>(null)
const scrollLeft = ref(0)
const scrollWidth = ref(0)
const clientWidth = ref(0)

const scrolledToStart = computed(() => scrollLeft.value <= 4)
const scrolledToEnd = computed(() => scrollLeft.value >= scrollWidth.value - clientWidth.value - 4)

// Dot pagination — one dot per ~3 visible cards
const CARDS_PER_PAGE = 3
const dotCount = computed(() => Math.ceil(props.products.length / CARDS_PER_PAGE))
const activeDot = computed(() => {
  if (!scrollWidth.value || !clientWidth.value) return 0
  const scrollable = scrollWidth.value - clientWidth.value
  if (scrollable <= 0) return 0
  return Math.round((scrollLeft.value / scrollable) * (dotCount.value - 1))
})

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  scrollLeft.value = el.scrollLeft
  scrollWidth.value = el.scrollWidth
  clientWidth.value = el.clientWidth
}

function updateDimensions() {
  const el = trackRef.value
  if (!el) return
  scrollLeft.value = el.scrollLeft
  scrollWidth.value = el.scrollWidth
  clientWidth.value = el.clientWidth
}

onMounted(() => {
  updateDimensions()
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})
</script>

<style scoped>
/* Hide scrollbar cross-browser */
div[style*="scrollbar-width"]::-webkit-scrollbar {
  display: none;
}
</style>