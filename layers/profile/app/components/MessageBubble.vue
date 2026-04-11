<template>
  <div
    class="mb-4 flex"
    :class="isOwnMessage ? 'justify-end' : 'justify-start'"
  >
    <!-- Other User Avatar -->
    <Avatar
      v-if="!isOwnMessage && showAvatar"
      :username="message.sender?.username ?? 'User'"
      :avatar="message.sender?.avatar ?? ''"
      size="sm"
      class="mr-2 shrink-0"
    />
    <div v-else-if="!isOwnMessage" class="mr-2 w-8"></div>

    <!-- Message Content -->
    <div
      class="max-w-[70%] rounded-2xl px-4 py-2"
      :class="
        isOwnMessage
          ? 'rounded-br-sm bg-brand text-white'
          : 'rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-neutral-100'
      "
    >
      <p class="whitespace-pre-wrap break-words text-sm">
        {{ message.content }}
      </p>
      <div
        class="mt-1 flex items-center gap-1"
        :class="isOwnMessage ? 'justify-end' : 'justify-start'"
      >
        <span
          class="text-xs"
          :class="
            isOwnMessage
              ? 'text-white/70'
              : 'text-gray-500 dark:text-neutral-400'
          "
        >
          {{ formatTime(message.sentAt) }}
        </span>

        <!-- Delivery status (own messages only) -->
        <template v-if="isOwnMessage">
          <!-- Sending -->
          <Icon
            v-if="message.status === 'sending'"
            name="mdi:clock-outline"
            size="12"
            class="text-white/50"
          />
          <!-- Failed -->
          <Icon
            v-else-if="message.status === 'failed'"
            name="mdi:alert-circle-outline"
            size="12"
            class="text-red-300"
            title="Failed to send"
          />
          <!-- Read (double tick) -->
          <Icon
            v-else-if="message.read"
            name="mdi:check-all"
            size="13"
            class="text-white/80"
          />
          <!-- Sent / delivered (single tick) -->
          <Icon
            v-else
            name="mdi:check"
            size="13"
            class="text-white/60"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IMessage } from '../types/profile.types'
import { useProfileStore } from '../stores/profile.store'

const props = defineProps<{
  message: IMessage
  showAvatar?: boolean
}>()

const profileStore = useProfileStore()
const isOwnMessage = computed(
  () => props.message.senderId === profileStore.userId,
)

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
</script>
