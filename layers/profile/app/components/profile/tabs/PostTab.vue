<template>
  <div class="p-4">
    <!-- Skeleton -->
    <div
      v-if="isLoading && posts.length === 0"
      class="grid grid-cols-3 gap-0.5"
    >
      <div
        v-for="i in 9"
        :key="i"
        class="aspect-square animate-pulse rounded-sm bg-gray-100 dark:bg-neutral-800"
      />
    </div>

    <!-- Empty -->
    <div
      v-else-if="posts.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-16"
    >
      <Icon
        name="mdi:camera-off-outline"
        size="56"
        class="text-gray-300 dark:text-neutral-700"
      />
      <p class="text-[14px] text-gray-500 dark:text-neutral-400">
        {{
          isOwnProfile
            ? 'No posts yet — share your first moment!'
            : 'No posts yet'
        }}
      </p>
    </div>

    <!-- Grid -->
    <div v-else>
      <div class="grid grid-cols-3 gap-0.5">
        <button
          v-for="post in posts"
          :key="post.id"
          @click="openPost(post)"
          class="group relative aspect-square overflow-hidden rounded-sm bg-gray-100 dark:bg-neutral-800"
        >
          <!-- Thumbnail -->
          <img
            v-if="firstMedia(post)?.type === 'IMAGE'"
            :src="firstMedia(post)!.url"
            :alt="post.caption || 'Post'"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <img
            v-else-if="firstMedia(post)?.type === 'VIDEO'"
            :src="videoThumb(firstMedia(post)!.url)"
            :alt="post.caption || 'Post'"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <!-- Text-only tile -->
          <div
            v-else
            class="flex h-full w-full items-center justify-center p-3"
            :class="contentTypeGradient(post.contentType)"
          >
            <p
              class="line-clamp-4 text-center text-[11px] font-medium leading-relaxed text-white"
            >
              {{ post.caption || post.content || '…' }}
            </p>
          </div>

          <!-- Hover overlay -->
          <div
            class="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <div class="flex items-center gap-1 text-white drop-shadow">
              <Icon name="mdi:heart" size="20" />
              <span class="text-[13px] font-semibold">{{
                formatNum(post._count?.likes || 0)
              }}</span>
            </div>
            <div class="flex items-center gap-1 text-white drop-shadow">
              <Icon name="mdi:comment" size="20" />
              <span class="text-[13px] font-semibold">{{
                formatNum(post._count?.comments || 0)
              }}</span>
            </div>
          </div>

          <!-- Edit button (own profile only) — always visible on mobile, hover-only on desktop -->
          <button
            v-if="isOwnProfile"
            type="button"
            @click.stop="openEdit(post)"
            class="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100"
            title="Edit post"
          >
            <Icon name="mdi:pencil" size="12" />
          </button>

          <!-- Indicators -->
          <div
            class="pointer-events-none absolute right-1.5 top-1.5 flex flex-col items-end gap-1"
          >
            <Icon
              v-if="firstMedia(post)?.type === 'VIDEO'"
              name="mdi:play-circle"
              size="18"
              class="text-white drop-shadow-lg"
            />
            <Icon
              v-if="post.visibility === 'PRIVATE'"
              name="mdi:lock"
              size="15"
              class="text-white drop-shadow-lg"
            />
          </div>
        </button>
      </div>

      <!-- Load more -->
      <div v-if="hasMore" class="mt-4 flex justify-center">
        <button
          @click="loadMore"
          :disabled="isLoading"
          class="rounded-lg px-6 py-2 text-[13px] font-semibold text-brand transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-neutral-800"
        >
          {{ isLoading ? 'Loading…' : 'Load more' }}
        </button>
      </div>
    </div>

    <!-- Post detail modal -->
    <PostDetailModal
      v-if="selectedPost"
      :post="selectedPost"
      @close="selectedPost = null"
    />

    <!-- Edit post modal -->
    <PostEditModal
      v-if="editingPost"
      :post="editingPost"
      @close="editingPost = null"
      @updated="onPostUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePostStore } from '~~/layers/social/app/store/post.store'
import { usePost } from '~~/layers/social/app/composables/usePost'
import PostDetailModal from '~~/layers/social/app/components/modals/PostDetailModal.vue'
import PostEditModal from '~~/layers/social/app/components/modals/PostEditModal.vue'
import { videoThumb } from '~~/layers/core/app/utils/cloudinary'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const props = defineProps<{
  username: string
  isOwnProfile: boolean
}>()

const postStore = usePostStore()
const { fetchUserPosts, isLoading, normalizePost } = usePost()

const selectedPost = ref<IFeedItem | null>(null)
const editingPost = ref<IFeedItem | null>(null)
const hasMore = ref(false)
const offset = ref(0)
const LIMIT = 9

const posts = computed(() => postStore.getPostsByUsername(props.username))

onMounted(async () => {
  if (posts.value.length === 0) await loadPosts()
})

async function loadPosts() {
  try {
    const result = await fetchUserPosts(props.username, LIMIT, offset.value)
    hasMore.value = result?.meta?.hasMore ?? false
  } catch {
    // error is stored in postStore.error; template will show empty state
  }
}

const loadMore = async () => {
  offset.value += LIMIT
  await loadPosts()
}

// Handle IFeedItem (mediaItems[]), IPost (media array), or single media object
const firstMedia = (post: any) => {
  if (post.mediaItems?.length) return post.mediaItems[0]
  if (Array.isArray(post.media)) return post.media[0] ?? null
  return post.media ?? null
}

// Convert IPost → IFeedItem shape before opening PostDetailModal
const openPost = (post: any) => {
  selectedPost.value = normalizePost(post)
}

const openEdit = (post: any) => {
  editingPost.value = normalizePost(post)
}

const onPostUpdated = () => {
  editingPost.value = null
  // Store is already updated by usePost.updatePost — grid re-renders reactively
}

const formatNum = (n: number) =>
  n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : n.toString()

const contentTypeGradient = (type?: string) => {
  const map: Record<string, string> = {
    EXPERIENCE: 'bg-gradient-to-br from-blue-500 to-blue-700',
    INSPIRATION: 'bg-gradient-to-br from-amber-400 to-amber-600',
    COMMERCE: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
    EDUCATIONAL: 'bg-gradient-to-br from-orange-500 to-orange-700',
    ENTERTAINMENT: 'bg-gradient-to-br from-pink-500 to-pink-700',
  }
  return map[type ?? ''] ?? 'bg-gradient-to-br from-gray-400 to-gray-600'
}
</script>
