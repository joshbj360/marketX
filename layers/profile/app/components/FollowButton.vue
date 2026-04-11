<template>
  <button
    @click.stop="handleFollow"
    :disabled="isLoading || isProcessing"
    class="text-xs font-semibold leading-none transition-colors disabled:opacity-50"
    :class="
      following
        ? 'text-gray-400 hover:text-red-500 dark:text-neutral-500'
        : 'text-brand hover:text-[#d81b36]'
    "
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFollow } from '../composables/useFollow'
import { useFollowStore } from '../stores/follow.store'
import { useProfileStore } from '../stores/profile.store'
import { notify } from '@kyvg/vue3-notification'
const { t } = useI18n()

const props = defineProps<{
  userId: string
  username: string
}>()

const followStore = useFollowStore()
const profileStore = useProfileStore()
const { followUser, unfollowUser, checkIfFollowing, isLoading } = useFollow()

const isProcessing = ref(false)

// Follow status keyed by username (matches followStatusCache keys in follow.store)
const following = computed(() => followStore.isFollowing(props.username))

const label = computed(() => {
  if (isProcessing.value || isLoading.value) return '…'
  return following.value ? t('post.following') : t('post.follow')
})

// Hydrate follow status on mount if not already cached
onMounted(() => {
  if (profileStore.userId && !followStore.followStatusCache.has(props.username)) {
    checkIfFollowing(props.username)
  }
})

const handleFollow = async () => {
  if (!profileStore.userId) {
    notify({ type: 'warn', text: t('auth.loginToFollow') })
    return
  }
  isProcessing.value = true
  try {
    if (following.value) {
      await unfollowUser(props.username)
    } else {
      await followUser(props.username)
    }
  } catch (err: any) {
    notify({ type: 'error', text: err?.data?.statusMessage || err?.message || t('errors.failedFollow') })
  } finally {
    isProcessing.value = false
  }
}
</script>
