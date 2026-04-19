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
            <button
              class="rounded-full p-1 text-brand transition-colors hover:bg-brand/10"
              :title="composing ? 'Cancel' : 'New message'"
              @click="toggleCompose"
            >
              <Icon :name="composing ? 'mdi:close' : 'mdi:pencil-outline'" size="22" />
            </button>
          </div>

          <!-- Inbox search (shown when not composing) -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="!composing" class="relative">
              <Icon
                name="mdi:magnify"
                size="16"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search conversations..."
                class="w-full rounded-lg bg-gray-100 py-2 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </Transition>

          <!-- Compose panel: search + suggestions -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="composing">
              <div class="relative">
                <Icon
                  name="mdi:magnify"
                  size="16"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref="composeInputRef"
                  v-model="composeQuery"
                  type="text"
                  placeholder="Search people or stores..."
                  class="w-full rounded-lg bg-gray-100 py-2 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                />
                <Icon
                  v-if="isSearching"
                  name="eos-icons:loading"
                  size="14"
                  class="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- Compose suggestions / search results panel -->
        <Transition
          enter-active-class="transition-all duration-200 overflow-hidden"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[480px] opacity-100"
          leave-active-class="transition-all duration-150 overflow-hidden"
          leave-from-class="max-h-[480px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="composing" class="border-b border-gray-100 dark:border-neutral-800">
            <!-- Loading state -->
            <div
              v-if="isSearching || isLoadingFollowing"
              class="flex items-center justify-center py-8"
            >
              <Icon name="eos-icons:loading" size="24" class="animate-spin text-brand" />
            </div>

            <!-- No results -->
            <div
              v-else-if="composeQuery.trim() && composeResults.length === 0"
              class="py-10 text-center text-sm text-gray-500 dark:text-neutral-400"
            >
              <Icon name="mdi:account-search-outline" size="36" class="mx-auto mb-2 opacity-40" />
              No results for "{{ composeQuery }}"
            </div>

            <!-- Results list -->
            <template v-else>
              <p
                v-if="!composeQuery.trim()"
                class="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
              >
                People you follow
              </p>
              <div class="max-h-72 overflow-y-auto">
                <button
                  v-for="item in composeResults"
                  :key="`${item.type}-${item.id}`"
                  :disabled="isCreating && selectedId === item.id"
                  class="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-neutral-800 dark:hover:bg-neutral-900"
                  @click="startConversation(item.id, item.type)"
                >
                  <img
                    :src="item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name || item.username}`"
                    :alt="item.name || item.username"
                    class="h-10 w-10 shrink-0 rounded-xl object-cover"
                    :class="item.type === 'SELLER' ? 'rounded-xl' : 'rounded-full'"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1">
                      <p class="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100">
                        {{ item.name || item.username }}
                      </p>
                      <Icon
                        v-if="item.isVerified"
                        name="mdi:check-decagram"
                        size="13"
                        class="shrink-0 text-blue-500"
                      />
                    </div>
                    <p class="truncate text-xs text-gray-500 dark:text-neutral-400">
                      {{ item.type === 'SELLER' ? 'Store · ' : '' }}@{{ item.username }}
                    </p>
                  </div>
                  <div class="shrink-0">
                    <Icon
                      v-if="isCreating && selectedId === item.id"
                      name="eos-icons:loading"
                      size="16"
                      class="animate-spin text-brand"
                    />
                    <span
                      v-else
                      class="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand"
                    >
                      Message
                    </span>
                  </div>
                </button>

                <!-- Empty following state -->
                <div
                  v-if="!composeQuery.trim() && composeResults.length === 0 && !isLoadingFollowing"
                  class="py-10 text-center text-sm text-gray-500 dark:text-neutral-400"
                >
                  <Icon name="mdi:account-group-outline" size="36" class="mx-auto mb-2 opacity-40" />
                  <p class="font-medium">Follow people to message them</p>
                  <p class="mt-1 text-xs">Or search above to find someone</p>
                </div>
              </div>
            </template>
          </div>
        </Transition>

        <!-- Conversations List -->
        <div class="min-h-[50vh]">
          <div
            v-if="isInitialConversationLoad"
            class="flex items-center justify-center py-20"
          >
            <Icon name="eos-icons:loading" size="32" class="text-brand" />
          </div>
          <div
            v-else-if="filteredConversations.length === 0"
            class="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-neutral-400"
          >
            <Icon name="mdi:message-outline" size="48" class="mb-3 opacity-40" />
            <p class="font-medium">No messages yet</p>
            <button
              class="mt-2 text-sm font-semibold text-brand hover:underline"
              @click="toggleCompose"
            >
              Start a conversation
            </button>
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
import { useSocialApi } from '../../services/social.api'
import { useSearchApi } from '~~/layers/core/app/services/search.api'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const socialApi = useSocialApi()
const searchApi = useSearchApi()
const { fetchConversations, createConversation, createStoreConversation, isInitialConversationLoad, conversations } = useChat()

// ── Inbox search ────────────────────────────────────────────────────────
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

// ── Compose panel ────────────────────────────────────────────────────────
const composing = ref(false)
const composeInputRef = ref<HTMLInputElement | null>(null)
const composeQuery = ref('')
const composeResults = ref<any[]>([])
const isSearching = ref(false)
const isLoadingFollowing = ref(false)
const following = ref<any[]>([])
const isCreating = ref(false)
const selectedId = ref<string | null>(null)

const toggleCompose = () => {
  composing.value = !composing.value
  if (composing.value) {
    composeQuery.value = ''
    composeResults.value = following.value
    nextTick(() => composeInputRef.value?.focus())
  }
}

// Preload following on mount so the panel is instant
const loadFollowing = async () => {
  isLoadingFollowing.value = true
  try {
    const res: any = await socialApi.getFollowing(50)
    let rawItems: any[] = []
    if (Array.isArray(res)) rawItems = res
    else if (res?.data) rawItems = Array.isArray(res.data) ? res.data : res.data.items || res.data.users || res.data.following || []
    else if (res?.items) rawItems = res.items

    following.value = rawItems
      .map((item: any) => {
        const node = item.following || item.target || item.user || item.profile || item
        if (node.store_slug || node.type === 'SELLER') {
          return { id: node.id, type: 'SELLER', username: node.store_slug || node.username, name: node.store_name || node.name, avatar: node.store_logo || node.avatar, isVerified: node.is_verified || node.isVerified }
        }
        return { id: node.id, type: 'USER', username: node.username, name: node.name || node.username, avatar: node.avatar, isVerified: node.is_verified || node.isVerified }
      })
      .filter((item: any) => item?.id)

    // If compose panel is already open, populate immediately
    if (composing.value && !composeQuery.value.trim()) {
      composeResults.value = following.value
    }
  } catch {
    following.value = []
  } finally {
    isLoadingFollowing.value = false
  }
}

// Search with debounce
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(composeQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    isSearching.value = false
    composeResults.value = following.value
    return
  }
  isSearching.value = true
  debounceTimer = setTimeout(doSearch, 350)
})

const doSearch = async () => {
  try {
    const res: any = await searchApi.search(composeQuery.value, 'all', 20)
    const data = res?.data || res
    const users = (data.users || []).map((u: any) => ({ ...u, type: 'USER' }))
    const stores = (data.stores || []).map((s: any) => ({
      id: s.id, type: 'SELLER', username: s.store_slug, name: s.store_name,
      avatar: s.store_logo, isVerified: s.is_verified,
    }))
    composeResults.value = [...users, ...stores]
  } catch {
    composeResults.value = []
  } finally {
    isSearching.value = false
  }
}

const startConversation = async (targetId: string, type: 'USER' | 'SELLER' = 'USER') => {
  if (isCreating.value) return
  isCreating.value = true
  selectedId.value = targetId
  try {
    const conv = type === 'SELLER'
      ? await createStoreConversation(targetId)
      : await createConversation(targetId)
    composing.value = false
    router.push(`/messages/${conv.id}`)
  } catch {
    // keep panel open so user can retry
  } finally {
    isCreating.value = false
    selectedId.value = null
  }
}

onMounted(() => {
  fetchConversations()
  loadFollowing() // preload so compose panel opens instantly
})
</script>
