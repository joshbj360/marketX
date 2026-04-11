<template>
  <article
    ref="cardRef"
    class="w-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
  >
    <!-- ─── Content-type accent stripe ──────────────────────────────── -->
    <div class="h-[3px] w-full" :class="accentBgClass" />

    <!-- ─── Header ──────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between px-3 py-2.5">
      <div class="flex min-w-0 items-center gap-2">
        <NuxtLink :to="`/profile/${post.author?.username}`" class="shrink-0">
          <Avatar
            :username="post.author?.username ?? 'User'"
            :avatar="post.author?.avatar ?? ''"
            size="sm"
          />
        </NuxtLink>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-1.5">
            <NuxtLink
              :to="`/profile/${post.author?.username}`"
              class="text-[13px] font-semibold leading-tight text-gray-900 transition-opacity hover:opacity-75 dark:text-neutral-100"
            >
              {{ post.author?.username }}
            </NuxtLink>
            <!-- Content type badge -->
            <span
              class="inline-flex select-none items-center gap-0.5 rounded-full px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-widest"
              :class="badgeClass"
            >
              <Icon :name="badgeIcon" size="9" />
              {{ contentTypeLabel }}
            </span>
            <!-- Follow button (only on others' posts) -->
            <template
              v-if="
                profileStore.userId &&
                post.author &&
                profileStore.userId !== post.author.id
              "
            >
              <span
                class="select-none text-xs text-gray-300 dark:text-neutral-600"
                >·</span
              >
              <FollowButton
                :user-id="post.author.id"
                :username="post.author?.username"
              />
            </template>
          </div>
        </div>
      </div>
      <!-- ─── Owner actions menu ──────────────────────────────── -->
      <div v-if="isOwner" class="relative ml-1 shrink-0">
        <button
          @click.stop="menuOpen = !menuOpen"
          class="rounded-full p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
        >
          <Icon name="mdi:dots-horizontal" size="20" />
        </button>
        <div
          v-if="menuOpen"
          class="absolute right-0 top-8 z-20 min-w-[140px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
          @click.stop
        >
          <button
            @click="openEdit"
            class="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 transition-colors hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <Icon name="mdi:pencil-outline" size="16" />
            {{ $t('post.editPost') }}
          </button>
          <button
            @click="handleDelete"
            class="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Icon name="mdi:delete-outline" size="16" />
            {{ $t('post.deletePost') }}
          </button>
        </div>
      </div>
      <button
        v-else
        class="ml-1 shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
      >
        <Icon name="mdi:dots-horizontal" size="20" />
      </button>
    </div>

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

      <!-- Default text (EXPERIENCE, ENTERTAINMENT, COMMERCE, etc.) -->
      <div
        v-else
        class="cursor-pointer px-3 pb-2"
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
          class="mt-0.5 text-[12px] text-gray-400 dark:text-neutral-500"
          @click.stop="textExpanded = true"
        >
          {{ $t('common.more') }}
        </button>
      </div>
    </template>

    <!-- ─── Media (full-bleed) ───────────────────────────────────────── -->
    <div v-if="hasMedia" class="relative w-full">
      <!-- ── Single VIDEO ── -->
      <div
        v-if="primaryMedia?.type === 'VIDEO'"
        class="relative w-full cursor-pointer overflow-hidden bg-black"
        :style="videoContainerStyle"
        @click="$emit('open-details', post)"
      >
        <video
          ref="videoRef"
          :src="primaryMedia.url"
          :poster="primaryMedia.thumbnailUrl"
          class="h-full w-full object-cover"
          loop
          playsinline
          :muted="videoMuted"
          preload="none"
        />
        <div
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
          >
            <Icon name="mdi:play" size="26" class="ml-0.5 text-white" />
          </div>
        </div>
        <button
          v-if="!post.bgMusic"
          @click.stop="toggleMute"
          class="pointer-events-auto absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <Icon
            :name="videoMuted ? 'mdi:volume-off' : 'mdi:volume-high'"
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
        @click="$emit('open-details', post)"
      >
        <img
          v-if="imageLoaded"
          :src="imgFeed(primaryMedia.url)"
          class="pointer-events-none absolute inset-0 h-full w-full scale-110 select-none object-cover opacity-30 blur-xl"
          aria-hidden="true"
        />
        <img
          :src="imgFeed(primaryMedia.url)"
          :alt="post.caption || 'Post image'"
          class="relative h-full w-full object-contain transition-opacity duration-300"
          :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div
          v-if="!imageLoaded && !imageError"
          class="absolute inset-0 animate-pulse bg-gray-200 dark:bg-neutral-800"
        />
      </div>

      <!-- ── MULTI-IMAGE COLLAGE ── -->
      <div
        v-else-if="mediaItems.length > 1"
        class="w-full cursor-pointer"
        @click="$emit('open-details', post)"
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
      <div
        v-if="post.bgMusic"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      >
        <!-- Soft gradient fade -->
        <div
          class="h-14 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
        />
        <!-- Content row — pointer-events-auto so the pill is tappable -->
        <div
          class="pointer-events-auto flex cursor-pointer items-center gap-2.5 bg-gradient-to-r from-black/80 to-black/50 px-3 pb-3 pt-1"
          @click.stop="toggleMusic"
        >
          <!-- Spinning vinyl disc -->
          <div class="vinyl-disc shrink-0" :class="{ spinning: musicPlaying }">
            <div class="vinyl-hole" />
          </div>
          <!-- Track name -->
          <div class="min-w-0 flex-1">
            <p
              class="mb-[3px] text-[9px] font-medium uppercase leading-none tracking-widest text-white/50"
            >
              <Icon name="mdi:music-note" size="9" class="-mt-0.5 inline" />
              {{ $t('music.backgroundMusic') }}
            </p>
            <div class="overflow-hidden">
              <!-- Duplicate text creates seamless loop -->
              <span
                v-if="shouldScrollMusic"
                class="marquee-text inline-block text-[11px] font-semibold leading-tight text-white"
              >
                {{ musicDisplayName }}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{{
                  musicDisplayName
                }}
              </span>
              <span
                v-else
                class="block truncate text-[11px] font-semibold leading-tight text-white"
              >
                {{ musicDisplayName }}
              </span>
            </div>
          </div>
          <!-- Equalizer bars -->
          <div class="eq-bars shrink-0" :class="{ playing: musicPlaying }">
            <div class="eq-bar" style="--h: 40%; --d: 0s" />
            <div class="eq-bar" style="--h: 100%; --d: 0.12s" />
            <div class="eq-bar" style="--h: 65%; --d: 0.07s" />
            <div class="eq-bar" style="--h: 85%; --d: 0.18s" />
            <div class="eq-bar" style="--h: 50%; --d: 0.03s" />
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden background-music audio element -->
    <audio
      v-if="post.bgMusic"
      ref="musicRef"
      :src="post.bgMusic.url"
      loop
      preload="none"
    />

    <!-- ─── Action Bar ────────────────────────────────────────────────── -->
    <div class="px-3 pt-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <!-- Like -->
          <button
            @click.stop="handleLike"
            class="group rounded-full p-2 focus:outline-none"
            :aria-label="localIsLiked ? 'Unlike' : 'Like'"
          >
            <Icon
              :name="localIsLiked ? 'mdi:heart' : 'mdi:heart-outline'"
              size="25"
              class="transition-all duration-150 group-active:scale-75"
              :class="
                localIsLiked
                  ? 'text-red-500'
                  : 'text-gray-900 dark:text-neutral-100'
              "
            />
          </button>
          <!-- Comment -->
          <button
            @click.stop="$emit('open-comments', post)"
            class="group rounded-full p-2 focus:outline-none"
            aria-label="Comment"
          >
            <Icon
              name="mdi:comment-outline"
              size="23"
              class="text-gray-900 transition-transform group-active:scale-75 dark:text-neutral-100"
            />
          </button>
          <!-- Share -->
          <button
            @click.stop="sharePost"
            class="group rounded-full p-2 focus:outline-none"
            aria-label="Share"
          >
            <Icon
              name="mdi:send-outline"
              size="22"
              class="-rotate-12 text-gray-900 transition-transform group-active:scale-75 dark:text-neutral-100"
            />
          </button>
        </div>
        <!-- Bookmark -->
        <button
          @click.stop="handleBookmark"
          class="group rounded-full p-2 focus:outline-none"
          :aria-label="isBookmarked ? 'Remove bookmark' : 'Save'"
        >
          <Icon
            :name="isBookmarked ? 'mdi:bookmark' : 'mdi:bookmark-outline'"
            size="25"
            class="text-gray-900 transition-all group-active:scale-75 dark:text-neutral-100"
          />
        </button>
      </div>

      <!-- Like count -->
      <button
        v-if="localLikeCount > 0"
        class="px-1 text-left text-[13px] font-semibold leading-snug text-gray-900 transition-opacity hover:opacity-70 dark:text-neutral-100"
        @click.stop="showLikes = true"
      >
        {{ localLikeCount.toLocaleString() }}
        {{ localLikeCount === 1 ? $t('post.like') : $t('post.likes') }}
      </button>

      <LikesModal
        :is-open="showLikes"
        type="post"
        :target-id="post.id"
        @close="showLikes = false"
      />

      <!-- Caption (media posts) -->
      <div
        v-if="hasMedia && (cleanCaption || post.content)"
        class="mt-0.5 px-0"
      >
        <p class="text-[13px] leading-snug text-gray-900 dark:text-neutral-100">
          <NuxtLink
            :to="`/profile/${post.author?.username}`"
            class="mr-1 font-semibold transition-opacity hover:opacity-75"
            >{{ post.author?.username }}</NuxtLink
          >
          <span
            class="cursor-pointer"
            :class="isCaptionLong && !textExpanded ? 'line-clamp-2' : ''"
            @click.stop="$emit('open-details', post)"
            >{{ cleanCaption || post.content }}</span
          >
          <button
            v-if="isCaptionLong && !textExpanded"
            class="ml-0.5 text-gray-400 dark:text-neutral-500"
            @click.stop="textExpanded = true"
          >
            {{ $t('common.more') }}
          </button>
        </p>
      </div>

      <!-- Hashtags -->
      <div v-if="hashtags.length > 0" class="mt-1 flex flex-wrap gap-x-1.5 gap-y-1 px-1">
        <NuxtLink
          v-for="(tag, i) in hashtags"
          :key="i"
          :to="`/discover?tab=tags&tagName=${tag.slice(1)}`"
          class="text-[13px] font-semibold text-brand transition-opacity hover:opacity-70 dark:text-pink-400"
          @click.stop
        >{{ tag }}</NuxtLink>
      </div>

      <!-- View all comments -->
      <button
        v-if="post.commentCount > 0"
        @click.stop="$emit('open-comments', post)"
        class="mt-0.5 block px-1 text-[12px] text-gray-400 transition-colors hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        {{ $t('post.viewAll') }} {{ post.commentCount }}
        {{ post.commentCount === 1 ? $t('post.comment') : $t('post.comments') }}
      </button>

      <!-- Tagged Products (commerce shop strip) -->
      <div v-if="hasTaggedProducts" class="mt-2 px-1">
        <div class="mb-1 flex items-center gap-1">
          <Icon
            name="mdi:shopping-outline"
            size="13"
            class="text-emerald-500"
          />
          <span
            class="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400"
          >
            {{ $t('post.shopThisPost') }}
          </span>
        </div>
        <TaggedProductsDisplay
          :products="taggedProducts"
          :content-type="post.contentType"
          @select-product="(id) => emit('open-product', id)"
        />
      </div>

      <!-- Timestamp -->
      <p
        class="mt-1 px-1 pb-2.5 text-[11px] uppercase tracking-wide text-gray-400 dark:text-neutral-600"
      >
        {{ timeAgo(post?.created_at) }}
      </p>
    </div>
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
import FollowButton from '~~/layers/profile/app/components/FollowButton.vue'
import LikesModal from '~~/layers/social/app/components/modals/LikesModal.vue'
import { imgFeed } from '~~/layers/core/app/utils/cloudinary'
import TaggedProductsDisplay from './TaggedProductsDisplay.vue'
import PostEditModal from './modals/PostEditModal.vue'
import AudioPlayer from './AudioPlayer.vue'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'

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
const cardRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
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
  if (!cardVisible.value || !musicRef.value) return
  if (enabled) {
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
const { settings: appSettings } = useSettings()
// Force muted when bg music is present — music provides the audio, video stays silent
const videoMuted = ref(!!props.post.bgMusic || appSettings.value.autoMute)
const toggleMute = () => {
  videoMuted.value = !videoMuted.value
  if (videoRef.value) videoRef.value.muted = videoMuted.value
}

// ─── Video + Music autoplay on scroll ─────────────────────────────────────────
onMounted(() => {
  // Video observer
  if (videoRef.value) {
    videoRef.value.muted = appSettings.value.autoMute
    observer.value = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting) videoRef.value?.play().catch(() => {})
        else videoRef.value?.pause()
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

<style scoped>
/* ── Vinyl disc ─────────────────────────────────────────────────── */
.vinyl-disc {
  width: 30px;
  height: 30px;
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
    0 0 0 3px rgba(244, 114, 182, 0.15),
    inset 0 0 8px rgba(0, 0, 0, 0.6);
}
.vinyl-disc.spinning {
  animation: vinylSpin 3s linear infinite;
}
.vinyl-hole {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #fb7185, #e11d48);
  box-shadow: 0 0 6px rgba(244, 114, 182, 0.9);
}

/* ── Equalizer bars ─────────────────────────────────────────────── */
.eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
}
.eq-bar {
  width: 3px;
  height: var(--h);
  background: linear-gradient(to top, #f43f5e, #fb923c);
  border-radius: 2px;
  transition: height 0.4s ease;
}
.eq-bars.playing .eq-bar {
  animation: eqBounce 0.65s ease-in-out var(--d) infinite alternate;
}

/* ── Marquee text ───────────────────────────────────────────────── */
.marquee-text {
  animation: marquee 9s linear infinite;
  padding-right: 3rem;
}

/* ── Keyframes ──────────────────────────────────────────────────── */
@keyframes vinylSpin {
  from {
    transform: rotate(0deg);
  }
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
