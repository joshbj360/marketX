<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div
          class="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-neutral-100"
            >
              {{ type === 'followers' ? 'Followers' : 'Following' }}
            </h2>
            <button
              @click="$emit('close')"
              class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Icon
                name="mdi:close"
                size="24"
                class="text-gray-900 dark:text-neutral-100"
              />
            </button>
          </div>

          <!-- Search -->
          <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
            <div class="relative">
              <Icon
                name="mdi:magnify"
                size="20"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                class="w-full rounded-lg bg-gray-50 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <!-- List -->
          <div class="max-h-[calc(80vh-160px)] overflow-y-auto">
            <!-- Loading -->
            <div v-if="isLoading" class="p-8 text-center">
              <Icon
                name="eos-icons:loading"
                size="32"
                class="animate-spin text-brand"
              />
            </div>

            <!-- Empty -->
            <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
              <Icon
                name="mdi:account-search"
                size="48"
                class="mx-auto mb-2 text-gray-300 dark:text-neutral-700"
              />
              <p class="text-gray-500 dark:text-neutral-400">
                {{ searchQuery ? 'No users found' : `No ${type}` }}
              </p>
            </div>

            <!-- Users List -->
            <div
              v-else
              class="divide-y divide-gray-200 dark:divide-neutral-800"
            >
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <button
                  @click="goToProfile(user.username)"
                  class="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <img
                    :src="
                      user.avatar ||
                      `https://avatar.iran.liara.run/public/boy?username=${user.username}`
                    "
                    :alt="user.username"
                    class="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate font-semibold text-gray-900 dark:text-neutral-100"
                    >
                      {{ user.username }}
                    </p>
                    <p
                      v-if="user.bio"
                      class="truncate text-sm text-gray-500 dark:text-neutral-400"
                    >
                      {{ user.bio }}
                    </p>
                  </div>
                </button>

                <!-- Follow Button (if not own profile) -->
                <button
                  v-if="user.id !== currentUserId"
                  @click="toggleFollow(user)"
                  class="flex-shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors"
                  :class="
                    user.isFollowing
                      ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600'
                      : 'bg-brand text-white hover:bg-[#d81b36]'
                  "
                >
                  {{ user.isFollowing ? 'Following' : 'Follow' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useFollowStore } from '~~/layers/profile/app/stores/follow.store'
import { useFollow } from '~~/layers/profile/app/composables/useFollow'

const props = defineProps<{
  type: 'followers' | 'following'
  username: string
}>()

const emit = defineEmits(['close'])

const router = useRouter()
const profileStore = useProfileStore()
const followStore = useFollowStore()
const { isLoading, followUser, unfollowUser, fetchFollowers, fetchFollowing } =
  useFollow()

const searchQuery = ref('')
const currentUserId = computed(() => profileStore.me?.id)

// Accessing the specific list for this user from the Store Map
const users = computed(() => {
  return props.type === 'followers'
    ? followStore.getFollowers(props.username)
    : followStore.getFollowing(props.username)
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.username.toLowerCase().includes(query) ||
      u.bio?.toLowerCase().includes(query),
  )
})

onMounted(async () => {
  // Only fetch if the list is empty to utilize caching
  if (users.value.length === 0) {
    if (props.type === 'followers') {
      await fetchFollowers(props.username)
    } else {
      await fetchFollowing(props.username)
    }
  }
})

const toggleFollow = async (user: any) => {
  const isCurrentlyFollowing = followStore.isFollowing(user.id)
  try {
    if (isCurrentlyFollowing) {
      await unfollowUser(user.username)
      followStore.setFollowStatus(user.username, false)
    } else {
      await followUser(user.username)
      followStore.setFollowStatus(user.username, true)
    }
  } catch (err) {
    console.error('Follow toggle failed', err)
  }
}

const goToProfile = (targetUsername: string) => {
  router.push(`/profile/${targetUsername}`)
  emit('close')
}

const formatNumber = (num: number) => num.toString() // Standardize if needed
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
