<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-3 gap-1">
      <div
        v-for="i in 9"
        :key="i"
        class="aspect-square animate-pulse rounded bg-gray-200 dark:bg-neutral-800"
      ></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="taggedPosts.length === 0" class="py-20 text-center">
      <Icon
        name="mdi:account-tag-outline"
        size="64"
        class="mx-auto mb-4 text-gray-300 dark:text-neutral-700"
      />
      <p class="text-gray-500 dark:text-neutral-400">No tagged posts yet</p>
    </div>

    <!-- Tagged Posts Grid -->
    <div v-else>
      <div class="grid grid-cols-3 gap-1">
        <button
          v-for="post in taggedPosts"
          :key="post.id"
          @click="openPost(post)"
          class="group relative aspect-square overflow-hidden rounded"
        >
          <!-- Post Image/Video -->
          <img
            v-if="post.media?.[0]?.type === 'image'"
            :src="post.media[0].url"
            :alt="post.caption"
            class="h-full w-full object-cover"
          />
          <video
            v-else-if="post.media?.[0]?.type === 'video'"
            :src="post.media[0].url"
            class="h-full w-full object-cover"
            muted
          ></video>

          <!-- Overlay on Hover -->
          <div
            class="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <div class="flex items-center gap-1 text-white">
              <Icon name="mdi:heart" size="24" />
              <span class="font-semibold">{{
                formatNumber(post._count?.likes || 0)
              }}</span>
            </div>
            <div class="flex items-center gap-1 text-white">
              <Icon name="mdi:comment" size="24" />
              <span class="font-semibold">{{
                formatNumber(post._count?.comments || 0)
              }}</span>
            </div>
          </div>

          <!-- Tagged Badge -->
          <div
            class="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm"
          >
            <Icon name="mdi:account-tag" size="16" class="text-white" />
          </div>
        </button>
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="mt-6 text-center">
        <button
          @click="loadMore"
          :disabled="isLoadingMore"
          class="rounded-lg px-6 py-2 font-semibold text-brand transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-neutral-800"
        >
          {{ isLoadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <PostDetailModal
      v-if="selectedPost"
      :post="selectedPost"
      @close="selectedPost = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePostApi } from '~~/layers/social/app/services/post.api'
import PostDetailModal from '~~/layers/social/app/components/modals/PostDetailModal.vue'
import type { IPost } from '~~/layers/social/app/types/post.types'

const postApi = usePostApi()

const props = defineProps<{
  username: string
}>()

const taggedPosts = ref<IPost[]>([])
const selectedPost = ref<IPost | null>(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(false)
const page = ref(1)

onMounted(() => {
  fetchTaggedPosts()
})

const fetchTaggedPosts = async () => {
  isLoading.value = true
  try {
    const response = await postApi.getTaggedPosts(props.username, 9, 1)
    taggedPosts.value = response.items
    hasMore.value = response.meta?.hasMore ?? false
  } catch (error) {
    console.error('Failed to fetch tagged posts:', error)
  } finally {
    isLoading.value = false
  }
}

const loadMore = async () => {
  isLoadingMore.value = true
  try {
    page.value++
    const response = await postApi.getTaggedPosts(props.username, 9, page.value)
    taggedPosts.value.push(...response.items)
    hasMore.value = response.meta?.hasMore ?? false
  } catch (error) {
    console.error('Failed to load more posts:', error)
  } finally {
    isLoadingMore.value = false
  }
}

const openPost = (post: IPost) => {
  selectedPost.value = post
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
</script>
