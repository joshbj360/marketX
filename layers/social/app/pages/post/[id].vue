<template>
  <HomeLayout>
    <div class="mx-auto max-w-5xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-20 text-center">
        <Icon name="eos-icons:loading" size="32" class="text-brand" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-20 text-center">
        <p class="text-brand-dark dark:text-brand-light">Post not found</p>
      </div>

      <!-- Post Content -->
      <div
        v-else-if="post"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div class="md:flex">
          <!-- Left: Media -->
          <div class="flex items-center justify-center bg-black md:w-3/5">
            <div class="aspect-square w-full">
              <video
                v-if="post.content && post.contentType?.includes('video')"
                :src="post.content"
                class="h-full w-full object-contain"
                controls
              ></video>
              <img
                v-else-if="post.content"
                :src="post.content"
                :alt="post.caption"
                class="h-full w-full object-contain"
              />
            </div>
          </div>

          <!-- Right: Details & Comments -->
          <div class="flex max-h-[80vh] flex-col md:w-2/5">
            <!-- Post Header -->
            <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
              <div class="flex items-center gap-3">
                <NuxtLink :to="`/profile/${post.author?.username}`">
                  <img
                    :src="
                      post.author?.avatar ||
                      formatAvatarUrl(post.author?.username)
                    "
                    class="h-10 w-10 rounded-full object-cover"
                  />
                </NuxtLink>
                <div class="flex-1">
                  <NuxtLink
                    :to="`/profile/${post.author?.username}`"
                    class="font-semibold text-gray-900 hover:underline dark:text-neutral-100"
                  >
                    {{ post.author?.username }}
                  </NuxtLink>
                </div>
                <FollowButton
                  v-if="profileStore.userId !== post.authorId"
                  :user-id="post.authorId"
                  :username="post.author?.username || ''"
                />
              </div>
            </div>

            <!-- Comments Section -->
            <div class="flex-1 space-y-4 overflow-y-auto p-4">
              <!-- Caption as first comment -->
              <div v-if="post.caption" class="flex items-start gap-3">
                <img
                  :src="
                    post.author?.avatar ||
                    formatAvatarUrl(post.author?.username)
                  "
                  class="h-8 w-8 rounded-full object-cover"
                />
                <div class="flex-1">
                  <p class="text-sm">
                    <NuxtLink
                      :to="`/profile/${post.author?.username}`"
                      class="mr-1 font-semibold"
                    >
                      {{ post.author?.username }}
                    </NuxtLink>
                    <span class="text-gray-800 dark:text-neutral-200">{{
                      post.caption
                    }}</span>
                  </p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {{ timeAgo(post.createdAt) }}
                  </p>
                </div>
              </div>

              <!-- Comments List -->
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="flex items-start gap-3"
              >
                <img
                  :src="
                    comment.author?.avatar ||
                    formatAvatarUrl(comment.author?.username)
                  "
                  class="h-8 w-8 rounded-full object-cover"
                />
                <div class="flex-1">
                  <p class="text-sm">
                    <NuxtLink
                      :to="`/profile/${comment.author?.username}`"
                      class="mr-1 font-semibold"
                    >
                      {{ comment.author?.username }}
                    </NuxtLink>
                    <span class="text-gray-800 dark:text-neutral-200">{{
                      comment.text
                    }}</span>
                  </p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {{ timeAgo(comment.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Actions & Add Comment -->
            <div class="border-t border-gray-200 dark:border-neutral-800">
              <!-- Actions -->
              <div class="flex items-center justify-between p-4">
                <div class="flex items-center gap-4">
                  <button @click="handleLike" class="group">
                    <Icon
                      :name="isLiked ? 'mdi:heart' : 'mdi:heart-outline'"
                      size="26"
                      :class="
                        isLiked
                          ? 'text-brand'
                          : 'text-gray-900 dark:text-neutral-100'
                      "
                    />
                  </button>
                  <button>
                    <Icon
                      name="mdi:chat-outline"
                      size="26"
                      class="text-gray-900 dark:text-neutral-100"
                    />
                  </button>
                  <button @click="sharePost">
                    <Icon
                      name="mdi:share-variant-outline"
                      size="26"
                      class="text-gray-900 dark:text-neutral-100"
                    />
                  </button>
                </div>
                <button @click="handleSave">
                  <Icon
                    :name="isSaved ? 'mdi:bookmark' : 'mdi:bookmark-outline'"
                    size="26"
                    :class="
                      isSaved
                        ? 'text-brand'
                        : 'text-gray-900 dark:text-neutral-100'
                    "
                  />
                </button>
              </div>

              <!-- Likes Count -->
              <div class="px-4 pb-2">
                <p
                  class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ likeCount }} {{ likeCount === 1 ? 'like' : 'likes' }}
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                  {{ formatDate(post.createdAt) }}
                </p>
              </div>

              <!-- Add Comment -->
              <form
                @submit.prevent="addComment"
                class="border-t border-gray-200 p-4 dark:border-neutral-800"
              >
                <div class="flex items-center gap-2">
                  <input
                    v-model="commentText"
                    type="text"
                    placeholder="Add a comment..."
                    class="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
                  />
                  <button
                    type="submit"
                    :disabled="!commentText.trim()"
                    class="text-sm font-semibold text-brand disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePost } from '../../composables/usePost'
import { useComment } from '../../composables/useComment'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { usePostStore } from '../../store/post.store'
import { formatAvatarUrl } from '~~/shared/utils/formatters'
import { notify } from '@kyvg/vue3-notification'

const route = useRoute()
const profileStore = useProfileStore()
const postStore = usePostStore()
const {
  isLoading,
  error,
  getPostById,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
} = usePost()
const { createComment, fetchPostComments } = useComment()

const postId = computed(() => route.params.id as string)
const post = ref<any>(null)
const comments = ref<any[]>([])
const commentText = ref('')
const isSaved = ref(false)
const likeCount = ref(0)

const isLiked = computed(() => postStore.isPostLiked(postId.value))

onMounted(async () => {
  const id = postId.value
  if (!id) return
  try {
    const fetchedPost = await getPostById(id)
    post.value = fetchedPost
    likeCount.value = fetchedPost?._count?.likes || 0
    const result = await fetchPostComments(id)
    comments.value = result?.data || []
  } catch {
    // error state handled by store
  }
})

const handleLike = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: 'Please log in to like posts' })
    return
  }
  try {
    if (isLiked.value) {
      await unlikePost(postId.value)
      likeCount.value = Math.max(0, likeCount.value - 1)
    } else {
      await likePost(postId.value)
      likeCount.value += 1
    }
  } catch {
    notify({ type: 'error', text: 'Failed to update like' })
  }
}

const handleSave = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: 'Please log in to save posts' })
    return
  }
  try {
    if (isSaved.value) {
      await unsavePost(postId.value)
      isSaved.value = false
    } else {
      await savePost(postId.value)
      isSaved.value = true
    }
  } catch {
    notify({ type: 'error', text: 'Failed to update saved post' })
  }
}

const addComment = async () => {
  if (!commentText.value.trim()) return
  try {
    const newComment = await createComment(postId.value, {
      text: commentText.value,
    })
    comments.value.push(newComment)
    commentText.value = ''
  } catch {
    notify({ type: 'error', text: 'Failed to post comment' })
  }
}

const sharePost = async () => {
  const shareUrl = `${window.location.origin}/post/${postId.value}`
  try {
    if (navigator.share) {
      await navigator.share({ url: shareUrl })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      notify({ type: 'success', text: 'Link copied!' })
    }
  } catch {}
}

const timeAgo = (date: string) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  )
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return `${Math.floor(seconds / 604800)}w`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>
