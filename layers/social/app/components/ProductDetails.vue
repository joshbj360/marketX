<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div
      class="relative shrink-0 overflow-hidden bg-gray-100 dark:bg-neutral-900"
      style="aspect-ratio: 4 / 3"
    >
      <template v-if="mediaItems.length">
        <div
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-50 px-3 py-3 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900"
        >
          <video
            v-if="currentMedia?.normalizedType === 'VIDEO'"
            :key="`${currentMedia.url}-video`"
            :src="currentMedia.url"
            :poster="currentMedia.thumbnailUrl"
            class="max-h-full w-full max-w-full rounded-2xl object-contain"
            controls
            autoplay
            playsinline
            muted
          />
          <img
            v-else
            :key="`${currentMedia?.url}-image`"
            :src="currentMedia?.url"
            :alt="product.title"
            class="max-h-full w-full max-w-full rounded-2xl object-contain"
          />
        </div>

        <div
          v-if="mediaItems.length > 1"
          class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4"
        >
          <div
            class="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-2 backdrop-blur-sm"
          >
            <button
              v-for="(_, i) in mediaItems"
              :key="i"
              :class="[
                'h-1.5 rounded-full transition-all',
                i === activeImageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/55',
              ]"
              @click="activeImageIndex = i"
            />
          </div>
        </div>

        <button
          v-if="mediaItems.length > 1 && activeImageIndex > 0"
          class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          @click="activeImageIndex--"
        >
          <Icon name="mdi:chevron-left" size="22" />
        </button>
        <button
          v-if="
            mediaItems.length > 1 && activeImageIndex < mediaItems.length - 1
          "
          class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          @click="activeImageIndex++"
        >
          <Icon name="mdi:chevron-right" size="22" />
        </button>

        <div
          v-if="mediaItems.length > 1"
          class="hidden gap-2 overflow-x-auto border-t border-gray-200/80 bg-white/75 p-2 backdrop-blur md:flex dark:border-neutral-800 dark:bg-neutral-900/90"
        >
          <button
            v-for="(media, i) in mediaItems"
            :key="media.id || i"
            class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all dark:bg-neutral-800"
            :class="
              i === activeImageIndex
                ? 'border-brand shadow-sm shadow-brand/20'
                : 'border-transparent opacity-70 hover:opacity-100'
            "
            @click="activeImageIndex = i"
          >
            <video
              v-if="media.normalizedType === 'VIDEO'"
              :src="media.url"
              :poster="media.thumbnailUrl"
              class="h-full w-full object-cover"
              muted
              preload="metadata"
            />
            <img
              v-else
              :src="imgThumb(media.url)"
              :alt="product.title"
              class="h-full w-full object-cover"
            />
            <div
              v-if="media.normalizedType === 'VIDEO'"
              class="absolute inset-0 flex items-center justify-center bg-black/25"
            >
              <Icon
                name="mdi:play-circle-outline"
                size="18"
                class="text-white"
              />
            </div>
          </button>
        </div>
      </template>

      <div v-else class="flex h-full w-full items-center justify-center">
        <Icon
          name="mdi:package-variant-closed"
          size="64"
          class="text-gray-300 dark:text-neutral-600"
        />
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="space-y-4 p-4">
        <div>
          <div class="flex items-start justify-between gap-2">
            <h2
              class="text-lg font-bold leading-tight text-gray-900 dark:text-neutral-100"
            >
              {{ product.title }}
            </h2>
            <div class="shrink-0 text-right">
              <p class="text-xl font-bold text-brand">
                {{ formatPrice(product.price) }}
              </p>
              <span
                v-if="product.discount && product.discount > 0"
                class="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300"
              >
                {{ product.discount }}% OFF
              </span>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span
              :class="[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                product.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-400',
              ]"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
              {{ product.status === 'PUBLISHED' ? 'In Stock' : product.status }}
            </span>
            <span
              v-if="product.isThrift"
              class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              Thrift
            </span>
          </div>
        </div>

        <NuxtLink
          :to="`/seller/${sellerStore?.store_slug}`"
          class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <div
            class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700"
          >
            <img
              v-if="sellerStore?.store_logo"
              :src="sellerStore.store_logo"
              :alt="sellerStore?.store_name"
              class="h-full w-full object-cover"
            />
            <Icon
              v-else
              name="mdi:store-outline"
              size="20"
              class="ml-2 mt-2 text-gray-400"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p
              class="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100"
            >
              {{ sellerStore?.store_name || 'View Store' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              @{{ sellerStore?.store_slug }}
            </p>
          </div>
          <Icon
            name="mdi:chevron-right"
            size="18"
            class="shrink-0 text-gray-400"
          />
        </NuxtLink>

        <div v-if="product.description">
          <h3
            class="mb-1 text-sm font-semibold text-gray-700 dark:text-neutral-300"
          >
            Description
          </h3>
          <p
            class="text-sm leading-relaxed text-gray-600 dark:text-neutral-400"
          >
            {{ product.description }}
          </p>
        </div>

        <div v-if="product.variants && product.variants.length > 0">
          <h3
            class="mb-2 text-sm font-semibold text-gray-700 dark:text-neutral-300"
          >
            Options
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="variant in product.variants"
              :key="variant.id"
              :disabled="variant.stock === 0"
              :class="[
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                selectedVariant?.id === variant.id
                  ? 'border-brand bg-brand text-white'
                  : variant.stock === 0
                    ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
              ]"
              @click="selectedVariant = variant"
            >
              {{ variant.name }}
              <span v-if="variant.stock === 0" class="text-xs">
                (sold out)</span
              >
            </button>
          </div>
          <p
            v-if="
              selectedVariant?.price && selectedVariant.price !== product.price
            "
            class="mt-2 text-sm text-gray-500 dark:text-neutral-400"
          >
            Variant price:
            <span class="font-semibold text-brand">{{
              formatPrice(selectedVariant.price)
            }}</span>
          </p>
        </div>

        <div
          class="flex items-center gap-5 border-t border-gray-100 py-2 dark:border-neutral-800"
        >
          <div
            class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400"
          >
            <Icon name="mdi:heart-outline" size="18" />
            <span>{{ product._count?.likes ?? 0 }}</span>
          </div>
          <div
            class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400"
          >
            <Icon name="mdi:chat-outline" size="18" />
            <span>{{ product._count?.comments ?? 0 }}</span>
          </div>
          <button
            class="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand dark:text-neutral-400"
            @click="shareProduct"
          >
            <Icon name="mdi:share-variant-outline" size="18" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>

    <div
      class="shrink-0 border-t border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div
        v-if="addedToCart"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white"
      >
        <Icon name="mdi:check-circle" size="20" />
        Added to Cart
      </div>
      <button
        v-else
        :disabled="
          isAddingToCart ||
          (product.variants?.length > 0 && !selectedVariant) ||
          needsVariantSelection
        "
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:opacity-50"
        @click="handleAddToCart"
      >
        <Icon v-if="isAddingToCart" name="eos-icons:loading" size="18" />
        <Icon v-else name="mdi:cart-plus" size="18" />
        {{ isAddingToCart ? 'Adding...' : 'Add to Cart' }}
      </button>
      <p
        v-if="needsVariantSelection"
        class="mt-2 text-center text-xs text-amber-600 dark:text-amber-400"
      >
        Please select an option above
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCart } from '~~/layers/commerce/app/composables/useCart'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { notify } from '@kyvg/vue3-notification'
import { formatProductPrice } from '~~/app/utils/currency'
import { imgDetail, imgThumb } from '~~/layers/core/app/utils/cloudinary'
import type {
  IProduct as CommerceProduct,
  IProductVariant,
} from '~~/layers/commerce/app/types/commerce.types'

type ProductMedia = NonNullable<CommerceProduct['media']>[number] & {
  thumbnailUrl?: string
  normalizedType?: 'IMAGE' | 'VIDEO' | 'AUDIO'
}
type ProductDetailsModel = CommerceProduct & {
  variants?: IProductVariant[]
}

const props = defineProps<{
  product: ProductDetailsModel
  sellerStore: ProductDetailsModel['seller'] | null
}>()

const { addToCart } = useCart()
const profileStore = useProfileStore()

const activeImageIndex = ref(0)
const selectedVariant = ref<IProductVariant | null>(
  props.product.variants?.[0] ?? null,
)
const isAddingToCart = ref(false)
const addedToCart = ref(false)

watch(
  () => props.product?.id,
  () => {
    activeImageIndex.value = 0
    selectedVariant.value = props.product?.variants?.[0] ?? null
    addedToCart.value = false
  },
)

const videoPoster = (url: string | null | undefined) => {
  if (!url) return ''
  const [base] = url.split('?')
  if (!base) return url ?? ''
  const lastDot = base.lastIndexOf('.')
  return lastDot > -1 ? `${base.slice(0, lastDot)}.jpg` : base
}

const mediaItems = computed(() =>
  (props.product?.media ?? [])
    .map((media) => ({
      ...media,
      normalizedType: String(media.type ?? 'IMAGE').toUpperCase() as
        | 'IMAGE'
        | 'VIDEO'
        | 'AUDIO',
    }))
    .filter(
      (media): media is ProductMedia =>
        !media.isBgMusic && media.normalizedType !== 'AUDIO',
    )
    .map((media) => ({
      ...media,
      url:
        media.normalizedType === 'VIDEO'
          ? media.url
          : imgDetail(media.url) ?? media.url,
      thumbnailUrl:
        media.normalizedType === 'VIDEO'
          ? media.thumbnailUrl ?? videoPoster(media.url)
          : undefined,
    })),
)

const currentMedia = computed(
  () => mediaItems.value[activeImageIndex.value] ?? mediaItems.value[0] ?? null,
)

const needsVariantSelection = computed(
  () => props.product.variants?.length > 0 && !selectedVariant.value,
)

const formatPrice = (price: number | string) => {
  const num = Number(price)
  if (isNaN(num)) return 'NGN 0'
  return formatProductPrice(num, 'NGN')
}

const handleAddToCart = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: 'Please log in to add items to cart' })
    return
  }

  const variantId = selectedVariant.value?.id
  if (props.product.variants?.length > 0 && !variantId) {
    notify({ type: 'warn', text: 'Please select an option' })
    return
  }

  if (!variantId) {
    notify({
      type: 'warn',
      text: 'This product has no purchasable variants yet',
    })
    return
  }

  isAddingToCart.value = true
  try {
    await addToCart(variantId, 1)
    addedToCart.value = true
    notify({ type: 'success', text: 'Added to cart!' })
    setTimeout(() => {
      addedToCart.value = false
    }, 2000)
  } catch {
    // useCart handles error notification
  } finally {
    isAddingToCart.value = false
  }
}

const shareProduct = async () => {
  const shareUrl = `${window.location.origin}/products/${props.product.id}`
  try {
    if (navigator.share) {
      await navigator.share({ url: shareUrl, title: props.product.title })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      notify({ type: 'success', text: 'Link copied!' })
    }
  } catch {
    return
  }
}
</script>
