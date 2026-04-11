<template>
  <HomeLayout :hide-right-sidebar="true">
    <div class="mx-auto max-w-2xl">
      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        <!-- Header -->
        <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900 dark:text-neutral-100">
              Messages
            </h2>
            <NuxtLink
              to="/messages/new"
              class="text-brand hover:text-[#d81b36]"
            >
              <Icon name="mdi:pencil-outline" size="24" />
            </NuxtLink>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search messages..."
            class="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
        </div>

        <!-- Conversations List -->
        <div class="min-h-[60vh]">
          <div v-if="isLoading" class="flex items-center justify-center py-20">
            <Icon name="eos-icons:loading" size="32" class="text-brand" />
          </div>
          <div
            v-else-if="filteredConversations.length === 0"
            class="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-neutral-400"
          >
            <Icon name="mdi:message-outline" size="48" class="mb-3" />
            <p>No messages yet</p>
            <NuxtLink
              to="/messages/new"
              class="mt-2 text-sm text-brand hover:underline"
            >
              Start a conversation
            </NuxtLink>
          </div>
          <div v-else>
            <ConversationItem
              v-for="conversation in filteredConversations"
              :key="conversation.id"
              :conversation="conversation"
            />
          </div>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import ConversationItem from '../../components/ConversationItem.vue'

definePageMeta({ middleware: 'auth' })

const { fetchConversations, isLoading, conversations } = useChat()
const searchQuery = ref('')

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(
    (c) =>
      c.otherUser?.username?.toLowerCase().includes(q) ||
      c.otherUser?.name?.toLowerCase().includes(q),
  )
})

onMounted(() => {
  fetchConversations()
})
</script>
