<template>
  <NuxtLink
    :to="`/messages/${conversation.id}`"
    class="flex items-center gap-3 border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
    :class="{ 'bg-gray-50 dark:bg-neutral-900': isActive }"
  >
    <!-- Avatar: square for stores, round for users -->
    <div class="relative shrink-0">
      <StoreAvatar
        v-if="isStore"
        :logo="conversation.otherUser?.avatar ?? ''"
        :store-name="conversation.otherUser?.name ?? ''"
        size="xl"
      />
      <Avatar
        v-else
        :username="conversation.otherUser?.username ?? 'User'"
        :avatar="conversation.otherUser?.avatar ?? ''"
        size="xl"
      />
      <!-- Store badge -->
      <div
        v-if="isStore"
        class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand shadow-sm"
        title="Store"
      >
        <Icon name="mdi:store" size="9" class="text-white" />
      </div>
    </div>

    <!-- Message Info -->
    <div class="min-w-0 flex-1">
      <div class="mb-0.5 flex items-center justify-between gap-2">
        <div class="flex min-w-0 items-center gap-1.5">
          <p class="truncate font-semibold text-gray-900 dark:text-neutral-100">
            {{ displayName }}
          </p>
          <span
            v-if="isStore"
            class="shrink-0 rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand"
          >
            Store
          </span>
        </div>
        <p class="shrink-0 text-xs text-gray-400 dark:text-neutral-500">
          {{ formatTime(conversation.lastMessageAt || conversation.updated_at) }}
        </p>
      </div>

      <!-- Product context for store chats -->
      <p
        v-if="isStore && (conversation as any).currentProduct"
        class="truncate text-[11px] font-medium text-brand"
      >
        re: {{ (conversation as any).currentProduct?.title }}
      </p>

      <!-- Last message preview -->
      <p class="truncate text-sm text-gray-500 dark:text-neutral-400">
        {{ lastMessagePreview }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import Avatar from './Avatar.vue'
import StoreAvatar from './StoreAvatar.vue'
import type { IConversation } from '../types/profile.types'

const props = defineProps<{
  conversation: IConversation
  isActive?: boolean
}>()

const isStore = computed(() => !!(props.conversation.otherUser as any)?.isStore)

const displayName = computed(() => {
  const u = props.conversation.otherUser as any
  if (!u) return 'Unknown'
  return u.name || u.username || 'Unknown'
})

const lastMessagePreview = computed(() => {
  const msgs = (props.conversation as any).messages
  if (msgs?.length) return msgs[0].content
  return 'Start of conversation'
})

const formatTime = (date?: string | null) => {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return d.toLocaleDateString()
}
</script>
