<template>
  <div
    class="flex h-full flex-col border-l border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- ─── TAB NAVIGATION ──────────────────────────────────────────────────── -->
    <div
      class="flex shrink-0 gap-1 border-b border-gray-100 bg-gray-50/50 p-2 dark:border-neutral-800/50 dark:bg-neutral-900/50"
    >
      <!-- 1. Welcome Card (If logged in) -->
      <ClientOnly>
        <div
          v-if="profileStore.isLoggedIn"
          class="w-full rounded-xl border border-brand/10 bg-gradient-to-br from-brand/5 to-purple-500/5 p-4 shadow-sm dark:from-brand/10 dark:to-purple-500/10"
        >
          <div class="flex items-center gap-3">
            <div class="relative flex shrink-0">
              <Avatar
                :username="profileStore.me?.username || 'Shopper'"
                :avatar="profileStore.me?.avatar ?? undefined"
                size="md"
              />
              <!-- Optional Verified Badge for Current User -->
              <div
                v-if="profileStore.me?.email_verified"
                class="absolute -bottom-0.5 -right-0.5 z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-blue-500 dark:border-neutral-900"
              >
                <Icon name="mdi:check-decagram" size="12" class="text-white" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-bold text-gray-900 dark:text-neutral-100"
              >
                Hey, {{ profileStore.me?.username || 'Shopper' }}! 👋
              </p>
              <p class="mt-0.5 text-xs text-gray-600 dark:text-neutral-400">
                <template v-if="!sellerStore.hasSellers">
                  Ready to shop or
                  <NuxtLink
                    to="/sellers/create"
                    class="font-medium text-brand hover:underline"
                    >open a store?</NuxtLink
                  >
                </template>
                <template v-else> Ready to manage your store? </template>
              </p>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>

    <!-- ─── SCROLLABLE CONTENT AREA ─────────────────────────────────────────── -->
    <div class="custom-scrollbar flex-1 overflow-y-auto p-3">
      <!-- 2. Top Shops Section -->
      <div
        v-if="topSellers.length"
        class="mb-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="mdi:store-check-outline" size="20" class="text-brand" />
            <h3 class="font-bold text-gray-900 dark:text-neutral-100">
              Top Shops
            </h3>
          </div>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="seller in topSellers.slice(0, 5)"
            :key="seller.id"
            class="group -mx-2.5 flex items-center justify-between rounded-lg border border-transparent p-2.5 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <NuxtLink
              :to="`/sellers/profile/${seller.store_slug}`"
              class="flex min-w-0 flex-1 items-center space-x-3"
            >
              <!-- Avatar Wrapper with Fixed Dimensions -->
              <div class="relative flex shrink-0 items-center justify-center">
                <img
                  :src="
                    seller.store_logo ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${seller.store_name}`
                  "
                  :alt="seller.store_name"
                  class="h-10 w-10 shrink-0 rounded-full border border-gray-200 bg-white object-cover transition-all group-hover:border-brand/30 dark:border-neutral-700 dark:bg-neutral-900"
                />

                <!-- Bulletproof Verified Badge -->
                <div
                  v-if="seller.is_verified"
                  class="absolute -bottom-0.5 -right-0.5 z-10 flex h-[10px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-white bg-blue-500 dark:border-neutral-900"
                >
                  <Icon
                    name="mdi:check-decagram"
                    size="10"
                    class="text-white"
                  />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-brand dark:text-neutral-100"
                >
                  {{ seller.store_name }}
                </p>
                <div
                  class="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-neutral-400"
                >
                  <span>{{ seller._count?.products || 0 }} items</span>
                  <span>•</span>
                  <span
                    >{{
                      formatNumber(seller.followers_count || 0)
                    }}
                    followers</span
                  >
                </div>
              </div>
            </NuxtLink>

            <!-- Follow button -->
            <ClientOnly>
              <button
                v-if="profileStore.isLoggedIn"
                @click.stop.prevent="toggleFollow(seller)"
                class="ml-2 shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all"
                :class="
                  followedIds.has(seller.id)
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                    : 'bg-brand text-white hover:bg-brand/90 hover:shadow-sm hover:shadow-brand/20'
                "
              >
                {{ followedIds.has(seller.id) ? 'Following' : 'Follow' }}
              </button>
            </ClientOnly>
          </div>
        </div>
      </div>

      <!-- 4. Quick Links -->
      <div
        class="mb-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30"
      >
        <div class="mb-3 flex items-center gap-2">
          <Icon name="mdi:link-variant" size="20" class="text-brand" />
          <h3 class="font-bold text-gray-900 dark:text-neutral-100">
            Quick Links
          </h3>
        </div>
        <div class="space-y-1.5">
          <NuxtLink to="/discover" class="quick-link group">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:compass-outline" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Discover</span
            >
          </NuxtLink>
          <NuxtLink to="/thrift" class="quick-link group">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:recycle" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Thrift Store</span
            >
          </NuxtLink>
          <NuxtLink to="/discover" class="quick-link group">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:fire" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Trending Now</span
            >
          </NuxtLink>
        </div>
      </div>

      <!-- 5. Footer Links -->
      <div class="px-2 py-4">
        <div
          class="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-400 dark:text-neutral-500"
        >
          <NuxtLink
            to="/about"
            class="transition-colors hover:text-gray-800 dark:hover:text-gray-300"
            >About
          </NuxtLink>
          <NuxtLink
            to="/help"
            class="transition-colors hover:text-gray-800 dark:hover:text-gray-300"
            >Help Center
          </NuxtLink>
          <NuxtLink
            to="/terms"
            class="transition-colors hover:text-gray-800 dark:hover:text-gray-300"
            >Terms
          </NuxtLink>
          <NuxtLink
            to="/privacy"
            class="transition-colors hover:text-gray-800 dark:hover:text-gray-300"
          >
            Privacy
          </NuxtLink>
        </div>
        <div
          class="flex items-center justify-center text-center text-[11px] font-medium text-gray-400 dark:text-neutral-600"
        >
          <p>
            © {{ new Date().getFullYear() }}
            {{ useRuntimeConfig().public.siteName || 'MarketX' }}. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useLayoutData } from '~~/layers/core/app/composables/useLayoutData'
import { useSocialApi } from '~~/layers/profile/app/services/social.api'
import type { Seller } from '~~/shared/types/seller'

import Avatar from '~~/layers/profile/app/components/Avatar.vue'

const profileStore = useProfileStore()
const sellerStore = useSellerStore()
const { data } = useLayoutData()
const socialApi = useSocialApi()

const topSellers = computed(() => data.value?.topSellers ?? [])

// Optimistic follow tracking
const followedIds = ref(new Set<string>())

const toggleFollow = async (seller: Seller) => {
  const id = seller.id
  const slug = seller.store_slug
  const isFollowing = followedIds.value.has(id)

  // Optimistic UI Update
  if (isFollowing) {
    followedIds.value.delete(id)
    seller.followers_count = Math.max(0, (seller.followers_count || 1) - 1)
    try {
      await socialApi.unfollowSeller(slug)
    } catch {
      followedIds.value.add(id)
      seller.followers_count++
    }
  } else {
    followedIds.value.add(id)
    seller.followers_count = (seller.followers_count || 0) + 1
    try {
      await socialApi.followSeller(slug)
    } catch {
      followedIds.value.delete(id)
      seller.followers_count--
    }
  }
}

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
</script>

<style scoped>
.quick-link {
  @apply -mx-2 flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-neutral-700 dark:hover:bg-neutral-800;
}

/* Custom Scrollbar Styling */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

/* Dark mode scrollbar */
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #404040;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #525252;
}

/* Firefox scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

:global(.dark) .custom-scrollbar {
  scrollbar-color: #404040 transparent;
}
</style>
