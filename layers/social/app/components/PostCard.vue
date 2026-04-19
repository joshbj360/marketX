<template>
  <article
    ref="cardRef"
    class="w-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
  >
    <!-- ─── Content-type accent stripe ──────────────────────────────── -->
    <div class="h-[3px] w-full" :class="accentBgClass" />

    <!-- ─── Header ──────────────────────────────────────────────────── -->
    <PostCardHeader
      :post="post"
      :is-owner="isOwner"
      @edit="openEdit"
      @delete="handleDelete"
    />

    <!-- ─── Text-only body ───────────────────────────────────────────── -->
    <template v-if="!hasMedia && (cleanCaption || post.content)">
      <!-- INSPIRATION: quote-style card -->
      <div
        v-if="post.contentType === 'INSPIRATION'"
        class="mx-3 mb-3 cursor-pointer rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 pb-4 pt-3 dark:bg-amber-950/20"
        @click="$emit('open-details', post)"
      >
        <Icon
          name="mdi:format-quote-open"
          size="20"
          class="mb-1 text-amber-400"
        />
        <p
          class="whitespace-pre-wrap text-[15px] font-medium italic leading-relaxed text-gray-900 dark:text-neutral-100"
          :class="isTextLong && !textExpanded ? 'line-clamp-6' : ''"
        >
          {{ cleanCaption || post.content }}
        </p>
        <button
          v-if="isTextLong && !textExpanded"
          class="mt-1 text-[12px] text-amber-500"
          @click.stop="textExpanded = true"
        >
          {{ $t('common.more') }}
        </button>
      </div>

      <!-- EDUCATIONAL: step/learn style -->
      <div
        v-else-if="post.contentType === 'EDUCATIONAL'"
        class="mx-3 mb-3 cursor-pointer rounded-xl bg-orange-50 px-4 pb-4 pt-3 dark:bg-orange-950/20"
        @click="$emit('open-details', post)"
      >
        <p
          class="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-900 dark:text-neutral-100"
          :class="isTextLong && !textExpanded ? 'line-clamp-6' : ''"
        >
          {{ cleanCaption || post.content }}
        </p>
        <button
          v-if="isTextLong && !textExpanded"
          class="mt-1 text-[12px] text-orange-500"
          @click.stop="textExpanded = true"
        >
          {{ $t('common.more') }}
        </button>
      </div>

      <!-- Default text (EXPERIENCE, ENTERTAINMENT, COMMERCE, etc.) — styled gradient card -->
      <div
        v-else
        class="mx-3 mb-3 cursor-pointer overflow-hidden rounded-2xl"
        :style="{ background: textBgStyle.bg }"
        @click="$emit('open-details', post)"
      >
        <div
          class="flex min-h-[140px] items-center justify-center px-5 py-6"
          :class="isTextLong ? 'items-start pt-5' : 'items-center'"
        >
          <p
            class="w-full whitespace-pre-wrap leading-relaxed text-white"
            :class="[
              isTextLong
                ? 'text-[14px]'
                : (cleanCaption || post.content || '').length < 80
                  ? 'text-center text-[20px] font-semibold'
                  : 'text-[15px] font-medium',
              isTextLong && !textExpanded ? 'line-clamp-6' : '',
            ]"
          >
            {{ cleanCaption || post.content }}
          </p>
        </div>
        <button
          v-if="isTextLong && !textExpanded"
          class="w-full pb-3 text-center text-[12px] font-semibold"
          :style="{ color: textBgStyle.text }"
          @click.stop="textExpanded = true"
        >
          {{ $t('common.more') }}
        </button>
      </div>
    </template>

    <!-- ─── Media (full-bleed) ───────────────────────────────────────── -->
    <PostMediaGallery
      v-if="hasMedia"
      :media-items="mediaItems"
      :post="post"
      :sound-enabled="soundEnabled"
      :music-playing="musicPlaying"
      ref="mediaGalleryRef"
      @click="$emit('open-details', post)"
      @music-toggle="toggleAllSound"
    />

    <!-- Hidden background-music audio element -->
    <audio
      v-if="post.bgMusic"
      ref="musicRef"
      :src="post.bgMusic.url"
      loop
      preload="none"
    />

    <!-- ─── Action Bar ────────────────────────────────────────────────── -->
    <PostCardActions
      :post="post"
      :local-is-liked="localIsLiked"
      :local-like-count="localLikeCount"
      :is-bookmarked="isBookmarked"
      :has-media="hasMedia"
      @like="handleLike"
      @bookmark="handleBookmark"
      @comment="$emit('open-comments', post)"
      @share="sharePost"
      @open-likes="showLikes = true"
      @open-details="$emit('open-details', post)"
      @open-product="(id) => emit('open-product', id)"
    />
  </article>

  <!-- Edit modal (mounted outside article to avoid z-index issues) -->
  <PostEditModal
    v-if="showEditModal"
    :post="post"
    @close="showEditModal = false"
    @updated="onPostUpdated"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePost } from '../composables/usePost'
import { usePostStore } from '../store/post.store'
import { notify } from '@kyvg/vue3-notification'
import PostEditModal from './modals/PostEditModal.vue'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import PostCardHeader from './post-card/PostCardHeader.vue'
import PostMediaGallery from './post-card/PostMediaGallery.vue'
import PostCardActions from './post-card/PostCardActions.vue'

const { t } = useI18n()

const props = defineProps<{ post: IFeedItem }>()
const emit = defineEmits([
  'open-comments',
  'open-details',
  'deleted',
  'open-product',
])

const profileStore = useProfileStore()
const postStore = usePostStore()
const { likePost, unlikePost, savePost, unsavePost, deletePost } = usePost()
const { trackPost } = useViewTracker()
const cardRef = ref<HTMLElement | null>(null)
const mediaGalleryRef = ref<InstanceType<typeof PostMediaGallery> | null>(null)
const videoRef = computed(() => mediaGalleryRef.value?.videoRef ?? null)
const musicRef = ref<HTMLAudioElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)
const musicObserver = ref<IntersectionObserver | null>(null)
const musicPlaying = ref(false)

// ─── Like & Bookmark ──────────────────────────────────────────────────────────
const localIsLiked = ref(postStore.isPostLiked(props.post.id))
const localLikeCount = ref(props.post.likeCount || 0)
const isBookmarked = ref(postStore.savedPostIds.includes(props.post.id))
const showLikes = ref(false)

// ─── Owner / menu ─────────────────────────────────────────────────────────────
const isOwner = computed(
  () => !!profileStore.userId && profileStore.userId === props.post.author?.id,
)
const menuOpen = ref(false)
const showEditModal = ref(false)

const openEdit = () => {
  menuOpen.value = false
  showEditModal.value = true
}

const handleDelete = async () => {
  menuOpen.value = false
  if (!confirm(t('post.confirmDelete'))) return
  try {
    await deletePost(props.post.id)
    emit('deleted', props.post.id)
    notify({ type: 'success', text: t('post.deleted') })
  } catch {
    notify({ type: 'error', text: t('errors.failedDelete') })
  }
}

const onPostUpdated = (updates: any) => {
  // The store is already updated by updatePost; caption in the local feed item
  // will reflect on next render via the store. Nothing extra needed.
}

// Close menu when clicking outside
const closeMenu = () => {
  menuOpen.value = false
}
onMounted(() => document.addEventListener('click', closeMenu))
onUnmounted(() => document.removeEventListener('click', closeMenu))

// ─── Text expand ──────────────────────────────────────────────────────────────
const textExpanded = ref(false)

// ─── Image dimension tracking ─────────────────────────────────────────────────
const imageNaturalWidth = ref(0)
const imageNaturalHeight = ref(0)
const imageLoaded = ref(false)
const imageError = ref(false)

// ─── Media helpers ────────────────────────────────────────────────────────────
// Use mediaItems array (multi-media) when available, fall back to legacy single media
const mediaItems = computed(() =>
  props.post.mediaItems && props.post.mediaItems.length > 0
    ? props.post.mediaItems
    : props.post.media
      ? [props.post.media]
      : [],
)
const primaryMedia = computed(() => mediaItems.value[0])
const hasMedia = computed(() => mediaItems.value.length > 0)

// ─── Background music helpers ─────────────────────────────────────────────────
const { soundEnabled } = useFeedSound()
const cardVisible = ref(false)

// Sync watcher: fires in the same call stack as the user gesture that changed
// soundEnabled — so audio.play() is called while the gesture is still "active"
// and the browser allows it even on iOS Safari.
watch(soundEnabled, (enabled) => {
  // Imperatively sync video muted state — Vue's :muted binding alone isn't
  // always reliable on video elements after initial mount
  if (videoRef.value) {
    videoRef.value.muted = !enabled || !!props.post.bgMusic
  }

  // Control bgMusic audio element
  if (!musicRef.value) return
  if (enabled && cardVisible.value) {
    musicRef.value.play()
      .then(() => { musicPlaying.value = true })
      .catch(() => { musicPlaying.value = false })
  } else {
    musicRef.value.pause()
    musicPlaying.value = false
  }
}, { flush: 'sync' })

// Tapping the pill toggles feed-wide sound (no per-card state needed)
const toggleMusic = () => { soundEnabled.value = !soundEnabled.value }

const musicDisplayName = computed(() => {
  const name = props.post.bgMusic?.name
  if (!name) return 'Background Music'
  // Strip extension and prettify
  return name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
})
const shouldScrollMusic = computed(() => musicDisplayName.value.length > 22)

// ─── Content type system ──────────────────────────────────────────────────────
const CONTENT_TYPE_MAP: Record<
  string,
  {
    icon: string
    accent: string
    badge: string
  }
> = {
  EXPERIENCE: {
    icon: 'mdi:star-outline',
    accent: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  INSPIRATION: {
    icon: 'mdi:lightbulb-outline',
    accent: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  COMMERCE: {
    icon: 'mdi:shopping-outline',
    accent: 'bg-emerald-500',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  EDUCATIONAL: {
    icon: 'mdi:school-outline',
    accent: 'bg-orange-500',
    badge:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  },
  ENTERTAINMENT: {
    icon: 'mdi:music-note',
    accent: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  },
}

const contentTypeDef = computed(
  () =>
    CONTENT_TYPE_MAP[props.post.contentType] ?? {
      icon: 'mdi:tag-outline',
      accent: 'bg-gray-300 dark:bg-neutral-700',
      badge:
        'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
    },
)

const contentTypeLabel = computed(() =>
  t(`contentType.${props.post.contentType}`, props.post.contentType),
)
const badgeIcon = computed(() => contentTypeDef.value.icon)
const accentBgClass = computed(() => contentTypeDef.value.accent)
const badgeClass = computed(() => contentTypeDef.value.badge)

// ─── Image aspect ratio ───────────────────────────────────────────────────────
// Clamp between 4:5 (portrait) and 1:1 (square). Landscape → square with blurred fill.
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

// ─── Caption ──────────────────────────────────────────────────────────────────
const cleanCaption = computed(() => {
  if (!props.post.caption) return ''
  const withoutHashtags = props.post.caption.replace(/#\w+/g, '').trim()
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div')
    temp.innerHTML = withoutHashtags
    return (temp.textContent || temp.innerText || '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return withoutHashtags
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
})

const hashtags = computed(() => props.post.caption?.match(/#\w+/g) || [])
const isCaptionLong = computed(
  () =>
    (props.post.caption?.length ?? 0) + (props.post.content?.length ?? 0) > 120,
)
const isTextLong = computed(() => (props.post.content?.length ?? 0) > 200)

// ─── Text-post backgrounds — dark shade of each content type's accent ────────
const TEXT_BG_MAP: Record<string, { bg: string; text: string }> = {
  EXPERIENCE:    { bg: 'linear-gradient(160deg, #0d1b2e 0%, #1a3a5c 100%)', text: '#7dd3fc' },
  INSPIRATION:   { bg: 'linear-gradient(160deg, #1f1400 0%, #3d2800 100%)', text: '#fde047' },
  EDUCATIONAL:   { bg: 'linear-gradient(160deg, #1a0d00 0%, #3b1f00 100%)', text: '#fb923c' },
  ENTERTAINMENT: { bg: 'linear-gradient(160deg, #1f0016 0%, #3d0030 100%)', text: '#f472b6' },
  COMMERCE:      { bg: 'linear-gradient(160deg, #00180f 0%, #003d22 100%)', text: '#34d399' },
}
const TEXT_BG_DEFAULT = { bg: 'linear-gradient(160deg, #111111 0%, #222222 100%)', text: '#f3f4f6' }

const textBgStyle = computed(() =>
  TEXT_BG_MAP[props.post.contentType] ?? TEXT_BG_DEFAULT
)

// ─── Tagged products ──────────────────────────────────────────────────────────
const isSeller = computed(() => props.post.author?.role === 'seller')

const taggedProducts = computed(() =>
  (props.post.taggedProducts || []).map((t: any) => ({
    id: t.productId ?? t.id,
    title: t.product?.title ?? t.title,
    price: t.product?.price ?? t.price,
    slug: t.product?.slug ?? t.slug,
    image: t.product?.media?.[0]?.url ?? t.image ?? null,
  })),
)
// Only show commerce elements for seller posts
const hasTaggedProducts = computed(() => isSeller.value && taggedProducts.value.length > 0)

// ─── Actions ──────────────────────────────────────────────────────────────────
const handleLike = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: t('auth.loginToLike') })
    return
  }
  const wasLiked = localIsLiked.value
  localIsLiked.value = !wasLiked
  localLikeCount.value += wasLiked ? -1 : 1
  try {
    if (wasLiked) await unlikePost(props.post.id)
    else await likePost(props.post.id)
  } catch {
    localIsLiked.value = wasLiked
    localLikeCount.value += wasLiked ? 1 : -1
    notify({ type: 'error', text: t('errors.failedLike') })
  }
}

const handleBookmark = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: t('auth.loginToSave') })
    return
  }
  const wasSaved = isBookmarked.value
  isBookmarked.value = !wasSaved
  try {
    if (wasSaved) await unsavePost(props.post.id)
    else await savePost(props.post.id)
  } catch {
    isBookmarked.value = wasSaved
    notify({ type: 'error', text: t('errors.failedSave') })
  }
}

const sharePost = async () => {
  const shareUrl = `${window.location.origin}/post/${props.post.id}`
  try {
    if (navigator.share) {
      await navigator.share({
        url: shareUrl,
        title: props.post.caption || 'Check out this post',
      })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      notify({ type: 'success', text: t('post.linkCopied') })
    }
  } catch {
    notify({ type: 'error', text: t('errors.failedShare') })
  }
}

const timeAgo = (date: Date | string) => {
  if (!date) return ''
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return t('time.justNow')
  if (s < 3600) return t('time.minutesAgo', { n: Math.floor(s / 60) })
  if (s < 86400) return t('time.hoursAgo', { n: Math.floor(s / 3600) })
  return t('time.daysAgo', { n: Math.floor(s / 86400) })
}

// ─── Video mute toggle ────────────────────────────────────────────────────────
// Muted when: feed sound is globally off, OR bgMusic is present (bgMusic owns the audio track)
const videoMuted = computed(() => !soundEnabled.value || !!props.post.bgMusic)
// Single control for all audio on this card — bgMusic + video natural sound together
const toggleAllSound = () => { soundEnabled.value = !soundEnabled.value }

// ─── View tracking (3s dwell at ≥50% visibility) ─────────────────────────────
onMounted(() => {
  if (!cardRef.value) return
  let dwellTimer: ReturnType<typeof setTimeout> | null = null
  const viewObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry!.isIntersecting) {
        dwellTimer = setTimeout(() => trackPost(props.post.id), 3000)
      } else {
        if (dwellTimer) {
          clearTimeout(dwellTimer)
          dwellTimer = null
        }
      }
    },
    { threshold: 0.5 },
  )
  viewObserver.observe(cardRef.value)
  onUnmounted(() => {
    viewObserver.disconnect()
    if (dwellTimer) clearTimeout(dwellTimer)
  })
})

// ─── Video + Music autoplay on scroll ─────────────────────────────────────────
onMounted(() => {
  // ── Phase 1: Pre-enter preload ──────────────────────────────────────────────
  // When the card is ~400px from entering the viewport, tell the gallery to
  // upgrade the video from preload="none" → preload="metadata". The browser
  // fetches a few KB (duration, dimensions, first keyframe) so that when the
  // card actually enters view, playback starts near-instantly instead of
  // freezing on a black frame while the connection warms up.
  // Fires once then immediately disconnects to avoid keeping an observer alive
  // for the full lifetime of the card.
  if (cardRef.value && hasMedia.value) {
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          mediaGalleryRef.value?.activateVideo()
          preloadObserver.disconnect()
        }
      },
      { rootMargin: '400px 0px', threshold: 0 },
    )
    preloadObserver.observe(cardRef.value)
    onUnmounted(() => preloadObserver.disconnect())
  }

  // ── Phase 2: In-viewport play ──────────────────────────────────────────────
  // Video observer
  if (videoRef.value) {
    // Apply initial muted state imperatively — :muted binding isn't always reliable
    videoRef.value.muted = !soundEnabled.value || !!props.post.bgMusic
    observer.value = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) {
          // Respect slow-network opt-in: don't autoplay unless user said OK
          if (mediaGalleryRef.value?.canAutoplay !== false) {
            videoRef.value?.play().catch(() => {})
          }
        } else {
          videoRef.value?.pause()
        }
      },
      { threshold: 0.5 },
    )
    observer.value.observe(videoRef.value)
  }

  // Music observer — tracks visibility, plays only when feed sound is on
  if (props.post.bgMusic && cardRef.value) {
    musicObserver.value = new IntersectionObserver(
      ([entry]) => {
        cardVisible.value = entry!.isIntersecting
        if (!entry!.isIntersecting) {
          musicRef.value?.pause()
          musicPlaying.value = false
        } else if (soundEnabled.value) {
          // Browser already unlocked (user tapped a pill earlier this session)
          musicRef.value?.play()
            .then(() => { musicPlaying.value = true })
            .catch(() => { musicPlaying.value = false })
        }
      },
      { threshold: 0.5 },
    )
    musicObserver.value.observe(cardRef.value)
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
  musicObserver.value?.disconnect()
  musicRef.value?.pause()
})
</script>

