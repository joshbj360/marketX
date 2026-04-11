<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- Accent stripe -->
    <div class="h-[3px] w-full" :class="accentClass" />

    <div class="p-5">
      <div class="flex items-start gap-5">
        <!-- Avatar -->
        <div class="relative shrink-0">
          <img
            :src="
              profile.avatar ||
              `https://api.dicebear.com/9.x/initials/svg?seed=${profile.username}`
            "
            :alt="profile.username || 'Avatar'"
            class="h-20 w-20 rounded-full object-cover ring-2 ring-gray-100 sm:h-28 sm:w-28 dark:ring-neutral-800"
          />
          <div
            v-if="profile.role === 'SELLER'"
            class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900"
          >
            <Icon name="mdi:store" size="13" class="text-white" />
          </div>
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <!-- Username + actions -->
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <h1
              class="text-[17px] font-bold leading-tight text-gray-900 dark:text-neutral-100"
            >
              {{ profile.username }}
            </h1>
            <span
              v-if="profile.role === 'SELLER'"
              class="inline-flex select-none items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              <Icon name="mdi:store" size="9" />
              {{ $t('profile.seller') }}
            </span>

            <!-- Own profile -->
            <template v-if="isOwnProfile">
              <button
                @click="$emit('edit')"
                class="ml-auto rounded-lg bg-gray-100 px-3.5 py-1.5 text-[13px] font-semibold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                {{ $t('profile.editProfile') }}
              </button>
              <button
                @click="$emit('settings')"
                class="rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <Icon name="mdi:cog-outline" size="18" />
              </button>
            </template>

            <!-- Other profile -->
            <template v-else>
              <button
                @click="isFollowing ? $emit('unfollow') : $emit('follow')"
                :disabled="isFollowLoading"
                class="ml-auto min-w-[80px] rounded-lg px-5 py-1.5 text-center text-[13px] font-semibold transition-colors disabled:opacity-60"
                :class="
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    : 'bg-brand text-white hover:bg-[#d81b36]'
                "
              >
                <Icon
                  v-if="isFollowLoading"
                  name="eos-icons:loading"
                  size="14"
                  class="inline animate-spin"
                />
                <span v-else>{{
                  $t(isFollowing ? 'post.following' : 'post.follow')
                }}</span>
              </button>
              <button
                @click="$emit('message')"
                class="rounded-lg bg-gray-100 px-4 py-1.5 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                {{ $t('profile.message') }}
              </button>
              <button
                class="rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <Icon name="mdi:dots-horizontal" size="18" />
              </button>
            </template>
          </div>

          <!-- Stats -->
          <div class="mb-3 flex items-center gap-5">
            <div class="text-center">
              <div
                class="text-[15px] font-bold leading-tight text-gray-900 dark:text-neutral-100"
              >
                {{ formatNum(stats.postsCount) }}
              </div>
              <div class="text-[11px] text-gray-400 dark:text-neutral-500">
                {{ $t('profile.posts') }}
              </div>
            </div>
            <button
              @click="$emit('show-followers')"
              class="text-center transition-opacity hover:opacity-70"
            >
              <div
                class="text-[15px] font-bold leading-tight text-gray-900 dark:text-neutral-100"
              >
                {{ formatNum(stats.followersCount) }}
              </div>
              <div class="text-[11px] text-gray-400 dark:text-neutral-500">
                {{ $t('profile.followers') }}
              </div>
            </button>
            <button
              @click="$emit('show-following')"
              class="text-center transition-opacity hover:opacity-70"
            >
              <div
                class="text-[15px] font-bold leading-tight text-gray-900 dark:text-neutral-100"
              >
                {{ formatNum(stats.followingCount) }}
              </div>
              <div class="text-[11px] text-gray-400 dark:text-neutral-500">
                {{ $t('profile.following') }}
              </div>
            </button>
            <div v-if="stats.likesCount" class="text-center">
              <div
                class="text-[15px] font-bold leading-tight text-gray-900 dark:text-neutral-100"
              >
                {{ formatNum(stats.likesCount) }}
              </div>
              <div class="text-[11px] text-gray-400 dark:text-neutral-500">
                {{ $t('profile.likes') }}
              </div>
            </div>
          </div>

          <!-- Bio -->
          <p
            v-if="profile.bio"
            class="mb-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700 dark:text-neutral-300"
          >
            {{ profile.bio }}
          </p>

          <!-- Links -->
          <div class="flex flex-wrap items-center gap-3 text-[12px]">
            <a
              v-if="profile.profileUrl"
              :href="profile.profileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 text-brand hover:underline"
            >
              <Icon name="mdi:link-variant" size="13" />
              {{ profile.profileUrl.replace(/^https?:\/\//, '').split('/')[0] }}
            </a>
            <span
              v-if="profile.stateOfResidence"
              class="flex items-center gap-1 text-gray-400 dark:text-neutral-500"
            >
              <Icon name="mdi:map-marker-outline" size="13" />
              {{ profile.stateOfResidence }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IProfile, IProfileStats } from '../../types/profile.types'

const props = defineProps<{
  profile: IProfile
  stats: IProfileStats
  isOwnProfile: boolean
  isFollowing: boolean
  isFollowLoading?: boolean
}>()

defineEmits([
  'edit',
  'settings',
  'message',
  'follow',
  'unfollow',
  'show-followers',
  'show-following',
])

const accentClass = computed(() => {
  if (props.isOwnProfile) return 'bg-brand'
  return props.profile.role === 'SELLER' ? 'bg-emerald-500' : 'bg-blue-500'
})

const formatNum = (n: number = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
</script>
