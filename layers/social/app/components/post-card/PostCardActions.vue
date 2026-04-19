<template>
  <div class="px-3 pt-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <!-- Like -->
        <button
          @click.stop="emit('like')"
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
          @click.stop="emit('comment')"
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
          @click.stop="emit('share')"
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
        @click.stop="emit('bookmark')"
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

    <!-- Like count + View count -->
    <div class="flex items-center justify-between px-1">
      <button
        v-if="localLikeCount > 0"
        class="text-left text-[13px] font-semibold leading-snug text-gray-900 transition-opacity hover:opacity-70 dark:text-neutral-100"
        @click.stop="emit('open-likes')"
      >
        {{ localLikeCount.toLocaleString() }}
        {{ localLikeCount === 1 ? $t('post.like') : $t('post.likes') }}
      </button>
      <span v-else />
      <span
        v-if="post.viewCount"
        class="flex items-center gap-1 text-[11px] text-gray-400 dark:text-neutral-500"
      >
        <Icon name="mdi:eye-outline" size="14" />
        {{ post.viewCount.toLocaleString() }}
      </span>
    </div>

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
          @click.stop="emit('open-details')"
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
      @click.stop="emit('comment')"
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
        @select-product="(id: string) => emit('open-product', id)"
      />
    </div>

    <!-- Timestamp -->
    <p
      class="mt-1 px-1 pb-2.5 text-[11px] uppercase tracking-wide text-gray-400 dark:text-neutral-600"
    >
      {{ timeAgo(post?.created_at) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LikesModal from '../modals/LikesModal.vue'
import TaggedProductsDisplay from '../TaggedProductsDisplay.vue'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const props = defineProps<{
  post: IFeedItem
  localIsLiked: boolean
  localLikeCount: number
  isBookmarked: boolean
  hasMedia: boolean
}>()

const emit = defineEmits<{
  (e: 'like'): void
  (e: 'bookmark'): void
  (e: 'comment'): void
  (e: 'share'): void
  (e: 'open-likes'): void
  (e: 'open-details'): void
  (e: 'open-product', id: string): void
}>()

const { t } = useI18n()

const showLikes = ref(false)
const textExpanded = ref(false)

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

const hasTaggedProducts = computed(() => isSeller.value && taggedProducts.value.length > 0)

// ─── Timestamp ────────────────────────────────────────────────────────────────
const timeAgo = (date: Date | string) => {
  if (!date) return ''
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return t('time.justNow')
  if (s < 3600) return t('time.minutesAgo', { n: Math.floor(s / 60) })
  if (s < 86400) return t('time.hoursAgo', { n: Math.floor(s / 3600) })
  return t('time.daysAgo', { n: Math.floor(s / 86400) })
}
</script>
