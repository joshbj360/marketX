<template>
  <div
    ref="cardRef"
    class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:shadow-black/50"
    @click="$emit('open-detail', product)"
  >
    <!-- ─── MEDIA BLOCK (Single Relative Container) ───────────────────── -->
    <div
      class="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 dark:bg-neutral-800"
    >
      <!-- VIDEO (takes priority over image collage) -->
      <template v-if="videoItem">
        <!-- LQIP blur while video poster loads -->
        <div
          class="absolute inset-0 scale-110 bg-cover bg-center"
          :style="{ backgroundImage: `url(${imgLqip(videoItem.url)})`, filter: 'blur(12px)' }"
          aria-hidden="true"
        />
        <video
          ref="videoRef"
          :src="videoFeedUrl(videoItem.url)"
          :poster="videoThumb(videoItem.url)"
          class="absolute inset-0 h-full w-full object-cover"
          loop
          playsinline
          :muted="!soundEnabled"
          preload="none"
        />
        <!-- Mute toggle has been removed in favor of the global music pill -->
      </template>

      <!-- IMAGE COLLAGE (when no video) -->
      <template v-else>
        <!-- 0 Images: Placeholder -->
        <div
          v-if="!imageItems.length"
          class="absolute inset-0 flex items-center justify-center"
        >
          <Icon
            name="mdi:image-outline"
            size="48"
            class="text-gray-300 dark:text-neutral-700"
          />
        </div>

        <!-- 1 Image with LQIP blur-up -->
        <template v-else-if="imageItems.length === 1">
          <div
            class="absolute inset-0 scale-110 bg-cover bg-center"
            :style="{ backgroundImage: `url(${imgLqip(imageItems[0]!.url)})`, filter: 'blur(12px)' }"
            aria-hidden="true"
          />
          <img
            :src="imageItems[0]!.url"
            :alt="product.title"
            loading="lazy"
            class="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </template>

        <!-- 2 Images: Side by side -->
        <div
          v-else-if="imageItems.length === 2"
          class="absolute inset-0 grid grid-cols-2 gap-0.5"
        >
          <div
            v-for="item in imageItems"
            :key="item.id"
            class="overflow-hidden"
          >
            <img
              :src="item.url"
              :alt="product.title"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        <!-- 3+ Images: Collage -->
        <div v-else class="absolute inset-0 grid grid-cols-2 gap-0.5">
          <div class="overflow-hidden">
            <img
              :src="imageItems[0]!.url"
              :alt="product.title"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div class="grid grid-rows-2 gap-0.5">
            <div class="overflow-hidden">
              <img
                :src="imageItems[1]!.url"
                :alt="product.title"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div class="relative overflow-hidden">
              <img
                :src="imageItems[2]!.url"
                :alt="product.title"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <!-- +N Overlay -->
              <div
                v-if="imageItems.length > 3"
                class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <span class="text-lg font-bold text-white"
                  >+{{ imageItems.length - 3 }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ─── OVERLAYS (Positioned over the entire media block) ──────── -->

      <!-- Top Left: Badges -->
      <div
        v-if="product.isThrift || discountPercent > 0"
        class="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5"
      >
        <span
          v-if="product.isThrift"
          class="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm"
        >
          Thrift
        </span>
        <span
          v-if="discountPercent > 0"
          class="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm"
        >
          −{{ discountPercent }}%
        </span>
      </div>

      <!-- Bottom Left: Stock Indicator -->
      <div
        v-if="lowestStock === 0"
        class="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-gray-900/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md"
      >
        Sold out
      </div>
      <div
        v-else-if="lowestStock !== null && lowestStock <= 5"
        class="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-amber-500/95 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md"
      >
        Only {{ lowestStock }} left
      </div>

      <!-- TikTok-style music pill (bottom of media) -->
      <div
        v-if="hasAudio"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      >
        <div
          class="h-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />
        <div
          class="pointer-events-auto flex cursor-pointer items-center gap-2 bg-gradient-to-r from-black/75 to-black/40 px-2.5 pb-2.5 pt-1"
          @click.stop="toggleMusic"
        >
          <!-- Spinning vinyl disc -->
          <div class="vinyl-disc shrink-0" :class="{ spinning: musicPlaying }">
            <div class="vinyl-hole" />
          </div>
          <!-- Track name -->
          <div class="min-w-0 flex-1 overflow-hidden">
            <p
              class="mb-[2px] text-[8px] font-medium uppercase leading-none tracking-widest text-white/50"
            >
              <Icon name="mdi:music-note" size="8" class="-mt-0.5 inline" />
              Music
            </p>
            <span
              v-if="musicDisplayName.length > 18"
              class="marquee-text inline-block text-[10px] font-semibold leading-tight text-white"
            >
              {{ musicDisplayName }}&nbsp;&nbsp;·&nbsp;&nbsp;{{
                musicDisplayName
              }}
            </span>
            <span
              v-else
              class="block truncate text-[10px] font-semibold leading-tight text-white"
            >
              {{ musicDisplayName }}
            </span>
          </div>
          <!-- Equalizer bars -->
          <div class="eq-bars shrink-0" :class="{ playing: musicPlaying }">
            <div class="eq-bar" style="--h: 40%; --d: 0s" />
            <div class="eq-bar" style="--h: 100%; --d: 0.12s" />
            <div class="eq-bar" style="--h: 65%; --d: 0.07s" />
            <div class="eq-bar" style="--h: 85%; --d: 0.18s" />
          </div>
        </div>
      </div>

      <!-- Hidden audio element -->
      <audio
        v-if="bgMusicItem"
        ref="musicRef"
        :src="bgMusicItem.url"
        loop
        class="hidden"
      />
    </div>

    <!-- ─── INFO BLOCK ────────────────────────────────────────────────── -->
    <div class="flex flex-1 flex-col justify-between px-3.5 pb-2 pt-3">
      <div>
        <h3
          class="line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-brand dark:text-neutral-100"
        >
          {{ product.title }}
        </h3>
        <NuxtLink
          v-if="product.seller?.store_name"
          :to="`/sellers/profile/${product.seller.store_slug}`"
          class="mt-1 flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-neutral-400"
        >
          <Icon name="mdi:storefront-outline" size="12" />
          {{ product.seller.store_name }}
        </NuxtLink>
      </div>

      <div class="mt-2 flex items-baseline gap-2">
        <span
          class="text-[15px] font-bold text-gray-900 dark:text-neutral-100"
          >{{ formatPrice(discountedPrice) }}</span
        >
        <span
          v-if="discountPercent > 0"
          class="text-[11px] text-gray-400 line-through dark:text-neutral-500"
          >{{ formatPrice(product.price) }}</span
        >
      </div>
    </div>

    <!-- ─── ACTION BAR ────────────────────────────────────────────────── -->
    <div
      class="flex items-center justify-between px-2.5 pb-2.5 pt-1"
      @click.stop
    >
      <div class="flex items-center gap-1">
        <!-- Like -->
        <div
          class="flex items-center rounded-lg transition-colors"
          :class="
            localLiked
              ? 'bg-brand/5 text-brand'
              : 'text-gray-500 hover:bg-brand/5 hover:text-brand dark:text-neutral-400 dark:hover:bg-brand/10'
          "
        >
          <button
            aria-label="Like"
            class="flex items-center px-2 py-1.5 text-[11px] font-medium"
            @click="handleLike"
          >
            <Icon
              :name="localLiked ? 'mdi:heart' : 'mdi:heart-outline'"
              size="16"
              :class="localLiked ? 'scale-110' : ''"
              class="transition-transform"
            />
          </button>
          <button
            v-if="localLikeCount > 0"
            class="pr-2 text-[11px] font-medium leading-none"
            @click="showLikes = true"
          >
            {{ localLikeCount }}
          </button>
          <span v-else class="pr-2 text-[11px] font-medium leading-none"
            >0</span
          >
        </div>

        <!-- Comment -->
        <button
          class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-500 dark:text-neutral-400 dark:hover:bg-blue-500/10"
          @click="$emit('open-comments', product)"
        >
          <Icon name="mdi:comment-outline" size="16" />
          <span>{{ product._count?.comments ?? 0 }}</span>
        </button>

        <!-- Views -->
        <span
          v-if="product.viewCount"
          class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-gray-400 dark:text-neutral-500"
        >
          <Icon name="mdi:eye-outline" size="15" />
          {{ product.viewCount.toLocaleString() }}
        </span>

        <!-- Share -->
        <button
          class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-green-50 hover:text-green-500 dark:text-neutral-400 dark:hover:bg-green-500/10"
          @click="handleShare"
        >
          <Icon name="mdi:share-outline" size="16" />
        </button>
      </div>

      <div class="flex items-center gap-1">
        <!-- Market -->
        <button
          v-if="product.affiliateCommission && product.affiliateCommission > 0"
          title="Market this product and earn commission"
          class="flex items-center justify-center rounded-full bg-purple-50 p-1.5 text-purple-500 transition-colors hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20"
          @click="$emit('market', product)"
        >
          <Icon name="mdi:bullhorn-outline" size="16" />
        </button>

        <!-- Add to Cart -->
        <button
          :disabled="lowestStock === 0 || !product.variants?.length"
          :class="
            cartAdded
              ? 'scale-105 bg-green-500 text-white'
              : lowestStock === 0 || !product.variants?.length
                ? 'bg-gray-100 text-gray-400 dark:bg-neutral-800'
                : 'bg-brand text-white hover:bg-[#d81b36] hover:shadow-md hover:shadow-brand/20 active:scale-95'
          "
          class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleAddToCart"
        >
          <Icon :name="cartAdded ? 'mdi:check' : 'mdi:cart-plus'" size="14" />
          <span class="xs:inline hidden">{{
            !product.variants?.length
              ? 'N/A'
              : lowestStock === 0
                ? 'Sold out'
                : cartAdded
                  ? 'Added'
                  : 'Cart'
          }}</span>
        </button>
      </div>
    </div>
  </div>

  <ModalsLikesModal
    :is-open="showLikes"
    type="product"
    :target-id="product.id"
    @close="showLikes = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { IProduct } from '../types/commerce.types'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { notify } from '@kyvg/vue3-notification'
import { imgThumb, videoFeedUrl, videoThumb, imgLqip } from '~~/layers/core/app/utils/cloudinary'
import { useFeedSound } from '~~/layers/feed/app/composables/useFeedSound'
import { useShareModal } from '~~/layers/social/app/composables/useShareModal'
// Eslint can't find these without a relative path, might be a workspace config issue
// but using relative paths is a safe workaround.
import { useCart } from '../composables/useCart'
import { useProduct } from '../composables/useProduct'
import { useCurrency } from '~~/layers/core/app/composables/useCurrency'

const props = defineProps<{ product: IProduct }>()
const emit = defineEmits<{
  'open-detail': [product: IProduct]
  'open-comments': [product: IProduct]
  'quick-add': [product: IProduct]
  market: [product: IProduct]
  share: [product: IProduct]
}>()

const profileStore = useProfileStore()
const { addToCart } = useCart()
const { openShare } = useShareModal()
const { likeProduct, unlikeProduct } = useProduct()

// ── Media ────────────────────────────────────────────────────────────────────
const videoItem = computed(
  () =>
    (props.product.media ?? []).find(
      (m) => !m.isBgMusic && m.type === 'VIDEO',
    ) ?? null,
)
const bgMusicItem = computed(
  () =>
    (props.product.media ?? []).find(
      (m) => m.isBgMusic || m.type === 'AUDIO',
    ) ?? null,
)
const imageItems = computed(() =>
  (props.product.media ?? [])
    .filter((m) => !m.isBgMusic && m.type === 'IMAGE')
    .map((m) => ({ ...m, url: imgThumb(m.url) ?? m.url })),
)
// A product has audio if it has a dedicated music track OR a video
const hasAudio = computed(() => !!bgMusicItem.value || !!videoItem.value)

// ── Video + Music playback ────────────────────────────────────────────────────
const cardRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const musicRef = ref<HTMLAudioElement | null>(null)
const musicPlaying = ref(false)
const videoObserver = ref<IntersectionObserver | null>(null)
const musicObserver = ref<IntersectionObserver | null>(null)

const { soundEnabled } = useFeedSound()
const cardVisible = ref(false)

// Watcher for the separate <audio> element. The <video> element's audio
// is handled declaratively in the template via :muted.
watch(
  soundEnabled,
  (enabled) => {
    if (!cardVisible.value || !musicRef.value) return
    if (enabled) {
      musicRef.value
        .play()
        .then(() => {
          musicPlaying.value = true
        })
        .catch(() => {
          musicPlaying.value = false
        })
    } else {
      musicRef.value.pause()
      musicPlaying.value = false
    }
  },
  { flush: 'sync' },
)

const toggleMusic = () => {
  soundEnabled.value = !soundEnabled.value
}

const musicDisplayName = computed(() => {
  const item = bgMusicItem.value ?? videoItem.value
  const name =
    (item as { altText?: string; name?: string })?.altText ??
    (item as { altText?: string; name?: string })?.name
  // Provide a sensible fallback for videos
  if (!name) return videoItem.value ? 'Original sound' : 'Background Music'
  return name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
})

onMounted(() => {
  // Video autoplay observer (only when a video is present)
  if (videoRef.value) {
    videoObserver.value = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) videoRef.value?.play().catch(() => {})
        else videoRef.value?.pause()
      },
      { threshold: 0.5 },
    )
    videoObserver.value.observe(videoRef.value)
  }

  // Music observer — separate, watches the whole card for <audio> elements
  // Works for both image+music and video+music products
  if (bgMusicItem.value && cardRef.value) {
    musicObserver.value = new IntersectionObserver(
      ([entry]) => {
        cardVisible.value = entry!.isIntersecting
        if (!entry!.isIntersecting) {
          musicRef.value?.pause()
          musicPlaying.value = false
        } else if (soundEnabled.value) {
          // soundEnabled was already on from an earlier tap this session
          musicRef.value
            ?.play()
            .then(() => {
              musicPlaying.value = true
            })
            .catch(() => {
              musicPlaying.value = false
            })
        }
      },
      { threshold: 0.5 },
    )
    musicObserver.value.observe(cardRef.value)
  }
})

onUnmounted(() => {
  videoObserver.value?.disconnect()
  musicObserver.value?.disconnect()
  musicRef.value?.pause()
})

// ── Pricing ──────────────────────────────────────────────────────────────────
const { formatPrice = (val: number) => `$${Number(val).toLocaleString()}` } = useCurrency?.() || {}
const discountPercent = computed(() => props.product.discount ?? 0)
const discountedPrice = computed(() =>
  discountPercent.value > 0
    ? Math.round(props.product.price * (1 - discountPercent.value / 100))
    : props.product.price,
)

// ── Stock / Variant ──────────────────────────────────────────────────────────
const lowestStock = computed(() => {
  const v = props.product.variants
  if (!v?.length) return null
  return Math.min(...v.map((x) => x.stock))
})
const firstVariantId = computed(() => props.product.variants?.[0]?.id ?? null)
const isSingleVariant = computed(
  () => (props.product.variants?.length ?? 0) <= 1,
)

// ── Like ─────────────────────────────────────────────────────────────────────
const localLiked = ref(false)
const localLikeCount = ref(props.product._count?.likes ?? 0)
const showLikes = ref(false)

const handleLike = async () => {
  if (!profileStore.isLoggedIn) {
    notify({ type: 'warn', text: 'Sign in to like products' })
    return
  }
  const wasLiked = localLiked.value
  localLiked.value = !wasLiked
  localLikeCount.value += wasLiked ? -1 : 1

  try {
    if (wasLiked) await unlikeProduct(props.product.id)
    else await likeProduct(props.product.id)
  } catch (err: unknown) {
    // Rollback optimistic update
    localLiked.value = wasLiked
    localLikeCount.value += wasLiked ? 1 : -1

    const status =
      (err as { response?: { status?: number }; statusCode?: number })?.response
        ?.status ??
      (err as { response?: { status?: number }; statusCode?: number })
        ?.statusCode
    if (status === 401 || status === 403) {
      notify({ type: 'warn', text: 'Sign in to like products' })
    } else {
      notify({ type: 'error', text: 'Could not like product' })
    }
  }
}

// ── Share ────────────────────────────────────────────────────────────────────
const handleShare = () => {
  const url = `${import.meta.client ? window.location.origin : ''}/product/${
    props.product.slug
  }`
  if (navigator.share) {
    navigator
      .share({ title: props.product.title, url })
      .catch(() => openShare(url, props.product.title))
  } else {
    openShare(url, props.product.title)
  }
}

// ── Cart ──────────────────────────────────────────────────────────────────────
const cartAdded = ref(false)

const handleAddToCart = async () => {
  // Multi-variant: open detail modal to pick a variant
  if (!isSingleVariant.value || !firstVariantId.value) {
    return emit('open-detail', props.product)
  }
  try {
    await addToCart(firstVariantId.value, 1)
    cartAdded.value = true
    // Allow parent component to also trigger side effects (like opening a cart drawer)
    emit('quick-add', props.product)

    setTimeout(() => {
      cartAdded.value = false
    }, 2000)
  } catch {
    // This can fail if the cart module isn't active, but we don't want to
    // bother the user with an error. The button state is enough feedback.
  }
}
</script>

<style scoped>
.vinyl-disc {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: conic-gradient(
    #1c1c1c 0deg,
    #333 45deg,
    #1c1c1c 90deg,
    #2a2a2a 135deg,
    #1c1c1c 180deg,
    #333 225deg,
    #1c1c1c 270deg,
    #2a2a2a 315deg,
    #1c1c1c 360deg
  );
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 2px rgba(244, 114, 182, 0.15),
    inset 0 0 6px rgba(0, 0, 0, 0.6);
}
.vinyl-disc.spinning {
  animation: vinylSpin 3s linear infinite;
}
.vinyl-hole {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #fb7185, #e11d48);
  box-shadow: 0 0 5px rgba(244, 114, 182, 0.9);
}
.eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.eq-bar {
  width: 2.5px;
  height: var(--h);
  background: linear-gradient(to top, #f43f5e, #fb923c);
  border-radius: 2px;
}
.eq-bars.playing .eq-bar {
  animation: eqBounce 0.65s ease-in-out var(--d) infinite alternate;
}
.marquee-text {
  animation: marquee 9s linear infinite;
  padding-right: 2rem;
}
@keyframes vinylSpin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes eqBounce {
  from {
    height: 18%;
  }
  to {
    height: var(--h);
  }
}
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
