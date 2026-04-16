<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="true">
    <!-- Loading -->
    <div v-if="pending" class="flex min-h-[60vh] items-center justify-center">
      <Icon
        name="eos-icons:loading"
        size="36"
        class="animate-spin text-brand"
      />
    </div>

    <!-- Not found -->
    <div
      v-else-if="status === 'success' && !product"
      class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
    >
      <Icon
        name="mdi:shopping-outline"
        size="56"
        class="text-gray-300 dark:text-neutral-600"
      />
      <p class="text-lg font-semibold text-gray-700 dark:text-neutral-300">
        Product not found
      </p>
      <NuxtLink
        to="/discover"
        class="text-sm font-semibold text-brand hover:underline"
        >Browse products</NuxtLink
      >
    </div>

    <div v-else-if="product" class="mx-auto max-w-5xl px-4 py-6">
      <!-- Back -->
      <button
        @click="$router.back()"
        class="mb-5 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-neutral-100"
      >
        <Icon name="mdi:arrow-left" size="18" />
        Back
      </button>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- ── Image Gallery ── -->
        <div class="flex flex-col gap-3">
          <!-- Main image -->
          <div
            class="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 dark:bg-neutral-800"
          >
            <video
              v-if="mediaItems[currentIndex]?.type === 'VIDEO'"
              :src="mediaItems[currentIndex].url"
              class="h-full w-full object-contain"
              controls
              preload="metadata"
            />
            <img
              v-else
              :src="mediaItems[currentIndex]?.url"
              :alt="product.title"
              class="h-full w-full object-contain"
            />
            <!-- Nav arrows (multiple images) -->
            <template v-if="mediaItems.length > 1">
              <button
                @click="
                  currentIndex =
                    (currentIndex - 1 + mediaItems.length) % mediaItems.length
                "
                class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/50"
              >
                <Icon name="mdi:chevron-left" size="22" />
              </button>
              <button
                @click="currentIndex = (currentIndex + 1) % mediaItems.length"
                class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/50"
              >
                <Icon name="mdi:chevron-right" size="22" />
              </button>
              <div
                class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
              >
                <button
                  v-for="(_, i) in mediaItems"
                  :key="i"
                  @click="currentIndex = i"
                  class="h-2 rounded-full transition-all"
                  :class="
                    i === currentIndex ? 'w-5 bg-brand' : 'w-2 bg-white/60'
                  "
                />
              </div>
            </template>
          </div>

          <!-- Thumbnail strip -->
          <div
            v-if="mediaItems.length > 1"
            class="flex gap-2 overflow-x-auto pb-1"
          >
            <button
              v-for="(item, i) in mediaItems"
              :key="i"
              @click="currentIndex = i"
              class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all"
              :class="
                i === currentIndex
                  ? 'border-brand'
                  : 'border-transparent opacity-60 hover:opacity-100'
              "
            >
              <img
                :src="item.type === 'VIDEO' ? videoThumb(item.url) : item.url"
                :alt="`${product.title} ${i + 1}`"
                class="h-full w-full object-cover"
              />
              <Icon
                v-if="item.type === 'VIDEO'"
                name="mdi:play-circle"
                size="14"
                class="pointer-events-none absolute inset-0 m-auto text-white drop-shadow"
              />
            </button>
          </div>
        </div>

        <!-- ── Product Info ── -->
        <div class="flex flex-col gap-5">
          <!-- Seller -->
          <NuxtLink
            :to="`/sellers/profile/${product.seller?.store_slug}`"
            class="flex w-max items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 transition-colors hover:border-brand dark:border-neutral-700 dark:bg-neutral-800"
          >
            <img
              v-if="product.seller?.store_logo"
              :src="product.seller.store_logo"
              class="h-5 w-5 rounded-full object-cover"
            />
            <Icon
              v-else
              name="mdi:store-outline"
              size="14"
              class="text-gray-500"
            />
            <span
              class="text-xs font-semibold text-gray-700 dark:text-neutral-300"
              >{{
                product.seller?.store_name || product.seller?.store_slug
              }}</span
            >
          </NuxtLink>

          <!-- Title & price -->
          <div>
            <h1
              class="text-2xl font-bold leading-snug text-gray-900 dark:text-neutral-100"
            >
              {{ product.title }}
            </h1>
            <div class="mt-2 flex items-baseline gap-3">
              <span class="text-2xl font-bold text-brand">{{
                formatProductPrice(discountedPrice, 'NGN')
              }}</span>
              <span
                v-if="product.discount && product.discount > 0"
                class="text-base text-gray-400 line-through dark:text-neutral-500"
              >
                {{ formatProductPrice(product.price, 'NGN') }}
              </span>
              <span
                v-if="product.discount && product.discount > 0"
                class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                {{ product.discount }}% off
              </span>
            </div>
          </div>

          <!-- Variants -->
          <div v-if="product.variants?.length">
            <p
              class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400"
            >
              Size / Option
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="v in product.variants"
                :key="v.id"
                @click="selectedVariantId = v.id"
                :disabled="v.stock === 0"
                class="rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
                :class="
                  selectedVariantId === v.id
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-300'
                "
              >
                {{ v.size }}
                <span
                  v-if="v.price && v.price !== product.price"
                  class="ml-1 text-[11px] opacity-60"
                >
                  +{{ formatProductPrice(v.price - product.price, 'NGN') }}
                </span>
              </button>
            </div>
          </div>

          <!-- Stock indicator -->
          <p
            v-if="selectedVariant"
            class="text-xs"
            :class="
              selectedVariant.stock > 5
                ? 'text-green-600'
                : selectedVariant.stock > 0
                  ? 'text-amber-600'
                  : 'text-red-500'
            "
          >
            <Icon name="mdi:circle" size="10" class="mr-1" />
            {{
              selectedVariant.stock > 5
                ? 'In stock'
                : selectedVariant.stock > 0
                  ? `Only ${selectedVariant.stock} left`
                  : 'Out of stock'
            }}
          </p>

          <!-- Qty + Add to cart -->
          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-neutral-700"
            >
              <button
                @click="qty = Math.max(1, qty - 1)"
                class="px-3 py-2.5 text-lg font-bold text-gray-600 hover:text-brand dark:text-neutral-400"
              >
                −
              </button>
              <span
                class="w-8 text-center text-sm font-bold text-gray-900 dark:text-neutral-100"
                >{{ qty }}</span
              >
              <button
                @click="qty++"
                class="px-3 py-2.5 text-lg font-bold text-gray-600 hover:text-brand dark:text-neutral-400"
              >
                +
              </button>
            </div>
            <button
              @click="handleAddToCart"
              :disabled="
                addingToCart ||
                !selectedVariantId ||
                selectedVariant?.stock === 0
              "
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white transition-all hover:bg-brand/90 disabled:opacity-50"
            >
              <Icon
                v-if="addingToCart"
                name="eos-icons:loading"
                size="16"
                class="animate-spin"
              />
              <Icon v-else name="mdi:cart-plus" size="16" />
              {{ addingToCart ? 'Adding…' : 'Add to Cart' }}
            </button>
          </div>

          <!-- Share / Copy link -->
          <div class="flex gap-2">
            <button
              @click="copyLink"
              class="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400"
            >
              <Icon :name="copied ? 'mdi:check' : 'mdi:link-variant'" size="15" />
              {{ copied ? 'Copied!' : 'Copy link' }}
            </button>
            <button
              @click="handleShare"
              class="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400"
            >
              <Icon name="mdi:share-variant-outline" size="15" />
              Share
            </button>
          </div>

          <!-- Affiliate link panel — visible only to enrolled affiliates -->
          <div
            v-if="isEnrolled && affiliateUrl"
            class="rounded-2xl border border-brand/20 bg-brand/5 p-4 dark:border-brand/30 dark:bg-brand/10"
          >
            <div class="mb-2 flex items-center gap-2">
              <Icon name="mdi:link-variant-plus" size="15" class="text-brand" />
              <p class="text-xs font-bold uppercase tracking-wide text-brand">
                Your Affiliate Link
              </p>
            </div>
            <p class="mb-3 text-xs text-gray-500 dark:text-neutral-400">
              Share this link to earn a commission on every sale you refer.
            </p>
            <div class="flex items-center gap-2 rounded-xl border border-brand/20 bg-white px-3 py-2 dark:bg-neutral-900">
              <span class="flex-1 truncate text-xs text-gray-600 dark:text-neutral-400">
                {{ affiliateUrl }}
              </span>
              <button
                @click="copyAffiliateLink"
                class="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand/90"
              >
                <Icon :name="copiedAffiliate ? 'mdi:check' : 'mdi:content-copy'" size="13" class="mr-1" />
                {{ copiedAffiliate ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Description -->
          <div
            v-if="product.description"
            class="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50"
          >
            <p
              class="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500"
            >
              Description
            </p>
            <div
              v-html="product.description"
              class="product-desc text-sm leading-relaxed text-gray-700 dark:text-neutral-300"
            />
          </div>
        </div>
      </div>

      <!-- ── Reviews ── -->
      <div class="mt-10">
        <h2 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
        <ProductReviews :product-id="product.id" />
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import ProductReviews from '~~/layers/commerce/app/components/ProductReviews.vue'
import { useCart } from '~~/layers/commerce/app/composables/useCart'
import { useAffiliate } from '~~/layers/commerce/app/composables/useAffiliate'
import { formatProductPrice } from '~~/shared/utils/currency'
import { videoThumb } from '~~/layers/core/app/utils/cloudinary'
import { notify } from '@kyvg/vue3-notification'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { captureAffiliateRef, affiliateCode, isEnrolled, fetchAffiliateStatus } = useAffiliate()

// Capture ?ref= from URL on every product page load (30-day TTL)
onMounted(() => {
  captureAffiliateRef()
  // Silently load affiliate status so we can show the affiliate link section
  fetchAffiliateStatus().catch(() => {})
})

// Fetch product by slug
const { data, pending, status } = await useLazyAsyncData(
  `product-${slug.value}`,
  () =>
    $fetch<{ success: boolean; data: any }>(
      `/api/commerce/products/by-slug/${slug.value}`,
    ),
  { server: false },
)

const product = computed(() => data.value?.data ?? null)

// Gallery
const currentIndex = ref(0)
const mediaItems = computed(() =>
  (product.value?.media ?? []).filter(
    (m: any) => !m.isBgMusic && m.type !== 'AUDIO',
  ),
)

// Reset gallery index when product changes + track view once loaded
const { trackProduct } = useViewTracker()
watch(
  () => product.value?.id,
  (id) => {
    currentIndex.value = 0
    if (id) trackProduct(id)
  },
)

// Variants
const selectedVariantId = ref<number | null>(null)
const selectedVariant = computed(
  () =>
    product.value?.variants?.find(
      (v: any) => v.id === selectedVariantId.value,
    ) ?? null,
)
const discountedPrice = computed(() => {
  if (!product.value) return 0
  const base = selectedVariant.value?.price ?? product.value.price
  const disc = product.value.discount ?? 0
  return disc > 0 ? Math.round(base * (1 - disc / 100)) : base
})

// Auto-select first available variant
watch(
  product,
  (p) => {
    if (p?.variants?.length) {
      const first = p.variants.find((v: any) => v.stock > 0)
      selectedVariantId.value = first?.id ?? p.variants[0]?.id ?? null
    }
  },
  { immediate: true },
)

// Cart
const qty = ref(1)
const addingToCart = ref(false)
const { addToCart } = useCart()

const handleAddToCart = async () => {
  if (!selectedVariantId.value) return
  addingToCart.value = true
  try {
    await addToCart(selectedVariantId.value, qty.value)
    notify({ type: 'success', text: 'Added to cart!' })
  } finally {
    addingToCart.value = false
  }
}

// Share
const copied = ref(false)
const copiedAffiliate = ref(false)

const baseProductUrl = computed(() =>
  import.meta.client
    ? `${window.location.origin}/product/${slug.value}`
    : `/product/${slug.value}`,
)

// Plain URL for non-affiliate sharing or SEO
const productUrl = baseProductUrl

// Affiliate link — only built when user is enrolled
const affiliateUrl = computed(() => {
  if (!isEnrolled.value || !affiliateCode.value) return null
  return `${baseProductUrl.value}?ref=${affiliateCode.value}`
})

const copyLink = async () => {
  await navigator.clipboard.writeText(productUrl.value).catch(() => {})
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const copyAffiliateLink = async () => {
  if (!affiliateUrl.value) return
  await navigator.clipboard.writeText(affiliateUrl.value).catch(() => {})
  copiedAffiliate.value = true
  setTimeout(() => { copiedAffiliate.value = false }, 2000)
}

const handleShare = async () => {
  if (navigator.share) {
    await navigator.share({ title: product.value?.title, url: productUrl.value }).catch(() => {})
  } else {
    await copyLink()
  }
}

// SEO
const { setProductPage } = useSeo()
watch(product, (p) => {
  if (p) setProductPage({ title: p.title, description: p.description, imageUrl: p.media?.[0]?.url })
}, { immediate: true })

useHead(
  computed(() => ({
    title: product.value?.title || 'Product',
    meta: [
      { name: 'description', content: product.value?.description || '' },
      { property: 'og:title', content: product.value?.title || '' },
      { property: 'og:description', content: product.value?.description || '' },
      { property: 'og:image', content: mediaItems.value[0]?.url || '' },
      { property: 'og:url', content: productUrl.value },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  })),
)
</script>

<style scoped>
.product-desc :deep(p) { margin-bottom: 0.6em; }
.product-desc :deep(p:last-child) { margin-bottom: 0; }
.product-desc :deep(h1),.product-desc :deep(h2),.product-desc :deep(h3) { font-weight: 700; margin: 0.8em 0 0.3em; }
.product-desc :deep(ul),.product-desc :deep(ol) { padding-left: 1.25rem; margin-bottom: 0.6em; }
.product-desc :deep(ul) { list-style-type: disc; }
.product-desc :deep(ol) { list-style-type: decimal; }
.product-desc :deep(li) { margin-bottom: 0.2em; }
.product-desc :deep(strong) { font-weight: 700; }
.product-desc :deep(em) { font-style: italic; }
.product-desc :deep(a) { color: #f02c56; text-decoration: underline; }
</style>
