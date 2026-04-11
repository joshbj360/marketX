<template>
  <div>
    <!-- Empty State -->
    <div v-if="!posts || posts.length === 0" class="py-12 text-center">
      <Icon
        name="mdi:image-outline"
        size="48"
        class="mx-auto mb-3 text-gray-300 dark:text-neutral-700"
      />
      <p class="text-gray-500 dark:text-neutral-400">{{ emptyMessage }}</p>
    </div>

    <!-- Posts Grid -->
    <div v-else class="grid grid-cols-3 gap-1">
      <div
        v-for="post in posts"
        :key="post.id"
        @click="$emit('open-post', post)"
        class="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100 dark:bg-neutral-800"
      >
        <!-- Post Image/Video -->
        <img
          v-if="post.content"
          :src="post.content"
          :alt="post.caption || 'Post'"
          class="h-full w-full object-cover"
        />

        <!-- Overlay on Hover -->
        <div
          class="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div class="flex items-center gap-1 text-white">
            <Icon name="mdi:heart" size="20" />
            <span class="font-semibold">{{ post._count?.likes || 0 }}</span>
          </div>
          <div class="flex items-center gap-1 text-white">
            <Icon name="mdi:chat" size="20" />
            <span class="font-semibold">{{ post._count?.comments || 0 }}</span>
          </div>
        </div>

        <!-- Video Indicator -->
        <div
          v-if="post.contentType?.includes('video')"
          class="absolute right-2 top-2"
        >
          <Icon
            name="mdi:play-circle"
            size="20"
            class="text-white drop-shadow-lg"
          />
        </div>

        <!-- Multi-image Indicator -->
        <div v-if="hasMultipleImages(post)" class="absolute right-2 top-2">
          <Icon
            name="mdi:content-copy"
            size="20"
            class="text-white drop-shadow-lg"
          />
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" ref="loadMoreTrigger" class="h-10"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { IPost } from '~/layers/profile/app/types/profile.types'

const props = defineProps<{
  posts: IPost[]
  hasMore?: boolean
  emptyMessage?: string
}>()

const emit = defineEmits(['open-post', 'load-more'])

const loadMoreTrigger = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

const hasMultipleImages = (post: IPost) => {
  // Check if post has multiple images (update based on your data structure)
  return false
}

onMounted(() => {
  if (props.hasMore) {
    observer.value = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          emit('load-more')
        }
      },
      { rootMargin: '200px' },
    )
    if (loadMoreTrigger.value) {
      observer.value.observe(loadMoreTrigger.value)
    }
  }
})

onUnmounted(() => {
  if (observer.value) observer.value.disconnect()
})
</script>
