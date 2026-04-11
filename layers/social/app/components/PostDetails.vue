<!-- layers/social/app/components/PostDetails.vue -->
<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <!-- Share Modal Trigger -->
    <ShareModal
      :is-open="showShareModal"
      :url="shareUrl"
      :title="
        post.caption ||
        `Check out this post on ${$config.public.siteName || 'marketX'}`
      "
      @close="showShareModal = false"
    />

    <!-- Tagged Product Detail Modal -->
    <ProductDetailModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
    />

    <!-- Author Header -->
    <div
      class="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3.5 dark:border-neutral-800"
    >
      <NuxtLink :to="`/profile/${post.author?.username}`" class="shrink-0">
        <Avatar
          :username="post.author?.username ?? 'User'"
          :avatar="post.author?.avatar ?? undefined"
          size="md"
          class="ring-2 ring-white/80 dark:ring-neutral-900/80"
        />
      </NuxtLink>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <NuxtLink
            :to="`/profile/${post.author?.username}`"
            class="text-sm font-semibold text-gray-900 transition-opacity hover:opacity-80 dark:text-white"
          >
            {{ post.author?.username }}
          </NuxtLink>

          <!-- Content Type Badge -->
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            :class="badgeClass"
          >
            <Icon :name="badgeIcon" size="10" />
            {{ contentTypeLabel }}
          </span>
        </div>

        <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
          {{ timeAgo(post.created_at) }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <!-- Follow Button (if not own post) -->
        <FollowButton
          v-if="profileStore.userId && profileStore.userId !== post.author?.id"
          :user-id="post.author!.id"
          :username="post.author?.username || ''"
          size="sm"
        />

        <!-- Close — desktop only (mobile uses the floating button in PostDetailModal) -->
        <button
          class="hidden rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:flex dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Close post"
          @click="$emit('close')"
        >
          <Icon name="mdi:close" size="20" />
        </button>
      </div>
    </div>

    <!-- Scrollable Content: Caption + Comments -->
    <div ref="commentsContainer" class="min-h-0 flex-1 overflow-y-auto">
      <div class="space-y-6 p-4">
        <!-- Caption / Content -->
        <div v-if="cleanCaption || post.content" class="flex items-start gap-3">
          <NuxtLink :to="`/profile/${post.author?.username}`" class="shrink-0">
            <Avatar
              :username="post.author?.username ?? 'User'"
              :avatar="post.author?.avatar ?? undefined"
              size="sm"
            />
          </NuxtLink>

          <div class="min-w-0 flex-1">
            <!-- Inspiration: Quote Style -->
            <div
              v-if="post.contentType === 'INSPIRATION'"
              class="rounded-xl border-l-4 border-amber-400 bg-amber-50/70 px-4 py-3 dark:bg-amber-950/20"
            >
              <p
                class="text-sm italic leading-relaxed text-gray-900 dark:text-neutral-100"
              >
                <span class="mr-1.5 font-semibold not-italic">{{
                  post.author?.username
                }}</span>
                {{ cleanCaption || post.content }}
              </p>
            </div>

            <!-- Default Caption -->
            <p
              v-else
              class="text-sm leading-relaxed text-gray-900 dark:text-neutral-100"
            >
              <span class="mr-1.5 font-semibold">{{
                post.author?.username
              }}</span>
              {{ cleanCaption || post.content }}
            </p>

            <!-- Hashtags -->
            <p v-if="hashtags.length" class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="(tag, i) in hashtags"
                :key="i"
                class="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand dark:bg-brand/20"
              >
                {{ tag }}
              </span>
            </p>

            <p class="mt-2 text-xs text-gray-500 dark:text-neutral-400">
              {{ timeAgo(post.created_at) }}
            </p>
          </div>
        </div>

        <!-- Audio Player (if AUDIO media) -->
        <div
          v-if="post.media?.type === 'AUDIO'"
          class="overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800"
        >
          <AudioPlayer :src="post.media.url" />
        </div>

        <!-- Tagged Products (COMMERCE) -->
        <div
          v-if="hasTaggedProducts"
          class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20"
        >
          <div class="mb-3 flex items-center gap-2">
            <Icon
              name="mdi:shopping-outline"
              size="16"
              class="text-emerald-600 dark:text-emerald-400"
            />
            <span
              class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
            >
              {{ $t('post.shopThisPost') }}
            </span>
          </div>

          <TaggedProductsDisplay
            :products="taggedProducts"
            :content-type="post.contentType"
            @select-product="openTaggedProduct"
          />
        </div>

        <!-- Divider -->
        <div
          v-if="comments.length || isLoadingComments"
          class="border-t border-gray-100 dark:border-neutral-800"
        />

        <!-- Loading Comments -->
        <div v-if="isLoadingComments" class="flex justify-center py-6">
          <div
            class="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent"
          />
        </div>

        <!-- Comments List -->
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="group/comment flex items-start gap-3"
        >
          <Avatar
            :username="comment.author?.username ?? 'User'"
            :avatar="comment.author?.avatar ?? undefined"
            size="sm"
          />

          <div class="min-w-0 flex-1">
            <p
              class="text-sm leading-relaxed text-gray-900 dark:text-neutral-100"
            >
              <NuxtLink
                :to="`/profile/${comment.author?.username}`"
                class="mr-1.5 font-semibold transition-opacity hover:opacity-80"
              >
                {{ comment.author?.username }}
              </NuxtLink>
              {{ comment.text }}
            </p>

            <div class="mt-1 flex items-center gap-3 text-xs">
              <span class="text-gray-500 dark:text-neutral-400">
                {{ timeAgo(comment.createdAt || comment.created_at) }}
              </span>
              <button
                class="font-medium text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                @click="startReply(comment)"
              >
                {{ $t('post.reply') }}
              </button>
            </div>
            <!-- Inline replies -->
            <div
              v-if="comment._replies?.length"
              class="mt-2 space-y-2 border-l-2 border-gray-100 pl-3 dark:border-neutral-800"
            >
              <div
                v-for="reply in comment._replies"
                :key="reply.id"
                class="flex items-start gap-2"
              >
                <Avatar
                  :username="reply.author?.username ?? 'User'"
                  :avatar="reply.author?.avatar ?? undefined"
                  size="xs"
                />
                <p
                  class="text-xs leading-relaxed text-gray-800 dark:text-neutral-200"
                >
                  <span class="mr-1 font-semibold">{{
                    reply.author?.username
                  }}</span>
                  {{ reply.text }}
                </p>
              </div>
            </div>
          </div>

          <!-- Comment Like -->
          <button
            class="flex shrink-0 flex-col items-center gap-0.5 pt-1 transition-opacity"
            @click="handleCommentLike(comment)"
          >
            <Icon
              :name="comment._liked ? 'mdi:heart' : 'mdi:heart-outline'"
              size="16"
              :class="
                comment._liked
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-neutral-400'
              "
            />
            <span
              v-if="(comment._likeCount ?? 0) > 0"
              class="text-[10px] text-gray-500"
            >
              {{ comment._likeCount }}
            </span>
          </button>
        </div>

        <!-- No Comments / Empty State -->
        <div
          v-if="
            !isLoadingComments &&
            !comments.length &&
            !cleanCaption &&
            !post.content
          "
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <Icon
            name="mdi:comment-outline"
            size="40"
            class="mb-3 text-gray-300 dark:text-neutral-600"
          />
          <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">
            {{ $t('post.noComments') }}
          </p>
          <p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">
            {{ $t('post.beFirstComment') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar + Comment Input -->
    <div class="shrink-0 border-t border-gray-100 dark:border-neutral-800">
      <!-- Actions: Like / Comment / Share / Bookmark -->
      <div class="flex items-center justify-between px-3 py-2.5">
        <div class="flex items-center gap-0.5">
          <!-- Like -->
          <button
            class="group flex items-center gap-1 rounded-full px-2.5 py-2 transition-colors hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-neutral-800"
            :aria-label="isLiked ? 'Unlike' : 'Like'"
            @click="handleLike"
          >
            <Icon
              :name="isLiked ? 'mdi:heart' : 'mdi:heart-outline'"
              size="22"
              class="transition-transform group-active:scale-90"
              :class="
                isLiked ? 'text-red-500' : 'text-gray-900 dark:text-neutral-100'
              "
            />
            <span
              class="text-sm font-medium text-gray-700 dark:text-neutral-300"
            >
              {{ likeCount.toLocaleString() }}
            </span>
          </button>

          <!-- Comment -->
          <button
            class="group flex items-center gap-1 rounded-full px-2.5 py-2 transition-colors hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-neutral-800"
            @click="focusCommentInput"
          >
            <Icon
              name="mdi:comment-outline"
              size="20"
              class="text-gray-900 dark:text-neutral-100"
            />
            <span
              class="text-sm font-medium text-gray-700 dark:text-neutral-300"
            >
              {{ post.commentCount }}
            </span>
          </button>

          <!-- Share -->
          <button
            class="group rounded-full px-2.5 py-2 transition-colors hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-neutral-800"
            @click="sharePost"
          >
            <Icon
              name="mdi:send-outline"
              size="20"
              class="-rotate-12 text-gray-900 transition-transform group-active:scale-90 dark:text-neutral-100"
            />
          </button>
        </div>

        <!-- Bookmark -->
        <button
          class="group rounded-full px-2.5 py-2 transition-colors hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-neutral-800"
          @click="handleSave"
        >
          <Icon
            :name="isSaved ? 'mdi:bookmark' : 'mdi:bookmark-outline'"
            size="22"
            class="transition-transform group-active:scale-90"
            :class="
              isSaved ? 'text-brand' : 'text-gray-900 dark:text-neutral-100'
            "
          />
        </button>
      </div>

      <!-- Like Count + Date -->
      <div class="px-5 pb-2 text-sm">
        <button
          v-if="likeCount > 0"
          class="font-semibold text-gray-900 transition-opacity hover:opacity-70 dark:text-white"
          @click="showLikes = true"
        >
          {{ likeCount.toLocaleString() }}
          {{ likeCount === 1 ? $t('post.like') : $t('post.likes') }}
        </button>
        <p
          class="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-500"
        >
          {{ formatDate(post.created_at) }}
        </p>
      </div>

      <LikesModal
        :is-open="showLikes"
        type="post"
        :target-id="post.id"
        @close="showLikes = false"
      />

      <!-- Reply context banner -->
      <div
        v-if="replyingTo"
        class="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-800/50"
      >
        <span class="text-xs text-gray-500 dark:text-neutral-400">
          Replying to
          <span class="font-semibold text-brand"
            >@{{ replyingTo.username }}</span
          >
        </span>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
          @click="replyingTo = null"
        >
          <Icon name="mdi:close" size="14" />
        </button>
      </div>

      <!-- Comment Input -->
      <form
        class="flex items-start gap-3 border-t border-gray-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
        style="
          padding-bottom: max(
            0.75rem,
            calc(env(safe-area-inset-bottom, 0px) + 0.5rem)
          );
        "
        @submit.prevent="addComment"
      >
        <Avatar
          :username="profileStore.me?.username ?? 'User'"
          :avatar="profileStore.me?.avatar ?? undefined"
          size="sm"
          class="mt-0.5 shrink-0"
        />

        <div class="min-w-0 flex-1">
          <TextEditor
            ref="commentInputRef"
            v-model="commentText"
            :placeholder="$t('post.addComment')"
            :max-length="500"
            :submit-on-enter="true"
            @submit="addComment"
          />
        </div>

        <!-- Post Comment -->
        <button
          type="submit"
          :disabled="!commentText.trim() || isPostingComment"
          class="mt-1 shrink-0 text-sm font-semibold text-brand transition-opacity disabled:opacity-50"
        >
          {{ isPostingComment ? '…' : $t('post.post') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePost } from '../composables/usePost'
import { useComment } from '../composables/useComment'
import { usePostStore } from '../store/post.store'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import FollowButton from '~~/layers/profile/app/components/FollowButton.vue'
import TaggedProductsDisplay from './TaggedProductsDisplay.vue'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'
import AudioPlayer from './AudioPlayer.vue'
import TextEditor from './TextEditor.vue'
import ProductDetailModal from '~~/layers/commerce/app/components/modals/ProductDetailModal.vue'
import ShareModal from '~~/layers/social/app/components/modals/ShareModal.vue'
import LikesModal from '~~/layers/social/app/components/modals/LikesModal.vue'
import { notify } from '@kyvg/vue3-notification'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import { useProductApi } from '~~/layers/commerce/app/services/product.api'
import { BRAND } from '~~/layers/core/app/utils/brand'

const { t } = useI18n()

const props = defineProps<{ post: IFeedItem }>()
const emit = defineEmits(['close'])

const { likePost, unlikePost, savePost, unsavePost } = usePost()
const { fetchPostComments, createComment, likeComment, unlikeComment } =
  useComment()
const postStore = usePostStore()
const profileStore = useProfileStore()

const comments = ref<any[]>([])
const commentText = ref('')
const replyingTo = ref<{ id: string; username: string } | null>(null)
const isSaved = ref(postStore.savedPostIds.includes(props.post.id))
const isLoadingComments = ref(false)
const isPostingComment = ref(false)
const likeCount = ref(props.post.likeCount ?? 0)
const showLikes = ref(false)
const commentsContainer = ref<HTMLElement | null>(null)
const commentInputRef = ref<InstanceType<typeof TextEditor> | null>(null)
const showShareModal = ref(false)

const shareUrl = computed(
  () => `${window.location.origin}/post/${props.post.id}`,
)

const isLiked = computed(() => postStore.isPostLiked(props.post.id))

// Content Type Mapping (consistent with PostCard / modal)
const CONTENT_TYPE_MAP: Record<
  string,
  { label: string; icon: string; accent: string; badge: string }
> = {
  EXPERIENCE: {
    label: 'Experience',
    icon: 'mdi:star-outline',
    accent: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  INSPIRATION: {
    label: 'Inspire',
    icon: 'mdi:lightbulb-outline',
    accent: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  COMMERCE: {
    label: 'Shop',
    icon: 'mdi:shopping-outline',
    accent: 'bg-emerald-500',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  EDUCATIONAL: {
    label: 'Learn',
    icon: 'mdi:school-outline',
    accent: 'bg-orange-500',
    badge:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  },
  ENTERTAINMENT: {
    label: 'Fun',
    icon: 'mdi:music-note',
    accent: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  },
}

const contentTypeDef = computed(
  () =>
    CONTENT_TYPE_MAP[props.post.contentType] ?? {
      label: props.post.contentType || 'Post',
      icon: 'mdi:tag-outline',
      accent: 'bg-gray-400',
      badge:
        'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
    },
)

const contentTypeLabel = computed(() => contentTypeDef.value.label)
const badgeIcon = computed(() => contentTypeDef.value.icon)
const badgeClass = computed(() => contentTypeDef.value.badge)

// Caption Cleaning & Hashtags
const cleanCaption = computed(() => {
  if (!props.post.caption) return ''
  let stripped = props.post.caption.replace(/#\w+/g, '').trim()
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div')
    tmp.innerHTML = stripped
    stripped = (tmp.textContent || tmp.innerText || '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return stripped
})

const hashtags = computed(() => props.post.caption?.match(/#\w+/g) || [])

// Tagged Products
const taggedProducts = computed(() =>
  (props.post.taggedProducts || []).map((t: any) => ({
    id: t.productId ?? t.id,
    title: t.product?.title ?? t.title,
    price: t.product?.price ?? t.price,
    slug: t.product?.slug ?? t.slug,
    image: t.product?.media?.[0]?.url ?? t.image ?? null,
  })),
)

const hasTaggedProducts = computed(() => taggedProducts.value.length > 0)

// Open Tagged Product
const selectedProduct = ref<any>(null)
const productApi = useProductApi()

const openTaggedProduct = async (id: number) => {
  try {
    const res = await productApi.getProductById(id)
    selectedProduct.value = res?.data ?? res
  } catch {}
}

// Load Comments
onMounted(async () => {
  isLoadingComments.value = true
  try {
    const result = await fetchPostComments(props.post.id)
    comments.value = [...(result?.data || [])]
  } catch {
  } finally {
    isLoadingComments.value = false
  }
})

// Like / Unlike
const handleLike = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: t('auth.loginToLike') })
    return
  }
  try {
    if (isLiked.value) {
      await unlikePost(props.post.id)
      likeCount.value = Math.max(0, likeCount.value - 1)
    } else {
      await likePost(props.post.id)
      likeCount.value += 1
    }
  } catch {
    notify({ type: 'error', text: t('errors.failedLike') })
  }
}

// Save / Unsave
const handleSave = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: t('auth.loginToSave') })
    return
  }
  try {
    if (isSaved.value) {
      await unsavePost(props.post.id)
      isSaved.value = false
    } else {
      await savePost(props.post.id)
      isSaved.value = true
    }
  } catch {
    notify({ type: 'error', text: t('errors.failedSave') })
  }
}

const startReply = (comment: any) => {
  replyingTo.value = {
    id: comment.id,
    username: comment.author?.username ?? 'user',
  }
  commentInputRef.value?.focus()
}

// Add Comment
const addComment = async () => {
  const text = commentText.value.trim()
  if (!text || isPostingComment.value) return
  if (!profileStore.userId) {
    notify({ type: 'warn', text: t('auth.loginToComment') })
    return
  }

  isPostingComment.value = true
  const parentId = replyingTo.value?.id ?? null
  try {
    const newComment = await createComment(props.post.id, { text, parentId })
    if (parentId) {
      // Attach reply under the parent comment
      const parent = comments.value.find((c) => c.id === parentId)
      if (parent) {
        if (!parent._replies) parent._replies = []
        parent._replies.push(newComment)
      }
    } else {
      comments.value.push(newComment)
    }
    commentText.value = ''
    replyingTo.value = null
    await nextTick()
    commentsContainer.value?.scrollTo({
      top: commentsContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  } catch {
    notify({ type: 'error', text: t('errors.failedComment') })
  } finally {
    isPostingComment.value = false
  }
}

const focusCommentInput = () => {
  commentInputRef.value?.focus()
}

// Comment Like
const handleCommentLike = async (comment: any) => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: t('auth.loginToLike') })
    return
  }
  const wasLiked = comment._liked
  comment._liked = !wasLiked
  comment._likeCount = (comment._likeCount ?? 0) + (wasLiked ? -1 : 1)

  try {
    if (wasLiked) await unlikeComment(props.post.id, comment.id)
    else await likeComment(props.post.id, comment.id)
  } catch {
    comment._liked = wasLiked
    comment._likeCount = (comment._likeCount ?? 0) + (wasLiked ? 1 : -1)
  }
}

// Share
const sharePost = () => {
  if (navigator.share) {
    navigator
      .share({
        url: shareUrl.value,
        title: props.post.caption || `Check out this post on ${BRAND.name}`,
      })
      .catch(() => {
        showShareModal.value = true
      })
  } else {
    showShareModal.value = true
  }
}

// Time Formatting
const timeAgo = (date: Date | string) => {
  if (!date) return ''
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const formatDate = (date: Date | string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
/* Optional: subtle scroll shadow when scrolled */
.comments-scroll-shadow {
  box-shadow: inset 0 10px 10px -10px rgba(0, 0, 0, 0.1);
}
</style>
