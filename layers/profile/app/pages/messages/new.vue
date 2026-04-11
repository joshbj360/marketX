<template>
  <HomeLayout :hide-right-sidebar="true">
    <div class="mx-auto max-w-2xl">
      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        <!-- Header -->
        <div
          class="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-neutral-800"
        >
          <NuxtLink
            to="/messages"
            class="text-gray-500 transition-colors hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <Icon name="mdi:arrow-left" size="22" />
          </NuxtLink>
          <h2 class="text-lg font-bold text-gray-900 dark:text-neutral-100">
            New Message
          </h2>
        </div>

        <!-- Search -->
        <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
          <div class="relative">
            <Icon
              name="mdi:magnify"
              size="18"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search people or stores..."
              class="w-full rounded-xl bg-gray-100 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand/20 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="min-h-[50vh]">
          <!-- Search results -->
          <template v-if="searchQuery.trim()">
            <div
              v-if="isSearching"
              class="flex items-center justify-center py-16"
            >
              <Icon
                name="eos-icons:loading"
                size="28"
                class="animate-spin text-brand"
              />
            </div>
            <div
              v-else-if="searchResults.length === 0"
              class="py-16 text-center text-sm text-gray-500 dark:text-neutral-400"
            >
              <Icon
                name="mdi:account-search-outline"
                size="40"
                class="mx-auto mb-2 opacity-50"
              />
              No results for "{{ searchQuery }}"
            </div>
            <template v-else>
              <template
                v-for="item in searchResults"
                :key="`${item.type}-${item.id}`"
              >
                <!-- User Row -->
                <UserRow
                  v-if="item.type === 'USER'"
                  :user="item"
                  :is-creating="isCreating && selectedId === item.id"
                  @select="startConversation(item.id)"
                />

                <!-- Store Row -->
                <button
                  v-else
                  @click="startConversation(item.id, 'SELLER')"
                  :disabled="isCreating && selectedId === item.id"
                  class="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <img
                      :src="
                        item.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`
                      "
                      :alt="item.name"
                      class="h-11 w-11 shrink-0 rounded-xl border border-gray-100 object-cover dark:border-neutral-800"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <p
                          class="truncate text-sm font-bold text-gray-900 dark:text-neutral-100"
                        >
                          {{ item.name }}
                        </p>
                        <Icon
                          v-if="item.isVerified"
                          name="mdi:check-decagram"
                          size="14"
                          class="shrink-0 text-blue-500"
                        />
                      </div>
                      <p
                        class="truncate text-xs font-medium text-gray-500 dark:text-neutral-400"
                      >
                        Store · @{{ item.username }}
                      </p>
                    </div>
                  </div>

                  <div class="shrink-0">
                    <Icon
                      v-if="isCreating && selectedId === item.id"
                      name="eos-icons:loading"
                      size="18"
                      class="animate-spin text-brand"
                    />
                    <span
                      v-else
                      class="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand"
                      >Message</span
                    >
                  </div>
                </button>
              </template>
            </template>
          </template>

          <!-- Following list -->
          <template v-else>
            <div
              v-if="isLoadingFollowing"
              class="flex items-center justify-center py-16"
            >
              <Icon
                name="eos-icons:loading"
                size="28"
                class="animate-spin text-brand"
              />
            </div>
            <template v-else-if="following.length > 0">
              <p
                class="px-4 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
              >
                People you follow
              </p>
              <template v-for="item in following" :key="item.id">
                <!-- Existing Following User Row -->
                <UserRow
                  v-if="item.type === 'USER'"
                  :user="item"
                  :is-creating="isCreating && selectedId === item.id"
                  @select="startConversation(item.id)"
                />

                <!-- Existing Following Store Row -->
                <button
                  v-else
                  @click="startConversation(item.id, 'SELLER')"
                  :disabled="isCreating && selectedId === item.id"
                  class="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <img
                      :src="
                        item.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${item.name || item.username}`
                      "
                      :alt="item.name || item.username"
                      class="h-11 w-11 shrink-0 rounded-xl border border-gray-100 object-cover dark:border-neutral-800"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <p
                          class="truncate text-sm font-bold text-gray-900 dark:text-neutral-100"
                        >
                          {{ item.name || item.username }}
                        </p>
                        <Icon
                          v-if="item.isVerified"
                          name="mdi:check-decagram"
                          size="14"
                          class="shrink-0 text-blue-500"
                        />
                      </div>
                      <p
                        class="truncate text-xs font-medium text-gray-500 dark:text-neutral-400"
                      >
                        Store · @{{ item.username }}
                      </p>
                    </div>
                  </div>
                  <div class="shrink-0">
                    <Icon
                      v-if="isCreating && selectedId === item.id"
                      name="eos-icons:loading"
                      size="18"
                      class="animate-spin text-brand"
                    />
                    <span
                      v-else
                      class="rounded-full bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand"
                      >Message</span
                    >
                  </div>
                </button>
              </template>
            </template>
            <div
              v-else
              class="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-neutral-400"
            >
              <div
                class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900"
              >
                <Icon name="mdi:account-group-outline" size="32" />
              </div>
              <p class="text-sm font-bold text-gray-900 dark:text-white">
                Follow people to message them
              </p>
              <p class="mt-1 text-xs text-gray-500">
                Or search above to find someone new
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import UserRow from '../../components/UserRow.vue'
import { useSocialApi } from '../../services/social.api'
import { useSearchApi } from '~~/layers/core/app/services/search.api'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const socialApi = useSocialApi()
const searchApi = useSearchApi()
const { createConversation, createStoreConversation } = useChat()

// ─── FOLLOWING ────────────────────────────────────────────────────────
const following = ref<any[]>([])
const isLoadingFollowing = ref(false)

const loadFollowing = async () => {
  isLoadingFollowing.value = true
  try {
    const res: any = await socialApi.getFollowing(50)

    let rawItems = []
    if (Array.isArray(res)) {
      rawItems = res
    } else if (res?.data) {
      rawItems = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.users || res.data.following || []
    } else if (res?.items) {
      rawItems = res.items
    }

    // FIXED: Safely extract the nested user object from relation wrappers like `.following` or `.target`
    following.value = rawItems
      .map((item: any) => {
        // Resolve relation wrappers if they exist
        const node =
          item.following || item.target || item.user || item.profile || item

        if (node.store_slug || node.type === 'SELLER') {
          return {
            id: node.id,
            type: 'SELLER',
            username: node.store_slug || node.username,
            name: node.store_name || node.name,
            avatar: node.store_logo || node.avatar,
            isVerified: node.is_verified || node.isVerified,
          }
        }

        return {
          id: node.id,
          type: 'USER',
          username: node.username,
          name: node.name || node.username,
          avatar: node.avatar,
          isVerified: node.is_verified || node.isVerified,
        }
      })
      .filter((item: any) => item && item.id)
  } catch (err) {
    console.error('[New Message Following] Error:', err)
    following.value = []
  } finally {
    isLoadingFollowing.value = false
  }
}

// ─── SEARCH ───────────────────────────────────────────────────────────
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (!val.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(doSearch, 400)
})

const doSearch = async () => {
  try {
    const res: any = await searchApi.search(searchQuery.value, 'all', 20)
    const data = res?.data || res

    const users = (data.users || []).map((u: any) => ({ ...u, type: 'USER' }))
    const stores = (data.stores || []).map((s: any) => ({
      id: s.id,
      type: 'SELLER',
      username: s.store_slug,
      name: s.store_name,
      avatar: s.store_logo,
      isVerified: s.is_verified,
    }))

    searchResults.value = [...users, ...stores]
  } catch (err) {
    console.error('[New Message Search] Error:', err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// ─── CREATE CONVERSATION ──────────────────────────────────────────────
const isCreating = ref(false)
const selectedId = ref<string | null>(null)

const startConversation = async (targetId: string, type: 'USER' | 'SELLER' = 'USER') => {
  if (isCreating.value) return
  isCreating.value = true
  selectedId.value = targetId

  try {
    const conv = type === 'SELLER'
      ? await createStoreConversation(targetId)
      : await createConversation(targetId)
    router.push(`/messages/${conv.id}`)
  } catch (err) {
    console.error('[New Message] Failed to create conversation:', err)
  } finally {
    isCreating.value = false
    selectedId.value = null
  }
}

onMounted(() => {
  loadFollowing()
})
</script>
