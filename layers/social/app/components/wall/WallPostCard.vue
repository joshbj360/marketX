<template>
  <div class="rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <NuxtLink :to="`/profile/${post.author.username}`" class="shrink-0">
          <div
            class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand/10 to-violet-100 text-sm font-black text-brand dark:from-brand/20 dark:to-violet-900/30"
          >
            <img
              v-if="post.author.avatar"
              :src="imgAvatar(post.author.avatar)"
              class="h-full w-full rounded-xl object-cover"
            />
            <span v-else>{{ post.author.username?.[0]?.toUpperCase() ?? 'U' }}</span>
          </div>
        </NuxtLink>

        <div>
          <div class="flex items-center gap-1.5">
            <NuxtLink
              :to="`/profile/${post.author.username}`"
              class="text-sm font-bold text-gray-900 hover:underline dark:text-neutral-100"
            >
              {{ post.author.username }}
            </NuxtLink>
            <!-- Shoutout badge -->
            <span
              v-if="post.type === 'SHOUTOUT'"
              class="flex items-center gap-0.5 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand"
            >
              <Icon name="mdi:bullhorn-outline" size="10" />
              Shoutout
            </span>
          </div>
          <p class="text-[11px] text-gray-400 dark:text-neutral-500">{{ timeAgo(post.created_at) }}</p>
        </div>
      </div>

      <!-- Delete (owner or author) -->
      <button
        v-if="canDelete"
        class="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        :disabled="deleting"
        @click="handleDelete"
      >
        <Icon v-if="deleting" name="eos-icons:loading" size="14" class="animate-spin" />
        <Icon v-else name="mdi:delete-outline" size="16" />
      </button>
    </div>

    <!-- Body text -->
    <p
      v-if="post.caption || post.content"
      class="mt-3 text-sm leading-relaxed text-gray-700 dark:text-neutral-300"
    >
      {{ post.caption || post.content }}
    </p>

    <!-- Media -->
    <div v-if="post.media?.length" class="mt-3">
      <div
        :class="post.media.length === 1 ? 'rounded-xl overflow-hidden' : 'grid grid-cols-2 gap-1 rounded-xl overflow-hidden'"
      >
        <img
          v-for="(m, i) in post.media.slice(0, 4)"
          :key="m.id"
          :src="m.url"
          :alt="m.altText ?? ''"
          class="aspect-square w-full object-cover"
          :class="post.media.length === 1 ? 'max-h-80 rounded-xl' : ''"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-3 flex items-center gap-4 border-t border-gray-50 pt-3 dark:border-neutral-800">
      <!-- Like -->
      <button
        class="flex items-center gap-1.5 text-xs font-semibold transition"
        :class="localLiked ? 'text-brand' : 'text-gray-400 hover:text-brand dark:text-neutral-500'"
        @click="toggleLike"
      >
        <Icon
          :name="localLiked ? 'mdi:heart' : 'mdi:heart-outline'"
          size="16"
        />
        {{ localLikes > 0 ? localLikes : '' }}
        <span>{{ localLiked ? 'Liked' : 'Like' }}</span>
      </button>

      <!-- Comment -->
      <button
        class="flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition hover:text-brand dark:text-neutral-500"
        @click="router.push(`/post/${post.id}`)"
      >
        <Icon name="mdi:comment-outline" size="16" />
        {{ post._count.comments > 0 ? post._count.comments : '' }}
        <span>Comment</span>
      </button>
    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '#imports'
import { imgAvatar } from '~~/layers/core/app/utils/cloudinary'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useWallApi, type WallType } from '~~/layers/social/app/services/wall.api'
import { usePostApi } from '~~/layers/social/app/services/post.api'
import type { IWallPost } from '~~/layers/social/app/services/wall.api'

const props = defineProps<{
  post: IWallPost
  wallType: WallType
  wallSlug: string
  isWallOwner?: boolean
}>()

const emit = defineEmits<{
  deleted: [postId: string]
}>()

const router = useRouter()
const profileStore = useProfileStore()
const deleting = ref(false)

const localLiked = ref(props.post.viewerLiked)
const localLikes = ref(props.post._count.likes)

const canDelete = computed(
  () => profileStore.isLoggedIn && (
    profileStore.me?.id === props.post.author.id || props.isWallOwner
  ),
)

const timeAgo = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(date).toLocaleDateString()
}

const toggleLike = async () => {
  if (!profileStore.isLoggedIn) return
  const wasLiked = localLiked.value
  localLiked.value = !wasLiked
  localLikes.value += wasLiked ? -1 : 1
  try {
    if (wasLiked) {
      await usePostApi().unlikePost(props.post.id)
    } else {
      await usePostApi().likePost(props.post.id)
    }
  } catch {
    localLiked.value = wasLiked
    localLikes.value += wasLiked ? 1 : -1
  }
}

const handleDelete = async () => {
  if (deleting.value) return
  deleting.value = true
  try {
    await useWallApi().deleteShoutout(props.wallType, props.wallSlug, props.post.id)
    emit('deleted', props.post.id)
  } catch {
    // BaseApiClient shows toast
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
