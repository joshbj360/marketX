<template>
  <article
    class="flex cursor-pointer gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50/50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900/50"
    @click="emit('open-details', post)"
  >
    <!-- Left: thumbnail / placeholder -->
    <div class="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg">
      <img
        v-if="thumbUrl"
        :src="thumbUrl"
        :alt="post.caption || 'Post'"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center"
        :style="{ background: ctDef.bg }"
      >
        <Icon :name="ctDef.icon" size="22" class="text-white/60" />
      </div>
    </div>

    <!-- Right: content -->
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <!-- Author + badge + time -->
      <div class="flex items-center gap-1.5">
        <NuxtLink
          :to="`/profile/${post.author?.username}`"
          class="shrink-0"
          @click.stop
        >
          <img
            v-if="post.author?.avatar"
            :src="post.author.avatar"
            class="h-4 w-4 rounded-full object-cover"
            loading="lazy"
          />
          <Icon
            v-else
            name="mdi:account-circle-outline"
            size="16"
            class="text-gray-300 dark:text-neutral-600"
          />
        </NuxtLink>
        <NuxtLink
          :to="`/profile/${post.author?.username}`"
          class="truncate text-[11px] font-semibold text-gray-600 transition-colors hover:text-brand dark:text-neutral-400"
          @click.stop
        >
          {{ post.author?.username }}
        </NuxtLink>
        <span
          class="shrink-0 rounded-full px-1.5 py-px text-[8px] font-bold uppercase tracking-widest"
          :class="ctDef.badge"
        >
          {{ contentTypeLabel }}
        </span>
        <span
          class="ml-auto shrink-0 text-[10px] text-gray-400 dark:text-neutral-600"
        >
          {{ timeAgo(post.created_at) }}
        </span>
      </div>

      <!-- Caption -->
      <p
        class="line-clamp-2 text-[13px] leading-snug text-gray-900 dark:text-neutral-100"
      >
        <PostCaption
          :caption="post.caption || post.content"
          :mentions="post.mentions"
        />
      </p>

      <!-- Actions -->
      <div class="mt-auto flex items-center gap-3 pt-0.5" @click.stop>
        <button
          class="flex items-center gap-1 text-[12px] font-medium transition-colors"
          :class="
            localIsLiked
              ? 'text-brand'
              : 'text-gray-500 hover:text-brand dark:text-neutral-400 dark:hover:text-brand'
          "
          @click="handleLike"
        >
          <Icon
            :name="localIsLiked ? 'mdi:heart' : 'mdi:heart-outline'"
            size="14"
          />
          {{ localLikeCount }}
        </button>

        <button
          class="flex items-center gap-1 text-[12px] font-medium text-gray-500 transition-colors hover:text-blue-500 dark:text-neutral-400 dark:hover:text-blue-400"
          @click="emit('open-comments', post)"
        >
          <Icon name="mdi:comment-outline" size="13" />
          {{ post.commentCount }}
        </button>

        <button
          class="flex items-center gap-1 text-[12px] font-medium text-gray-500 transition-colors hover:text-green-500 dark:text-neutral-400 dark:hover:text-green-400"
          @click="handleShare"
        >
          <Icon name="mdi:share-outline" size="13" />
        </button>

        <button
          class="ml-auto flex items-center transition-colors"
          :class="
            isBookmarked
              ? 'text-gray-800 dark:text-neutral-200'
              : 'text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300'
          "
          @click="handleBookmark"
        >
          <Icon
            :name="isBookmarked ? 'mdi:bookmark' : 'mdi:bookmark-outline'"
            size="16"
          />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePost } from '../composables/usePost'
import { usePostStore } from '../store/post.store'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useShareModal } from '~~/layers/social/app/composables/useShareModal'
import { notify } from '@kyvg/vue3-notification'
import { imgThumb, videoThumb } from '~~/layers/core/app/utils/cloudinary'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import PostCaption from './PostCaption.vue'

const props = defineProps<{ post: IFeedItem }>()
const emit = defineEmits<{
  'open-details': [post: IFeedItem]
  'open-comments': [post: IFeedItem]
  deleted: [id: string]
}>()

const { t } = useI18n()
const profileStore = useProfileStore()
const postStore = usePostStore()
const { likePost, unlikePost, savePost, unsavePost } = usePost()
const { openShare } = useShareModal()

// ── Like & Bookmark ───────────────────────────────────────────────────────────
const localIsLiked = ref(postStore.isPostLiked(props.post.id))
const localLikeCount = ref(props.post.likeCount || 0)
const isBookmarked = ref(postStore.savedPostIds.includes(props.post.id))

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

const handleShare = async () => {
  const url = `${import.meta.client ? window.location.origin : ''}/post/${props.post.id}`
  try {
    if (navigator.share) {
      await navigator.share({
        url,
        title: props.post.caption || 'Check out this post',
      })
    } else {
      openShare(url, props.post.caption || 'Check out this post')
    }
  } catch {
    openShare(url, props.post.caption || 'Check out this post')
  }
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────
const mediaItems = computed(() =>
  props.post.mediaItems?.length
    ? props.post.mediaItems
    : props.post.media
      ? [props.post.media]
      : [],
)

const thumbUrl = computed(() => {
  const first = mediaItems.value[0]
  if (!first) return null
  if (first.type === 'VIDEO') return videoThumb(first.url) ?? null
  return imgThumb(first.url) ?? null
})

// ── Content type ──────────────────────────────────────────────────────────────
const CT_MAP: Record<string, { icon: string; badge: string; bg: string }> = {
  EXPERIENCE: {
    icon: 'mdi:star-outline',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    bg: '#1a3a5c',
  },
  INSPIRATION: {
    icon: 'mdi:lightbulb-outline',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    bg: '#3d2800',
  },
  COMMERCE: {
    icon: 'mdi:shopping-outline',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    bg: '#003d22',
  },
  EDUCATIONAL: {
    icon: 'mdi:school-outline',
    badge:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    bg: '#3b1f00',
  },
  ENTERTAINMENT: {
    icon: 'mdi:music-note',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    bg: '#3d0030',
  },
}
const CT_DEFAULT = {
  icon: 'mdi:tag-outline',
  badge: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
  bg: '#222222',
}

const ctDef = computed(() => CT_MAP[props.post.contentType] ?? CT_DEFAULT)
const contentTypeLabel = computed(() =>
  t(`contentType.${props.post.contentType}`, props.post.contentType),
)

// ── Time ──────────────────────────────────────────────────────────────────────
const timeAgo = (date: Date | string) => {
  if (!date) return ''
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return t('time.justNow')
  if (s < 3600) return t('time.minutesAgo', { n: Math.floor(s / 60) })
  if (s < 86400) return t('time.hoursAgo', { n: Math.floor(s / 3600) })
  return t('time.daysAgo', { n: Math.floor(s / 86400) })
}
</script>
