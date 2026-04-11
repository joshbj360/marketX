<template>
  <div
    class="flex cursor-pointer items-start gap-3 border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
    :class="{ 'bg-blue-50 dark:bg-blue-900/10': !notification.read }"
    @click="handleClick"
  >
    <!-- Actor Avatar -->
    <img
      :src="actorAvatar"
      :alt="actorName"
      class="h-12 w-12 shrink-0 rounded-full object-cover"
    />

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <p class="text-sm text-gray-800 dark:text-neutral-200">
        <span class="font-semibold">{{ actorName }}</span>
        <span class="ml-1">{{ notificationMessage }}</span>
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {{ timeAgo(notification.createdAt) }}
      </p>
    </div>

    <!-- Action/Preview -->
    <div class="shrink-0">
      <!-- Follow Back Button -->
      <FollowButton
        v-if="notification.type === 'FOLLOW'"
        :user-id="notification.actorId"
        :username="actorName"
        class="rounded-lg px-3 py-1 text-xs"
      />

      <!-- Post Preview Image -->
      <img
        v-else-if="postPreview"
        :src="postPreview"
        alt="Post"
        class="h-12 w-12 rounded object-cover"
      />
    </div>

    <!-- Unread Indicator -->
    <div
      v-if="!notification.read"
      class="h-2 w-2 shrink-0 rounded-full bg-brand"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '~/layers/user/app/composables/useNotifications'
import type { INotification } from '~/layers/profile/app/types/profile.types'
import { formatAvatarUrl } from '~~/shared/utils/formatters'
import FollowButton from './FollowButton.vue'

const props = defineProps<{
  notification: INotification
}>()

const router = useRouter()
const { markAsRead } = useNotifications()

const actorAvatar = computed(() => {
  // Get actor avatar from notification data
  return formatAvatarUrl(props.notification.actorId)
})

const actorName = computed(() => {
  // Get actor name from notification data
  return props.notification.actorId // Update based on your data structure
})

const notificationMessage = computed(() => {
  const messages: Record<string, string> = {
    FOLLOW: 'started following you',
    LIKE_POST: 'liked your post',
    COMMENT_POST: 'commented on your post',
    LIKE_COMMENT: 'liked your comment',
    MENTION: 'mentioned you in a post',
    TAG: 'tagged you in a post',
  }
  return messages[props.notification.type] || props.notification.message
})

const postPreview = computed(() => {
  // Return post preview image if applicable
  return null // Update based on your data structure
})

const timeAgo = (date: string) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  )
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

const handleClick = async () => {
  // Mark as read
  if (!props.notification.read) {
    await markAsRead(props.notification.id)
  }

  // Navigate based on notification type
  const routes: Record<string, string> = {
    FOLLOW: `/profile/${actorName.value}`,
    LIKE_POST: `/post/${props.notification.postId}`,
    COMMENT_POST: `/post/${props.notification.postId}`,
    LIKE_COMMENT: `/post/${props.notification.postId}`,
    MENTION: `/post/${props.notification.postId}`,
    TAG: `/post/${props.notification.postId}`,
  }

  const route = routes[props.notification.type]
  if (route) {
    router.push(route)
  }
}
</script>
