<template>
  <div class="relative w-full">
    <!-- ── Single VIDEO ── -->
    <div
      v-if="primaryMedia?.type === 'VIDEO'"
      class="relative w-full cursor-pointer overflow-hidden bg-black"
      :style="videoContainerStyle"
      @click="emit('click')"
    >
      <video
        ref="videoRef"
        :src="videoFeedUrl(primaryMedia.url, isSlowNetwork)"
        :poster="primaryMedia.thumbnailUrl"
        class="h-full w-full object-cover"
        loop
        playsinline
        :muted="videoMuted"
        preload="none"
      />

      <!-- Slow network: prominent tap-to-load overlay shown until user opts in -->
      <div
        v-if="isSlowNetwork && !videoActivated"
        class="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.stop="activateVideo(); videoRef?.play().catch(() => {})"
      >
        <Icon name="mdi:play-circle-outline" size="54" class="mb-1 text-white/90" />
        <span class="text-xs font-medium text-white/70">Tap to play</span>
      </div>

      <!-- Fast network: decorative play icon (autoplay via IntersectionObserver) -->
      <div
        v-else
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
        >
          <Icon name="mdi:play" size="26" class="ml-0.5 text-white" />
        </div>
      </div>

      <button
        @click.stop="emit('music-toggle')"
        class="pointer-events-auto absolute right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70"
        :class="post.bgMusic ? 'bottom-14' : 'bottom-3'"
      >
        <Icon
          :name="soundEnabled ? 'mdi:volume-high' : 'mdi:volume-off'"
          size="16"
          class="text-white"
        />
      </button>
    </div>

    <!-- ── Standalone AUDIO ── -->
    <div v-else-if="primaryMedia?.type === 'AUDIO'" class="px-3 pb-2 pt-1">
      <AudioPlayer :src="primaryMedia.url" />
    </div>

    <!-- ── Single IMAGE ── -->
    <div
      v-else-if="mediaItems.length === 1 && primaryMedia?.type === 'IMAGE'"
      class="relative w-full cursor-pointer overflow-hidden bg-gray-100 dark:bg-neutral-900"
      :style="imageContainerStyle"
      @click="emit('click')"
    >
      <!--
        LQIP: 20px blurred placeholder. Loads in <100 ms on any network.
        Gives users instant visual feedback instead of a grey pulse skeleton.
      -->
      <div
        class="absolute inset-0 scale-110 bg-cover bg-center"
        :style="{ backgroundImage: `url(${imgLqip(primaryMedia.url)})`, filter: 'blur(16px)' }"
        aria-hidden="true"
      />
      <!-- Full-res blurred backdrop (once loaded, slightly better quality) -->
      <img
        v-if="imageLoaded"
        :src="imgFeed(primaryMedia.url)"
        class="pointer-events-none absolute inset-0 h-full w-full scale-110 select-none object-cover opacity-30 blur-xl"
        aria-hidden="true"
      />
      <img
        :src="imgFeed(primaryMedia.url)"
        :alt="post.caption || 'Post image'"
        class="relative h-full w-full object-contain transition-opacity duration-500"
        :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
        loading="lazy"
        decoding="async"
        @load="onImageLoad"
        @error="onImageError"
      />
      <!-- Sound button for images that have background music -->
      <button
        v-if="post.bgMusic"
        @click.stop="emit('music-toggle')"
        class="absolute bottom-14 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <Icon
          :name="soundEnabled ? 'mdi:volume-high' : 'mdi:volume-off'"
          size="16"
          class="text-white"
        />
      </button>
    </div>

    <!-- ── MULTI-IMAGE COLLAGE ── -->
    <div
      v-else-if="mediaItems.length > 1"
      class="w-full cursor-pointer"
      @click="emit('click')"
    >
      <!-- 2: side by side -->
      <div v-if="mediaItems.length === 2" class="grid grid-cols-2 gap-0.5">
        <div
          v-for="item in mediaItems"
          :key="item.id"
          class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-900"
        >
          <img
            :src="imgFeed(item.url)"
            class="h-full w-full object-cover"
            :alt="post.caption || ''"
          loading="lazy"
          decoding="async"
          />
          <div
            v-if="item.type === 'VIDEO'"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-black/40"
            >
              <Icon name="mdi:play" size="18" class="ml-0.5 text-white" />
            </div>
          </div>
        </div>
      </div>
      <!-- 3: 1 tall left + 2 stacked right -->
      <div
        v-else-if="mediaItems.length === 3"
        class="relative w-full"
        style="aspect-ratio: 4/3"
      >
        <div class="absolute inset-0 grid grid-cols-2 gap-0.5">
          <div
            class="relative overflow-hidden bg-gray-100 dark:bg-neutral-900"
          >
            <img
              :src="imgFeed(mediaItems[0]!.url)"
              class="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            />
          </div>
          <div class="grid grid-rows-2 gap-0.5">
            <div
              class="relative overflow-hidden bg-gray-100 dark:bg-neutral-900"
            >
              <img
                :src="imgFeed(mediaItems[1]!.url)"
                class="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div
              class="relative overflow-hidden bg-gray-100 dark:bg-neutral-900"
            >
              <img
                :src="imgFeed(mediaItems[2]!.url)"
                class="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- 4: 2×2 grid -->
      <div
        v-else-if="mediaItems.length === 4"
        class="grid grid-cols-2 gap-0.5"
      >
        <div
          v-for="item in mediaItems"
          :key="item.id"
          class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-900"
        >
          <img
            :src="imgFeed(item.url)"
            class="h-full w-full object-cover"
            :alt="post.caption || ''"
          loading="lazy"
          decoding="async"
          />
        </div>
      </div>
      <!-- 5+: 1 big top + row of 2 with +N badge -->
      <div v-else class="grid grid-cols-2 gap-0.5">
        <div
          class="relative col-span-2 aspect-video overflow-hidden bg-gray-100 dark:bg-neutral-900"
        >
          <img :src="imgFeed(mediaItems[0]!.url)" class="h-full w-full object-cover" />
        </div>
        <div
          class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-900"
        >
          <img :src="imgFeed(mediaItems[1]!.url)" class="h-full w-full object-cover" />
        </div>
        <div
          class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-900"
        >
          <img :src="imgFeed(mediaItems[2]!.url)" class="h-full w-full object-cover" />
          <div
            v-if="mediaItems.length > 3"
            class="absolute inset-0 flex items-center justify-center bg-black/55"
          >
            <span class="text-xl font-bold text-white"
              >+{{ mediaItems.length - 3 }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- COMMERCE badge (seller posts only) -->
    <div
      v-if="isSeller && post.contentType === 'COMMERCE'"
      class="pointer-events-none absolute left-2 top-2"
    >
      <span
        class="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
      >
        <Icon name="mdi:shopping-outline" size="11" />{{
          $t('contentType.COMMERCE')
        }}
      </span>
    </div>

    <!-- ── Background music strip ── -->
    <PostBgMusicStrip
      v-if="post.bgMusic"
      :bg-music="post.bgMusic"
      :playing="musicPlaying"
      :sound-enabled="soundEnabled"
      @toggle="emit('music-toggle')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { imgFeed, imgLqip, videoFeedUrl } from '~~/layers/core/app/utils/cloudinary'
import AudioPlayer from '../AudioPlayer.vue'
import PostBgMusicStrip from './PostBgMusicStrip.vue'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const props = defineProps<{
  mediaItems: any[]
  post: IFeedItem
  soundEnabled: boolean
  musicPlaying: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'music-toggle'): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)

// ─── Network quality detection ────────────────────────────────────────────────
// Detects slow connections (2G/3G or Data Saver mode) on Android/Chrome.
// On slow networks: skip autoplay, show "Tap to play" overlay to save user data.
const isSlowNetwork = computed(() => {
  if (process.server) return false
  const conn = (navigator as any).connection
  return !!(conn?.saveData || ['slow-2g', '2g', '3g'].includes(conn?.effectiveType))
})

// ─── Video activation ─────────────────────────────────────────────────────────
// videoActivated: set when user taps "Tap to play" OR when PostCard's preload
// observer fires (card ~400px from viewport on fast networks).
const videoActivated = ref(false)

const activateVideo = () => {
  videoActivated.value = true
  if (videoRef.value && videoRef.value.preload === 'none') {
    // Upgrade from "none" → "metadata" so the browser fetches just enough
    // to know duration/dimensions, which reduces startup lag on play().
    videoRef.value.preload = 'metadata'
  }
}

/** True when PostCard's play observer should actually call play() */
const canAutoplay = computed(() => !isSlowNetwork.value || videoActivated.value)

defineExpose({ videoRef, activateVideo, canAutoplay })

const primaryMedia = computed(() => props.mediaItems[0])

const isSeller = computed(() => props.post.author?.role === 'seller')

// ─── Image dimension tracking ─────────────────────────────────────────────────
const imageNaturalWidth = ref(0)
const imageNaturalHeight = ref(0)
const imageLoaded = ref(false)
const imageError = ref(false)

const onImageLoad = (e: Event) => {
  const img = e.target as HTMLImageElement
  imageNaturalWidth.value = img.naturalWidth
  imageNaturalHeight.value = img.naturalHeight
  imageLoaded.value = true
}

const onImageError = () => {
  imageError.value = true
  imageLoaded.value = true
}

// ─── Image aspect ratio ───────────────────────────────────────────────────────
const imageContainerStyle = computed(() => {
  if (!imageLoaded.value || imageNaturalWidth.value === 0) {
    return { aspectRatio: '4 / 5' }
  }
  const natural = imageNaturalWidth.value / imageNaturalHeight.value
  const clamped = Math.min(1.0, Math.max(0.8, natural))
  return { aspectRatio: `${clamped}` }
})

// ─── Video aspect ratio ───────────────────────────────────────────────────────
const videoContainerStyle = computed(() => ({
  aspectRatio: '9 / 16',
  maxHeight: '75vh',
}))

// Muted when: feed sound is globally off, OR bgMusic is present
const videoMuted = computed(() => !props.soundEnabled || !!props.post.bgMusic)

</script>

