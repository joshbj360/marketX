<!-- ~~/layers/core/app/layouts/children/RightSideNav.vue -->
<template>
  <div
    class="flex h-full flex-col border-l border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- Tab Navigation -->
    <div
      class="flex shrink-0 gap-1 border-b border-gray-100 bg-gray-50/80 p-2 backdrop-blur-sm dark:border-neutral-800/50 dark:bg-neutral-900/70"
    >
      <button
        @click="activeTab = 'discover'"
        class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all"
        :class="
          activeTab === 'discover'
            ? 'border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
        "
      >
        <Icon name="mdi:compass-outline" size="18" />
        <span>Discover</span>
      </button>

      <button
        @click="activeTab = 'ai'"
        class="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-semibold transition-all"
        :class="
          activeTab === 'ai'
            ? 'border border-transparent bg-gradient-to-r from-brand to-purple-600 text-white shadow-md shadow-brand/20'
            : 'text-gray-500 hover:bg-gray-100 hover:text-brand dark:text-neutral-400 dark:hover:bg-neutral-800'
        "
      >
        <div
          v-if="activeTab === 'ai'"
          class="pointer-events-none absolute inset-0 bg-white/15 blur-sm"
        ></div>
        <Icon
          :name="
            activeTab === 'ai' ? 'mdi:robot-happy' : 'mdi:robot-happy-outline'
          "
          size="18"
          class="relative z-10"
        />
        <span class="relative z-10">MarketX AI</span>
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="custom-scrollbar flex-1 overflow-y-auto p-3">
      <!-- DISCOVER TAB -->
      <div v-show="activeTab === 'discover'" class="space-y-5 pb-6">
        <!-- Welcome / Personalized Card -->
        <ClientOnly>
          <div
            v-if="profileStore.isLoggedIn"
            class="rounded-2xl border border-brand/10 bg-gradient-to-br from-brand/5 via-purple-500/5 to-transparent p-4 shadow-sm dark:border-brand/20 dark:from-brand/10 dark:via-purple-500/10"
          >
            <div class="flex items-center gap-3">
              <Avatar
                :username="profileStore.me?.username || 'Shopper'"
                :avatar="profileStore.me?.avatar"
                size="md"
                class="ring-2 ring-white/80 dark:ring-neutral-900/80"
              />
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-base font-bold text-gray-900 dark:text-white"
                >
                  Hey {{ profileStore.me?.username || 'Shopper' }}! 👋
                </p>
                <p
                  class="mt-1 text-xs leading-relaxed text-gray-600 dark:text-neutral-400"
                >
                  <template v-if="!sellerStore.hasSellers">
                    Ready to shop or
                    <NuxtLink
                      to="/sellers/create"
                      class="font-medium text-gray-700 underline hover:text-gray-900 dark:text-neutral-300 dark:hover:text-white"
                      >open your store?</NuxtLink
                    >
                  </template>
                  <template v-else>
                    Check your store stats or list new products?
                  </template>
                </p>
              </div>
            </div>
          </div>
        </ClientOnly>

        <!-- Top Shops -->
        <div
          v-if="topSellers.length"
          class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon
                name="mdi:store-check-outline"
                size="20"
                class="text-gray-500 dark:text-neutral-400"
              />
              <h3 class="font-bold text-gray-900 dark:text-white">Top Shops</h3>
            </div>
            <NuxtLink
              to="/sellers"
              class="flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              See All <Icon name="mdi:chevron-right" size="14" />
            </NuxtLink>
          </div>

          <div class="space-y-2">
            <div
              v-for="seller in topSellers.slice(0, 5)"
              :key="seller.id"
              class="group flex items-center justify-between rounded-xl border border-transparent p-2.5 transition-all hover:border-gray-200 hover:bg-white hover:shadow dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60"
            >
              <NuxtLink
                :to="`/sellers/profile/${seller.store_slug}`"
                class="flex min-w-0 flex-1 items-center gap-3"
              >
                <div
                  class="relative transition-transform group-hover:scale-105"
                >
                  <StoreAvatar
                    :store-name="seller.store_name ?? ''"
                    :logo="seller.store_logo ?? ''"
                    size="lg"
                  />
                  <div
                    v-if="seller.is_verified"
                    class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white dark:ring-neutral-900"
                  >
                    <Icon name="mdi:check" size="10" class="text-white" />
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-brand dark:text-white"
                  >
                    {{ seller.store_name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-neutral-400">
                    {{ formatNumber(seller._count?.products || 0) }} items •
                    {{ formatNumber(getFollowerCount(seller)) }} followers
                  </p>
                </div>
              </NuxtLink>

              <ClientOnly>
                <button
                  v-if="profileStore.isLoggedIn"
                  @click.stop.prevent="toggleFollow(seller)"
                  class="ml-2 shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all"
                  :class="
                    followedIds.has(seller.id)
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                      : 'bg-brand text-white hover:bg-brand/90 hover:shadow-md hover:shadow-brand/20'
                  "
                >
                  {{ followedIds.has(seller.id) ? 'Following' : 'Follow' }}
                </button>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- Categories Grid -->
        <div
          v-if="categories.length"
          class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
        >
          <div class="mb-4 flex items-center gap-2">
            <Icon name="mdi:shape-outline" size="20" class="text-gray-500 dark:text-neutral-400" />
            <h3 class="font-bold text-gray-900 dark:text-white">Categories</h3>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <NuxtLink
              v-for="cat in categories.slice(0, 6)"
              :key="cat.id"
              :to="`/category/${cat.slug}`"
              class="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-brand/30 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
            >
              <div
                class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gray-50 transition-transform group-hover:scale-110 dark:bg-neutral-800"
              >
                <img
                  v-if="cat.thumbnailCatUrl"
                  :src="cat.thumbnailCatUrl"
                  :alt="cat.name"
                  class="h-full w-full object-cover"
                />
                <Icon
                  v-else
                  name="mdi:hanger"
                  size="24"
                  class="text-gray-400 dark:text-gray-500"
                />
              </div>
              <span
                class="line-clamp-1 text-center text-xs font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >
                {{ cat.name }}
              </span>
            </NuxtLink>
          </div>

          <NuxtLink
            to="/discover"
            class="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:shadow dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            View All Categories <Icon name="mdi:arrow-right" size="14" />
          </NuxtLink>
        </div>

        <!-- Quick Links -->
        <div
          class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
        >
          <div class="mb-3 flex items-center gap-2">
            <Icon name="mdi:link-variant" size="20" class="text-gray-500 dark:text-neutral-400" />
            <h3 class="font-bold text-gray-900 dark:text-white">Quick Links</h3>
          </div>
          <div class="space-y-2">
            <NuxtLink to="/map" class="quick-link group">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <Icon name="mdi:map-marker-radius-outline" size="18" />
              </div>
              <span
                class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
                >Near Me</span
              >
            </NuxtLink>
            <NuxtLink to="/discover?tab=fresh" class="quick-link group">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <Icon name="mdi:lightning-bolt-outline" size="18" />
              </div>
              <span class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300">Fresh Drops</span>
            </NuxtLink>
            <NuxtLink to="/discover?tab=deals" class="quick-link group">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <Icon name="mdi:tag-outline" size="18" />
              </div>
              <span class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300">Deals</span>
            </NuxtLink>
            <NuxtLink to="/reels" class="quick-link group">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <Icon name="mdi:play-box-multiple-outline" size="18" />
              </div>
              <span class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300">Reels</span>
            </NuxtLink>
            <NuxtLink to="/discover?tab=preloved" class="quick-link group">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <Icon name="mdi:heart-circle-outline" size="18" />
              </div>
              <span class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300">Pre-loved</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-2 py-5 text-center">
          <div
            class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium text-gray-400 dark:text-neutral-500"
          >
            <NuxtLink
              to="/about"
              class="hover:text-gray-700 dark:hover:text-neutral-300"
              >About</NuxtLink
            >
            <NuxtLink
              to="/help"
              class="hover:text-gray-700 dark:hover:text-neutral-300"
              >Help</NuxtLink
            >
            <NuxtLink
              to="/terms"
              class="hover:text-gray-700 dark:hover:text-neutral-300"
              >Terms</NuxtLink
            >
            <NuxtLink
              to="/privacy"
              class="hover:text-gray-700 dark:hover:text-neutral-300"
              >Privacy</NuxtLink
            >
          </div>
          <p class="mt-3 text-xs text-gray-400 dark:text-neutral-600">
            © {{ new Date().getFullYear() }}
            {{ $config.public.siteName || 'MarketX' }}. All rights reserved.
          </p>
        </div>
      </div>

      <!-- AI TAB -->
      <div v-show="activeTab === 'ai'" class="flex h-full flex-col items-center justify-center px-4 pb-6 pt-8">
        <div class="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 via-purple-500/10 to-transparent p-8 text-center shadow-sm dark:border-brand/30 dark:from-brand/15 dark:via-purple-500/15">
          <div class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />
          <div class="relative z-10 flex flex-col items-center">
            <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-purple-600 shadow-xl shadow-brand/30">
              <Icon name="mdi:robot-happy" size="40" class="text-white" />
            </div>
            <h3 class="mb-2 text-xl font-extrabold text-gray-900 dark:text-white">
              Dasah
            </h3>
            <p class="mb-6 max-w-[220px] text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
              Your Dasah AI shopping assistant — search smarter, discover faster.
            </p>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand dark:border-brand/40 dark:bg-brand/20">
              <Icon name="mdi:clock-fast" size="14" />
              Launching soon
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useLayoutData } from '~~/layers/core/app/composables/useLayoutData'
import { useSocialApi } from '~~/layers/profile/app/services/social.api'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'
import StoreAvatar from '~~/layers/profile/app/components/StoreAvatar.vue'
import type { Seller } from '~~/shared/types/seller'

const profileStore = useProfileStore()
const sellerStore = useSellerStore()
const { data } = useLayoutData()

const activeTab = ref<'discover' | 'ai'>('discover')

const topSellers = computed(() => data.value?.topSellers ?? [])
const categories = computed(() => data.value?.categories ?? [])

const socialApi = useSocialApi()

const followedIds = ref(new Set<string>())
const followerCountOverrides = ref(new Map<string, number>())

onMounted(async () => {
  if (!profileStore.isLoggedIn) return
  try {
    const res = await socialApi.getFollowedSellerIds()
    followedIds.value = new Set(res.data ?? [])
  } catch {}
})

const getFollowerCount = (seller: Seller) => {
  return followerCountOverrides.value.get(seller.id) ?? seller.followers_count ?? 0
}

const toggleFollow = async (seller: Seller) => {
  const id = seller.id
  const slug = seller.store_slug
  const wasFollowing = followedIds.value.has(id)
  const current = getFollowerCount(seller)

  // Optimistic update
  if (wasFollowing) {
    followedIds.value.delete(id)
    followerCountOverrides.value.set(id, Math.max(0, current - 1))
  } else {
    followedIds.value.add(id)
    followerCountOverrides.value.set(id, current + 1)
  }

  try {
    if (wasFollowing) {
      await socialApi.unfollowSeller(slug)
    } else {
      await socialApi.followSeller(slug)
    }
  } catch {
    // Rollback on error
    if (wasFollowing) {
      followedIds.value.add(id)
      followerCountOverrides.value.set(id, current)
    } else {
      followedIds.value.delete(id)
      followerCountOverrides.value.set(id, current)
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
  @apply -mx-2 flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60;
}

/* Custom thin scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.dark .custom-scrollbar {
  scrollbar-color: #4b5563 transparent;
}
</style>
