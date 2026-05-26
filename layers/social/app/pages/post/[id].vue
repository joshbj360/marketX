<template>
  <HomeLayout :narrow-feed="false">
    <template #right-sidebar>
      <PostDetailRightSideNav :post="post" />
    </template>

    <div class="mx-auto w-full max-w-5xl">
      <div class="mb-3 flex items-center">
        <button
          class="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
          @click="router.back()"
        >
          <Icon name="mdi:arrow-left" size="18" />
          Back
        </button>
      </div>

      <div v-if="isLoading" class="py-20 text-center">
        <Icon name="eos-icons:loading" size="32" class="text-brand" />
      </div>

      <div v-else-if="error || !post" class="py-20 text-center">
        <p class="text-brand-dark dark:text-brand-light">Post not found</p>
      </div>

      <article
        v-else
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div
          class="flex min-h-[min(760px,calc(100dvh-7rem))] flex-col md:flex-row"
        >
          <section
            v-if="hasMedia"
            class="relative flex min-h-[360px] items-center justify-center bg-black md:min-h-0 md:w-[58%]"
          >
            <video
              v-if="currentMedia?.type === 'VIDEO'"
              :key="currentMedia.url"
              :src="currentMedia.url"
              :poster="currentMedia.thumbnailUrl"
              class="h-full max-h-[72vh] w-full object-contain md:max-h-none"
              controls
              playsinline
            />
            <img
              v-else-if="currentMedia?.type === 'IMAGE'"
              :key="currentMedia.url"
              :src="currentMedia.url"
              :alt="post.caption || 'Post'"
              class="h-full max-h-[72vh] w-full object-contain md:max-h-none"
            />
            <AudioPlayer
              v-else-if="currentMedia?.type === 'AUDIO'"
              :src="currentMedia.url"
              class="w-full max-w-sm"
            />

            <template v-if="mediaItems.length > 1">
              <button
                class="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75 disabled:opacity-30"
                :disabled="currentIndex === 0"
                aria-label="Previous media"
                @click="currentIndex--"
              >
                <Icon name="mdi:chevron-left" size="24" />
              </button>
              <button
                class="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75 disabled:opacity-30"
                :disabled="currentIndex === mediaItems.length - 1"
                aria-label="Next media"
                @click="currentIndex++"
              >
                <Icon name="mdi:chevron-right" size="24" />
              </button>
              <div
                class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5"
              >
                <button
                  v-for="(_, index) in mediaItems"
                  :key="index"
                  class="h-1.5 rounded-full transition-all"
                  :class="
                    index === currentIndex
                      ? 'w-4 bg-white'
                      : 'w-1.5 bg-white/50'
                  "
                  :aria-label="`Show media ${index + 1}`"
                  @click="currentIndex = index"
                />
              </div>
            </template>
          </section>

          <section
            class="flex min-h-0 flex-1 flex-col"
            :class="hasMedia ? 'md:w-[42%]' : 'md:w-full'"
          >
            <PostDetails :post="post" @close="router.back()" />
          </section>
        </div>
      </article>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import PostDetails from '~~/layers/social/app/components/PostDetails.vue'
import AudioPlayer from '~~/layers/social/app/components/AudioPlayer.vue'
import PostDetailRightSideNav from '~~/layers/social/app/components/PostDetailRightSideNav.vue'
import { usePost } from '../../composables/usePost'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const route = useRoute()
const router = useRouter()
const { isLoading, error, getPostById, normalizePost } = usePost()

const postId = computed(() => route.params.id as string)
const post = ref<IFeedItem | null>(null)
const currentIndex = ref(0)

const mediaItems = computed(() => {
  if (!post.value) return []
  if (post.value.mediaItems?.length) return post.value.mediaItems
  return post.value.media ? [post.value.media] : []
})

const hasMedia = computed(() => mediaItems.value.length > 0)
const currentMedia = computed(
  () => mediaItems.value[currentIndex.value] ?? mediaItems.value[0],
)

watch(
  () => postId.value,
  () => {
    currentIndex.value = 0
  },
)

onMounted(async () => {
  if (!postId.value) return
  const fetchedPost = await getPostById(postId.value)
  post.value = normalizePost(fetchedPost)
})
</script>
