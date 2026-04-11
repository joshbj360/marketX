<template>
  <div class="space-y-6 p-6">
    <!-- Bio Section -->
    <div
      v-if="profile.bio"
      class="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h3
        class="mb-3 text-lg font-semibold text-gray-900 dark:text-neutral-100"
      >
        About
      </h3>
      <p class="whitespace-pre-wrap text-gray-700 dark:text-neutral-300">
        {{ profile.bio }}
      </p>
    </div>

    <!-- Info Grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Website -->
      <div
        v-if="profile.profileUrl"
        class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20"
          >
            <Icon
              name="mdi:link"
              size="20"
              class="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="mb-1 text-sm text-gray-500 dark:text-neutral-400">
              Profile Url
            </p>
            <a
              :href="profile.profileUrl"
              target="_blank"
              class="break-all text-brand hover:underline"
            >
              {{ profile.profileUrl }}
            </a>
          </div>
        </div>
      </div>

      <!-- Location -->
      <div
        v-if="profile.stateOfResidence"
        class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
          >
            <Icon
              name="mdi:map-marker"
              size="20"
              class="text-green-600 dark:text-green-400"
            />
          </div>
          <div class="flex-1">
            <p class="mb-1 text-sm text-gray-500 dark:text-neutral-400">
              Location
            </p>
            <p class="text-gray-900 dark:text-neutral-100">
              {{ profile.stateOfResidence }}
            </p>
          </div>
        </div>
      </div>

      <!-- Email (own profile only) -->
      <div
        v-if="showEmail && profile.email"
        class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20"
          >
            <Icon
              name="mdi:email"
              size="20"
              class="text-purple-600 dark:text-purple-400"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="mb-1 text-sm text-gray-500 dark:text-neutral-400">
              Email
            </p>
            <p class="break-all text-gray-900 dark:text-neutral-100">
              {{ profile.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- Joined Date -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20"
          >
            <Icon
              name="mdi:calendar"
              size="20"
              class="text-orange-600 dark:text-orange-400"
            />
          </div>
          <div class="flex-1">
            <p class="mb-1 text-sm text-gray-500 dark:text-neutral-400">
              Joined
            </p>
            <p class="text-gray-900 dark:text-neutral-100">
              {{ formatDate(profile.created_at as Date) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Type -->
    <div
      class="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h3
        class="mb-4 text-lg font-semibold text-gray-900 dark:text-neutral-100"
      >
        Account Type
      </h3>
      <div class="flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full"
          :class="
            profile.role === 'SELLER'
              ? 'bg-brand/10'
              : 'bg-gray-100 dark:bg-neutral-800'
          "
        >
          <Icon
            :name="profile.role === 'SELLER' ? 'mdi:store' : 'mdi:account'"
            size="24"
            :class="
              profile.role === 'SELLER'
                ? 'text-brand'
                : 'text-gray-600 dark:text-neutral-400'
            "
          />
        </div>
        <div>
          <p class="font-semibold text-gray-900 dark:text-neutral-100">
            {{
              profile.role === 'SELLER' ? 'Seller Account' : 'Personal Account'
            }}
          </p>
          <p class="text-sm text-gray-500 dark:text-neutral-400">
            {{
              profile.role === 'SELLER'
                ? 'This user can sell products'
                : 'Regular user account'
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Verification Status -->
    <div
      v-if="profile.email_verified"
      class="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/10"
    >
      <div class="flex items-center gap-2 text-green-700 dark:text-green-400">
        <Icon name="mdi:check-circle" size="20" />
        <span class="font-medium">Verified Account</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IProfile } from '~~/layers/profile/app/types/profile.types'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'

const props = defineProps<{
  profile: IProfile | Partial<IProfile>
}>()

const profileStore = useProfileStore()

const showEmail = computed(() => {
  // Only show email on own profile
  return profileStore.me?.id === props.profile.id
})

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
</script>
