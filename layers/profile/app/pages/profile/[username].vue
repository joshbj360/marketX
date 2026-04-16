<template>
  <HomeLayout>
    <template #right-sidebar>
      <RightSideNavProfile />
    </template>

    <div class="mx-auto max-w-5xl space-y-4 pb-20">
      <!-- Loading -->
      <div
        v-if="isLoading && !profile"
        class="flex flex-col items-center justify-center gap-3 py-24"
      >
        <Icon
          name="eos-icons:loading"
          size="40"
          class="animate-spin text-brand"
        />
        <span class="text-sm text-gray-400 dark:text-neutral-500"
          >Loading profile…</span
        >
      </div>

      <!-- Error -->
      <div
        v-else-if="error && !profile"
        class="flex flex-col items-center justify-center gap-4 py-24"
      >
        <Icon name="mdi:alert-circle-outline" size="48" class="text-red-400" />
        <p class="font-medium text-gray-700 dark:text-neutral-300">
          {{ error }}
        </p>
        <button
          @click="retryFetch"
          class="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d81b36]"
        >
          Try Again
        </button>
      </div>

      <!-- Profile Content -->
      <template v-else-if="profile">
        <ProfileHeader
          :profile="profile"
          :stats="stats"
          :is-own-profile="isOwnProfile"
          :is-following="isFollowing"
          :is-follow-loading="isFollowLoading"
          @edit="showEditModal = true"
          @message="startConversation"
          @follow="handleFollow"
          @unfollow="handleUnfollow"
          @settings="goToSettings"
          @show-followers="showFollowersModal = true"
          @show-following="showFollowingModal = true"
        />

        <!-- Become a Seller banner — mobile only, own profile, not yet a seller -->
        <NuxtLink
          v-if="isOwnProfile && !sellerStore.hasSellers"
          to="/sellers/create"
          class="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand to-pink-500 px-4 py-3.5 shadow-md shadow-brand/20 md:hidden"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Icon name="mdi:store-plus-outline" size="22" class="text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-white">Start selling on MarketX</p>
            <p class="text-[11px] text-white/80">Turn your passion into income →</p>
          </div>
          <Icon name="mdi:chevron-right" size="20" class="shrink-0 text-white/70" />
        </NuxtLink>

        <!-- Tab strip -->
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="scrollbar-hide flex overflow-x-auto border-b border-gray-200 dark:border-neutral-800"
          >
            <button
              v-for="tab in availableTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[12px] font-semibold transition-colors sm:px-5 sm:py-3.5 sm:text-[13px]"
              :class="
                activeTab === tab.id
                  ? 'text-gray-900 dark:text-neutral-100'
                  : 'text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300'
              "
            >
              <Icon :name="tab.icon" size="16" />
              {{ tab.label }}
              <span
                v-if="tab.badge && tab.badge > 0"
                class="rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none text-white"
                >{{ tab.badge }}</span
              >
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-brand"
              />
            </button>
          </div>

          <!-- Tab content -->
          <div class="min-h-[300px]">
            <PostsTab
              v-if="activeTab === 'posts'"
              :username="username"
              :is-own-profile="isOwnProfile"
            />
            <LikesTab v-else-if="activeTab === 'likes'" :username="username" />
            <SavedTab v-else-if="activeTab === 'saved' && isOwnProfile" />
            <OrdersTab v-else-if="activeTab === 'orders' && isOwnProfile" />
            <WalletTab v-else-if="activeTab === 'wallet' && isOwnProfile" />
            <AffiliateTab
              v-else-if="activeTab === 'affiliate' && isOwnProfile"
            />
            <TaggedTab
              v-else-if="activeTab === 'tagged'"
              :username="username"
            />
            <StoresTab v-else-if="activeTab === 'stores' && isOwnProfile" />
            <MediaTab v-else-if="activeTab === 'media' && isOwnProfile" />
            <AboutTab v-else-if="activeTab === 'about'" :profile="profile" />
          </div>
        </div>
      </template>
    </div>

    <!-- Modals -->
    <EditProfileModal
      v-if="showEditModal"
      :profile="profile!"
      @close="showEditModal = false"
      @updated="handleProfileUpdated"
    />
    <FollowListModal
      v-if="showFollowersModal"
      type="followers"
      :username="username"
      @close="showFollowersModal = false"
    />
    <FollowListModal
      v-if="showFollowingModal"
      type="following"
      :username="username"
      @close="showFollowingModal = false"
    />
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '../../stores/profile.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'

import { useProfile } from '../../composables/useProfile'
import { useFollow } from '../../composables/useFollow'
import type { IProfile } from '../../types/profile.types'

// Components
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import RightSideNavProfile from '~~/layers/core/app/layouts/children/RightSideNavProfile.vue'
import ProfileHeader from '../../components/profile/ProfileHeader.vue'
import PostsTab from '../../components/profile/tabs/PostTab.vue'
import LikesTab from '../../components/profile/tabs/LikesTab.vue'
import SavedTab from '../../components/profile/tabs/SavedTab.vue'
import OrdersTab from '../../components/profile/tabs/OrdersTab.vue'
import WalletTab from '../../components/profile/tabs/WalletTab.vue'
import AffiliateTab from '../../components/profile/tabs/AffiliateTab.vue'
import TaggedTab from '../../components/profile/tabs/TaggedTab.vue'
import AboutTab from '../../components/profile/tabs/AboutTab.vue'
import EditProfileModal from '../../components/profile/modals/EditProfileModal.vue'
import FollowListModal from '../../components/profile/modals/FollowListModal.vue'
import StoresTab from '../../components/profile/tabs/StoresTab.vue'
import MediaTab from '../../components/profile/tabs/MediaTab.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const sellerStore = useSellerStore()

const { fetchPublicProfile, fetchUserStats, isLoading, error } = useProfile()
const { followUser, unfollowUser, checkIfFollowing } = useFollow()

// ── State ──────────────────────────────────────────────────────────────────────
const username = computed(() => route.params.username as string)
const activeTab = ref('posts')
const showEditModal = ref(false)
const showFollowersModal = ref(false)
const showFollowingModal = ref(false)
const isFollowing = ref(false)
const isFollowLoading = ref(false)

// ── Reactive profile & stats ───────────────────────────────────────────────────
const isOwnProfile = computed(
  () =>
    !!profileStore.me?.username && profileStore.me.username === username.value,
)

const profile = computed<IProfile | undefined>(() => {
  if (isOwnProfile.value) return profileStore.me ?? undefined
  return profileStore.publicProfiles.get(username.value) as IProfile | undefined
})

// stats MUST be reactive — getProfileStats(username) can change when username changes
const stats = computed(() => profileStore.getProfileStats(username.value))

// ── Tab config ─────────────────────────────────────────────────────────────────
const availableTabs = computed(() => {
  type Tab = { id: string; label: string; icon: string; badge?: number }
  const publicTabs: Tab[] = [
    { id: 'posts', label: 'Posts', icon: 'mdi:grid' },
    { id: 'tagged', label: 'Tagged', icon: 'mdi:account-tag' },
    { id: 'about', label: 'About', icon: 'mdi:information-outline' },
  ]

  if (isOwnProfile.value) {
    const tabs: Tab[] = [
      { id: 'posts', label: 'Posts', icon: 'mdi:grid' },
      { id: 'likes', label: 'Liked', icon: 'mdi:heart-outline' },
      { id: 'saved', label: 'Saved', icon: 'mdi:bookmark-outline' },
      { id: 'orders', label: 'Orders', icon: 'mdi:package-variant', badge: 0 },
      { id: 'wallet', label: 'Wallet', icon: 'mdi:wallet-outline' },
      { id: 'affiliate', label: 'Affiliate', icon: 'mdi:cash-multiple' },
      { id: 'media', label: 'Media', icon: 'mdi:image-multiple-outline' },
      { id: 'about', label: 'About', icon: 'mdi:information-outline' },
    ]
    if (sellerStore.hasSellers) {
      tabs.splice(3, 0, {
        id: 'stores',
        label: 'My Stores',
        icon: 'mdi:store-outline',
      })
    }
    return tabs
  }
  return publicTabs
})

// ── Data fetching ──────────────────────────────────────────────────────────────
const loadProfile = async (uname: string) => {
  if (!uname) return

  if (profileStore.me?.username === uname) {
    // Own profile — data already in store from auth-init, just ensure stats are fresh
    if (!profileStore.getProfileStats(uname).postsCount && profileStore.me) {
      await fetchUserStats(uname).catch(() => {})
    }
    isFollowing.value = false
  } else {
    await fetchPublicProfile(uname)
    // Fetch stats separately if not bundled in profile response
    const existingStats = profileStore.getProfileStats(uname)
    if (!existingStats.postsCount) {
      await fetchUserStats(uname).catch(() => {})
    }
    // Check follow status (guest → always false)
    if (profileStore.me) {
      isFollowing.value = await checkIfFollowing(uname)
    }
  }
}

// ── Actions ────────────────────────────────────────────────────────────────────
const handleFollow = async () => {
  isFollowLoading.value = true
  try {
    await followUser(username.value)
    isFollowing.value = true
  } catch {
    /* followUser notifies on error */
  } finally {
    isFollowLoading.value = false
  }
}

const handleUnfollow = async () => {
  isFollowLoading.value = true
  try {
    await unfollowUser(username.value)
    isFollowing.value = false
  } catch {
    /* unfollowUser notifies on error */
  } finally {
    isFollowLoading.value = false
  }
}

const retryFetch = () => loadProfile(username.value)

const startConversation = () => {
  if (profile.value) router.push(`/messages/new?user=${profile.value.id}`)
}

const goToSettings = () => router.push('/settings')

const handleProfileUpdated = () => {
  showEditModal.value = false
  retryFetch()
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
// Watch handles navigation between profiles (e.g. clicking a different username)
// Initial load is handled by onMounted (client-only, avoids SSR server-to-server HTTP hang)
watch(username, (u) => loadProfile(u))

onMounted(async () => {
  // Initial load (watch handles subsequent username changes)
  await loadProfile(username.value)

  const tabFromQuery = route.query.tab as string
  if (tabFromQuery && availableTabs.value.some((t) => t.id === tabFromQuery)) {
    activeTab.value = tabFromQuery
  }
})

watch(activeTab, (tab) => {
  router.replace({ query: { ...route.query, tab } })
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
