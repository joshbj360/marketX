<template>
  <div
    class="flex items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900"
  >
    <NuxtLink
      :to="`/profile/${user.username}`"
      class="flex min-w-0 flex-1 items-center gap-3"
    >
      <Avatar
        :username="user.username ?? 'User'"
        :avatar="user.avatar ?? ''"
        size="lg"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate font-semibold text-gray-900 dark:text-neutral-100">
          {{ user.username }}
        </p>
        <p
          v-if="user.bio"
          class="truncate text-sm text-gray-500 dark:text-neutral-400"
        >
          {{ user.bio }}
        </p>
      </div>
    </NuxtLink>

    <FollowButton
      v-if="!hideFollow && user.id !== profileStore.userId"
      :user-id="user.id"
      :username="user.username"
      class="rounded-lg px-4 py-1.5 text-sm font-semibold"
    />
  </div>
</template>

<script setup lang="ts">
import { useProfileStore } from '~/stores/profile.store'
import type { IProfile } from '~/layers/profile/app/types/profile.types'
import { formatAvatarUrl } from '~~/shared/utils/formatters'
import FollowButton from './FollowButton.vue'

defineProps<{
  user: IProfile
  hideFollow?: boolean
}>()

const profileStore = useProfileStore()
</script>
