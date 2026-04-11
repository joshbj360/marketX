<template>
  <HomeLayout :hide-right-sidebar="true">
    <div
      class="mx-auto flex h-[calc(100vh-6rem)] max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <!-- Chat Header -->
      <div
        class="flex shrink-0 items-center gap-3 border-b border-gray-200 p-4 dark:border-neutral-800"
      >
        <NuxtLink
          to="/messages"
          class="mr-1 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Icon name="mdi:arrow-left" size="22" />
        </NuxtLink>

        <!-- Store conversation header -->
        <NuxtLink
          v-if="otherUser && isStoreConversation"
          :to="`/sellers/profile/${(otherUser as any).storeSlug}`"
          class="flex min-w-0 flex-1 items-center gap-3"
        >
          <StoreAvatar
            :logo="otherUser.avatar ?? ''"
            :store-name="(otherUser as any).name ?? ''"
            size="lg"
          />
          <div class="min-w-0">
            <p
              class="truncate font-semibold text-gray-900 dark:text-neutral-100"
            >
              {{ (otherUser as any).name || otherUser.username }}
            </p>
            <p class="text-xs text-gray-400 dark:text-neutral-500">Store</p>
          </div>
        </NuxtLink>

        <!-- User conversation header -->
        <NuxtLink
          v-else-if="otherUser"
          :to="`/profile/${otherUser.username}`"
          class="flex min-w-0 flex-1 items-center gap-3"
        >
          <Avatar
            class="truncate font-semibold text-gray-900 dark:text-neutral-100"
            :avatar="otherUser.avatar ?? ''"
            :username="otherUser.username ?? ''"
            size="lg"
          />
          <p class="truncate font-semibold text-gray-900 dark:text-neutral-100">
            {{ (otherUser as any).name || otherUser.username }}
          </p>
        </NuxtLink>

        <!-- Loading skeleton (only while header data is still being fetched) -->
        <div v-else-if="!headerReady" class="flex flex-1 items-center gap-3">
          <div
            class="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"
          />
          <div
            class="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-700"
          />
        </div>

        <!-- Fallback when conversation not found after load -->
        <div v-else class="flex flex-1 items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700"
          >
            <Icon name="mdi:account-outline" size="20" class="text-gray-400" />
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">
            Conversation
          </p>
        </div>
      </div>

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-neutral-900"
      >
        <div
          v-if="isLoading && !messages.length"
          class="flex h-full items-center justify-center"
        >
          <Icon name="eos-icons:loading" size="32" class="text-brand" />
        </div>
        <div
          v-else-if="messages.length === 0"
          class="flex h-full flex-col items-center justify-center text-gray-500 dark:text-neutral-400"
        >
          <Icon name="mdi:message-outline" size="48" class="mb-3" />
          <p>No messages yet. Say hi! 👋</p>
        </div>
        <div v-else>
          <MessageBubble
            v-for="(message, index) in messages"
            :key="message.id"
            :message="message"
            :show-avatar="shouldShowAvatar(index)"
          />
        </div>
      </div>

      <!-- Message Input -->
      <div
        class="shrink-0 border-t border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <form class="flex items-center gap-2" @submit.prevent="handleSend">
          <input
            v-model="messageText"
            type="text"
            placeholder="Message..."
            class="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
            @keydown.enter.exact.prevent="handleSend"
          />
          <button
            type="submit"
            :disabled="!messageText.trim()"
            class="px-2 text-sm font-semibold text-brand disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { definePageMeta, useRoute } from '#imports'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import MessageBubble from '../../components/MessageBubble.vue'
import Avatar from '../../components/Avatar.vue'
import StoreAvatar from '../../components/StoreAvatar.vue'
import { useChatStore } from '~~/layers/profile/app/stores/chat.store'

import { useChat } from '~~/layers/profile/app/composables/useChat'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const chatStore = useChatStore()
const { fetchConversations, fetchMessages, sendMessage, isLoading } = useChat()

const conversationId = computed(() => route.params.conversationId as string)
const conversation = computed(() =>
  chatStore.getConversationById(conversationId.value),
)
const messages = computed(() =>
  chatStore.getConversationMessages(conversationId.value),
)
const otherUser = computed(() => conversation.value?.otherUser)
const isStoreConversation = computed(() => !!(otherUser.value as any)?.isStore)

const messageText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const headerReady = ref(false)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(messages, scrollToBottom)

onMounted(async () => {
  // Ensure conversations are loaded (so we can resolve otherUser)
  if (!chatStore.conversations.length) {
    await fetchConversations().catch(() => {})
  }
  // Header data is now as resolved as it's going to be — stop skeleton
  headerReady.value = true
  await fetchMessages(conversationId.value)
  scrollToBottom()
})

// Reload messages when navigating to a different conversation
watch(conversationId, async (id) => {
  if (id) {
    await fetchMessages(id)
    scrollToBottom()
  }
})

const shouldShowAvatar = (index: number) => {
  if (index === 0) return true
  return messages.value[index]?.senderId !== messages.value[index - 1]?.senderId
}

const handleSend = async () => {
  const text = messageText.value.trim()
  if (!text) return
  messageText.value = ''
  scrollToBottom()
  try {
    await sendMessage(conversationId.value, text)
  } catch {
    // Message stays in chat with 'failed' status — no need to restore input
  }
}
</script>
