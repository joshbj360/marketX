<template>
  <div
    class="flex h-full flex-col border-l border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- ─── SCROLLABLE CONTENT ─────────────────────────────────────────────── -->
    <div class="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-4">
      <!-- Profile's Store Card -->
      <ClientOnly>
        <template v-if="profileStore.isLoggedIn">
          <!-- Viewing own profile -->
          <div
            v-if="isOwnProfile && sellerStore.hasSellers"
            class="group relative overflow-hidden rounded-2xl border border-brand/10 bg-gradient-to-br from-brand/5 to-purple-500/5 p-5 shadow-sm dark:from-brand/10 dark:to-purple-500/10"
          >
            <div
              class="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-brand/10 blur-xl"
            ></div>
            <p
              class="relative z-10 mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
            >
              Your Store
            </p>
            <p
              class="relative z-10 truncate text-base font-bold text-gray-900 dark:text-white"
            >
              {{ sellerStore.sellers[0]?.store_name }}
            </p>
            <div class="relative z-10 mt-3 flex gap-2">
              <NuxtLink
                :to="`/seller/${sellerStore.sellers[0]?.store_slug}/dashboard`"
                class="flex-1 rounded-lg bg-brand py-2 text-center text-[12px] font-bold text-white transition-all hover:bg-brand/90"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                :to="`/sellers/profile/${sellerStore.sellers[0]?.store_slug}`"
                class="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-center text-[12px] font-semibold text-gray-700 transition-all hover:border-brand/30 hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              >
                View Shop
              </NuxtLink>
            </div>
          </div>

          <!-- Viewing own profile, no store yet -->
          <div
            v-else-if="isOwnProfile && !sellerStore.hasSellers"
            class="rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-5 text-center dark:bg-brand/10"
          >
            <Icon
              name="mdi:store-plus-outline"
              size="28"
              class="mx-auto mb-2 text-brand"
            />
            <p class="mb-1 text-[13px] font-bold text-gray-900 dark:text-white">
              Start selling today
            </p>
            <p class="mb-3 text-[11px] text-gray-500 dark:text-neutral-400">
              Turn your passion into a business
            </p>
            <NuxtLink
              to="/sellers/create"
              class="block w-full rounded-xl bg-brand py-2.5 text-[12px] font-bold text-white transition-all hover:bg-brand/90"
            >
              Open a Store →
            </NuxtLink>
          </div>

          <!-- Viewing someone else's profile who has a store -->
          <div
            v-else-if="!isOwnProfile && viewedProfileStore"
            class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
          >
            <div class="flex items-center gap-3">
              <img
                :src="
                  viewedProfileStore.store_logo ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${viewedProfileStore.store_name}`
                "
                :alt="viewedProfileStore.store_name"
                class="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-sm dark:border-neutral-900"
              />
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-[13px] font-bold text-gray-900 dark:text-white"
                >
                  {{ viewedProfileStore.store_name }}
                </p>
                <p class="text-[11px] text-gray-500 dark:text-neutral-400">
                  {{ viewedProfileStore._count?.products ?? 0 }} products
                </p>
              </div>
            </div>
            <NuxtLink
              :to="`/sellers/profile/${viewedProfileStore.store_slug}`"
              class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2.5 text-[12px] font-bold text-white transition-all hover:scale-[1.02] dark:bg-white dark:text-gray-900"
            >
              <Icon name="mdi:storefront-outline" size="15" />
              Shop Now
            </NuxtLink>
          </div>
        </template>
      </ClientOnly>

      <!-- Top Shops -->
      <div
        v-if="topSellers.length"
        class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
      >
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="mdi:store-check-outline" size="18" class="text-brand" />
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
              Top Shops
            </h3>
          </div>
          <NuxtLink
            to="/sellers"
            class="text-[11px] font-bold text-brand transition-colors hover:text-brand/80"
          >
            See All →
          </NuxtLink>
        </div>

        <div class="space-y-1.5">
          <NuxtLink
            v-for="seller in topSellers.slice(0, 5)"
            :key="seller.id"
            :to="`/sellers/profile/${seller.store_slug}`"
            class="group -mx-2 flex items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60"
          >
            <img
              :src="
                seller.store_logo ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${seller.store_name}`
              "
              :alt="seller.store_name"
              class="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover dark:border-neutral-700"
            />
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-[12px] font-semibold text-gray-900 transition-colors group-hover:text-brand dark:text-white"
              >
                {{ seller.store_name }}
              </p>
              <p class="text-[10px] text-gray-500 dark:text-neutral-400">
                {{ seller._count?.products ?? 0 }} items
              </p>
            </div>
            <Icon
              name="mdi:chevron-right"
              size="16"
              class="shrink-0 text-gray-400 transition-colors group-hover:text-brand"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Links -->
      <div
        class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
      >
        <div class="mb-3 flex items-center gap-2">
          <Icon name="mdi:compass-outline" size="18" class="text-brand" />
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">
            Explore
          </h3>
        </div>
        <div class="space-y-1.5">
          <NuxtLink to="/" class="quick-link group">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:home-outline" size="16" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Feed</span
            >
          </NuxtLink>
          <NuxtLink to="/discover" class="quick-link group">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:compass-outline" size="16" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Discover</span
            >
          </NuxtLink>
          <NuxtLink to="/buyer/orders" class="quick-link group">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:shopping-outline" size="16" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >My Orders</span
            >
          </NuxtLink>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-2 py-3 text-center">
        <div
          class="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-gray-400 dark:text-neutral-500"
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
        <p class="mt-2 text-[11px] text-gray-400 dark:text-neutral-600">
          © {{ new Date().getFullYear() }}
          {{ $config.public.siteName || 'MarketX' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useLayoutData } from '~~/layers/core/app/composables/useLayoutData'
import { useProfileApi } from '~~/layers/profile/app/services/profile.api'

const route = useRoute()
const profileStore = useProfileStore()
const sellerStore = useSellerStore()
const { data } = useLayoutData()
const profileApi = useProfileApi()

const topSellers = computed(() => data.value?.topSellers ?? [])

const viewedUsername = computed(
  () => route.params.username as string | undefined,
)
const isOwnProfile = computed(
  () =>
    !!viewedUsername.value &&
    profileStore.me?.username?.toLowerCase() ===
      viewedUsername.value.toLowerCase(),
)

const viewedProfileStore = ref<any>(null)

onMounted(async () => {
  if (!viewedUsername.value || isOwnProfile.value) return
  try {
    const profile = await profileApi.getPublicProfile(viewedUsername.value)
    // sellers is an array on the public profile response
    viewedProfileStore.value = (profile as any)?.sellerProfile ?? null
  } catch {
    // non-critical
  }
})
</script>

<style scoped>
.quick-link {
  @apply -mx-2 flex items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60;
}
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
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #404040;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #525252;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
:global(.dark) .custom-scrollbar {
  scrollbar-color: #404040 transparent;
}
</style>
