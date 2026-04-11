<template>
  <div
    class="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black"
  >
    <!-- ─── VIDEO PLAYER ─────────────────────────────────────────────── -->
    <video
      ref="videoEl"
      :src="videoUrl"
      class="h-full w-full object-cover"
      loop
      playsinline
      :muted="isMuted"
      @click="togglePlay"
    />

    <!-- Background music (separate audio track, video stays silent) -->
    <audio
      v-if="reel.bgMusic"
      ref="musicEl"
      :src="reel.bgMusic.url"
      loop
      class="hidden"
    />

    <!-- Dim overlay for paused state -->
    <Transition name="fade">
      <div
        v-if="!isPlaying"
        class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/30"
      >
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-sm"
        >
          <Icon name="mdi:play" size="36" class="ml-1 text-white" />
        </div>
      </div>
    </Transition>

    <!-- Gradient overlays for text readability -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
    />
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-black/50 to-transparent"
    />

    <!-- ─── TAP-TO-UNMUTE OVERLAY (mobile autoplay UX) ───────────────── -->
    <Transition name="unmute-fade">
      <button
        v-if="showUnmuteHint"
        class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-transparent"
        @click.stop="tapToUnmute"
        aria-label="Tap to enable sound"
      >
        <div class="unmute-pill">
          <Icon name="mdi:volume-off" size="18" class="text-white" />
          <span class="text-[13px] font-bold text-white">Tap for sound</span>
          <Icon name="mdi:chevron-right" size="16" class="text-white/70" />
        </div>
      </button>
    </Transition>

    <!-- ─── PRODUCT FLOAT-UP CARD (appears 3s after play) ─────────────── -->
    <Transition name="product-float">
      <div
        v-if="showProductFloat && taggedProduct"
        class="pointer-events-auto absolute bottom-36 left-4 z-25 flex max-w-[220px] items-center gap-3 rounded-2xl border border-white/20 bg-black/60 px-3 py-2.5 shadow-2xl backdrop-blur-xl"
        @click.stop
      >
        <!-- Product image thumbnail -->
        <div class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
          <img
            v-if="taggedProduct.media?.[0]?.url || taggedProduct.thumbnail"
            :src="taggedProduct.media?.[0]?.url || taggedProduct.thumbnail"
            :alt="taggedProduct.title || ''"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <Icon name="mdi:shopping-outline" size="20" class="text-white/40" />
          </div>
        </div>
        <!-- Info -->
        <div class="min-w-0 flex-1">
          <p class="line-clamp-1 text-[12px] font-bold text-white">{{ taggedProduct.title }}</p>
          <p class="text-[13px] font-black text-brand">{{ formatPrice(taggedProduct.price || 0) }}</p>
        </div>
        <!-- Shop arrow -->
        <NuxtLink
          :to="`/product/${taggedProduct.slug || taggedProduct.id}`"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/40"
          @click.stop
        >
          <Icon name="mdi:arrow-right" size="16" />
        </NuxtLink>
      </div>
    </Transition>

    <!-- ─── RIGHT ACTION BAR ─────────────────────────────────────────── -->
    <div
      class="absolute bottom-28 right-3 z-20 flex flex-col items-center gap-5"
    >
      <!-- Avatar & Follow -->
      <div class="relative mb-2">
        <NuxtLink :to="reel.author?.role === 'seller'
          ? `/sellers/profile/${reel.product?.seller?.store_slug || reel.author?.username}`
          : `/profile/${reel.author?.username}`">
          <img
            :src="
              reel.author?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.author?.username}`
            "
            class="h-12 w-12 rounded-full border-2 border-white bg-neutral-800 object-cover shadow-lg"
          />
        </NuxtLink>
        <!-- Quick Follow Button -->
        <button
          class="absolute -bottom-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-black bg-brand transition-transform hover:scale-110"
        >
          <Icon name="mdi:plus" size="14" class="text-white" />
        </button>
      </div>

      <!-- Like -->
      <button
        @click.stop="handleLike"
        class="group flex flex-col items-center gap-1"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors group-hover:bg-black/40"
        >
          <Icon
            :name="isLiked ? 'mdi:heart' : 'mdi:heart-outline'"
            size="26"
            class="transition-transform group-active:scale-75"
            :class="
              isLiked
                ? 'text-brand drop-shadow-[0_0_8px_rgba(240,44,86,0.8)]'
                : 'text-white'
            "
          />
        </div>
        <span class="text-shadow text-[12px] font-bold text-white">{{
          formatCount(localLikeCount)
        }}</span>
      </button>

      <!-- Comment -->
      <button
        @click.stop="$emit('open-comments', reel)"
        class="group flex flex-col items-center gap-1"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors group-hover:bg-black/40"
        >
          <Icon
            name="mdi:comment-processing-outline"
            size="24"
            class="text-white transition-transform group-active:scale-75"
          />
        </div>
        <span class="text-shadow text-[12px] font-bold text-white">{{
          formatCount(reel.commentCount || 0)
        }}</span>
      </button>

      <!-- Share -->
      <button
        @click.stop="handleShare"
        class="group flex flex-col items-center gap-1"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md transition-colors group-hover:bg-black/40"
        >
          <Icon
            name="mdi:share-variant"
            size="24"
            class="text-white transition-transform group-active:scale-75"
          />
        </div>
        <span class="text-shadow text-[12px] font-bold text-white">{{
          formatCount(reel.shareCount || 0)
        }}</span>
      </button>

      <!-- Mute Toggle — hidden when bg music owns the audio -->
      <button
        v-if="!reel.bgMusic"
        @click.stop="isMuted = !isMuted"
        class="mt-2 flex flex-col items-center gap-1"
      >
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md"
        >
          <Icon
            :name="isMuted ? 'mdi:volume-off' : 'mdi:volume-high'"
            size="16"
            class="text-white"
          />
        </div>
      </button>
    </div>

    <!-- ─── BOTTOM INFO OVERLAY ──────────────────────────────────────── -->
    <div class="absolute bottom-6 left-4 right-16 z-20 flex flex-col gap-2.5">
      <!-- Author Info -->
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="reel.author?.role === 'seller'
            ? `/sellers/profile/${reel.product?.seller?.store_slug || reel.author?.username}`
            : `/profile/${reel.author?.username}`"
          class="text-shadow text-[15px] font-bold text-white hover:underline"
        >
          {{ reel.author?.role === 'seller' ? reel.author?.username : `@${reel.author?.username || 'User'}` }}
        </NuxtLink>
        <span
          v-if="reel.contentType === 'POST'"
          class="rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md"
        >
          Buyer Post
        </span>
      </div>

      <!-- Caption -->
      <p
        v-if="reel.caption"
        class="text-shadow line-clamp-2 pr-4 text-sm leading-snug text-white/95"
      >
        {{ reel.caption }}
      </p>

      <!-- Shop Now CTA (If Product Tagged) -->
      <NuxtLink
        v-if="taggedProduct"
        :to="`/product/${taggedProduct.slug || taggedProduct.id}`"
        class="mt-1 inline-flex w-max items-center gap-2 rounded-full border border-white/50 bg-white/95 px-5 py-2.5 text-sm font-bold text-black shadow-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        @click.stop
      >
        <div class="rounded-full bg-brand/10 p-1 text-brand">
          <Icon name="mdi:shopping" size="16" />
        </div>
        Shop Now • {{ formatPrice(taggedProduct.price || 0) }}
      </NuxtLink>

      <!-- Progress Bar -->
      <div
        class="relative mt-2 h-1 w-full cursor-pointer overflow-hidden rounded-full bg-white/20"
        @click.stop="seekVideo"
      >
        <div
          class="h-full bg-white transition-none"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import { usePostStore } from '~~/layers/social/app/store/post.store'
import { usePost } from '~~/layers/social/app/composables/usePost'
import { useSettings } from '~~/layers/profile/app/composables/useSettings' // Adjust path if needed

const props = defineProps<{
  reel: IFeedItem
  isActive: boolean
  index: number
}>()

const emit = defineEmits<{
  'open-comments': [reel: IFeedItem]
}>()

// DOM & Media State
const videoEl = ref<HTMLVideoElement | null>(null)
const musicEl = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const progress = ref(0)
const { settings } = useSettings() // Assuming this manages global app settings
// If reel has bg music, video stays silent and music provides the audio
const isMuted = ref(!!(props.reel.bgMusic) || (settings.value?.autoMute ?? false))

// Stores & Actions
const postStore = usePostStore()
const { likePost, unlikePost } = usePost()

// Computed Data — check mediaItems first, fall back to legacy media field
const videoUrl = computed(() => {
  const fromItems = props.reel.mediaItems?.find((m) => m.type === 'VIDEO')
  if (fromItems) return fromItems.url
  return props.reel.media?.type === 'VIDEO' ? props.reel.media.url : ''
})
const taggedProduct = computed(
  () => props.reel.taggedProducts?.[0] ?? props.reel.product ?? null,
)
const isLiked = computed(() => postStore.isPostLiked(props.reel.id))
const localLikeCount = ref(props.reel.likeCount || 0)

// ─── PRODUCT FLOAT-UP ─────────────────────────────────────────────────
const showProductFloat = ref(false)
let floatTimer: ReturnType<typeof setTimeout> | null = null
let floatHideTimer: ReturnType<typeof setTimeout> | null = null

const scheduleProductFloat = () => {
  if (!taggedProduct.value) return
  clearTimeout(floatTimer ?? 0)
  clearTimeout(floatHideTimer ?? 0)
  floatTimer = setTimeout(() => {
    showProductFloat.value = true
    floatHideTimer = setTimeout(() => { showProductFloat.value = false }, 4500)
  }, 3000)
}

const cancelProductFloat = () => {
  clearTimeout(floatTimer ?? 0)
  clearTimeout(floatHideTimer ?? 0)
  showProductFloat.value = false
}

// ─── TAP-TO-UNMUTE ────────────────────────────────────────────────────
const showUnmuteHint = ref(false)
let unmuteHintTimer: ReturnType<typeof setTimeout> | null = null

const tapToUnmute = () => {
  isMuted.value = false
  showUnmuteHint.value = false
}

const scheduleUnmuteHint = () => {
  if (props.reel.bgMusic) return // bg music track, not video audio
  clearTimeout(unmuteHintTimer ?? 0)
  showUnmuteHint.value = isMuted.value
  if (isMuted.value) {
    // Auto-hide after 5s so it doesn't stay forever
    unmuteHintTimer = setTimeout(() => { showUnmuteHint.value = false }, 5000)
  }
}

// ─── PLAYBACK CONTROL ─────────────────────────────────────────────────
const playVideo = () => {
  if (!videoEl.value) return
  videoEl.value
    .play()
    .then(() => { isPlaying.value = true })
    .catch((err) => {
      console.warn('Autoplay prevented:', err)
      isPlaying.value = false
    })
}

// onMounted handles the initial active state (watcher with immediate:true
// fires before the DOM is ready so videoEl.value is null)
onMounted(() => {
  if (props.isActive) {
    playVideo()
    if (props.reel.bgMusic) musicEl.value?.play().catch(() => {})
    scheduleProductFloat()
    scheduleUnmuteHint()
  }
})

watch(
  () => props.isActive,
  (active) => {
    if (!videoEl.value) return
    if (active) {
      playVideo()
      if (props.reel.bgMusic) musicEl.value?.play().catch(() => {})
      scheduleProductFloat()
      scheduleUnmuteHint()
    } else {
      videoEl.value.pause()
      videoEl.value.currentTime = 0
      isPlaying.value = false
      progress.value = 0
      musicEl.value?.pause()
      if (musicEl.value) musicEl.value.currentTime = 0
      cancelProductFloat()
      showUnmuteHint.value = false
      clearTimeout(unmuteHintTimer ?? 0)
    }
  },
)

const togglePlay = () => {
  if (!videoEl.value) return
  if (videoEl.value.paused) {
    videoEl.value
      .play()
      .then(() => {
        isPlaying.value = true
      })
      .catch(() => {})
  } else {
    videoEl.value.pause()
    isPlaying.value = false
  }
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────
let progressTimer: ReturnType<typeof setInterval> | null = null

watch(
  () => props.isActive,
  (active) => {
    if (progressTimer) clearInterval(progressTimer)

    if (active) {
      progressTimer = setInterval(() => {
        if (!videoEl.value) return
        const { currentTime, duration } = videoEl.value
        progress.value = duration ? (currentTime / duration) * 100 : 0
      }, 100) // Faster interval for smoother bar
    } else {
      progress.value = 0
    }
  },
)

const seekVideo = (e: MouseEvent) => {
  if (!videoEl.value) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickPos = (e.clientX - rect.left) / rect.width
  videoEl.value.currentTime = clickPos * videoEl.value.duration
}

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
  cancelProductFloat()
  clearTimeout(unmuteHintTimer ?? 0)
})

// ─── INTERACTIONS ─────────────────────────────────────────────────────
const handleLike = async () => {
  // Optimistic UI update
  if (isLiked.value) {
    localLikeCount.value--
    await unlikePost(props.reel.id)
  } else {
    localLikeCount.value++
    await likePost(props.reel.id)
  }
}

const handleShare = async () => {
  const url = `${window.location.origin}/post/${props.reel.id}`
  if (navigator.share) {
    await navigator
      .share({
        url,
        title:
          props.reel.caption ||
          `Check out this Reel from @${props.reel.author?.username}`,
      })
      .catch(() => {})
  } else {
    await navigator.clipboard.writeText(url).catch(() => {})
    // Optionally trigger a toast notification here
  }
}

// ─── UTILS ────────────────────────────────────────────────────────────
const formatCount = (n: number) => {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const { formatPrice } = useCurrency()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Clean, readable text shadow for overlaying text on videos */
.text-shadow {
  text-shadow:
    1px 1px 3px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(0, 0, 0, 0.4);
}

/* ─── Product float-up transition ─────────────────────────────────────── */
.product-float-enter-active {
  transition: transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.3s ease;
}
.product-float-leave-active {
  transition: transform 0.3s ease-in, opacity 0.25s ease;
}
.product-float-enter-from,
.product-float-leave-to {
  transform: translateY(24px);
  opacity: 0;
}

/* ─── Tap-to-unmute pill ──────────────────────────────────────────────── */
.unmute-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  animation: unmutePulse 2s ease-in-out infinite;
}
@keyframes unmutePulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.04); }
}

.unmute-fade-enter-active { transition: opacity 0.3s ease; }
.unmute-fade-leave-active { transition: opacity 0.25s ease; }
.unmute-fade-enter-from,
.unmute-fade-leave-to { opacity: 0; }
</style>
