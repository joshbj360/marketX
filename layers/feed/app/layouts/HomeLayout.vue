<!-- layouts/default.vue (or your home layout file) -->
<template>
  <!-- ─── MOBILE HEADER — hidden on reels (full-screen), auto-hides on scroll elsewhere -->
  <div
    v-if="route.name !== 'reels'"
    class="fixed left-0 right-0 top-0 z-30 md:hidden transition-transform duration-300 ease-in-out"
    :class="mobileNavVisible ? 'translate-y-0' : '-translate-y-full'"
  >
    <HeaderNavMobile
      @open-notifications="showNotificationOverlay = true"
      @open-cart="showCart = true"
    />
  </div>

  <!-- ─── FEED / REELS TAB — chases header up, always stays visible ────────── -->
  <div
    v-if="showFeedReelsTabs"
    class="fixed left-0 right-0 z-[29] flex h-10 items-center justify-center border-b border-gray-200/60 bg-white/90 backdrop-blur-md md:hidden dark:border-neutral-800/60 dark:bg-neutral-900/90"
    :style="{
      top: mobileNavVisible
        ? 'calc(3.5rem + env(safe-area-inset-top, 0px))'
        : 'env(safe-area-inset-top, 0px)',
      transition: 'top 300ms ease-in-out',
    }"
  >
    <div
      class="flex overflow-hidden rounded-full border border-gray-200 dark:border-neutral-700"
    >
      <NuxtLink
        to="/"
        class="px-6 py-1 text-sm font-semibold transition-colors"
        :class="
          route.name === 'index'
            ? 'bg-brand/10 text-brand'
            : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100'
        "
      >
        Feed
      </NuxtLink>
      <NuxtLink
        to="/reels"
        class="px-6 py-1 text-sm font-semibold transition-colors"
        :class="
          route.name === 'reels'
            ? 'bg-brand/10 text-brand'
            : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100'
        "
      >
        Reels
      </NuxtLink>
    </div>
  </div>

  <div
    class="min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-neutral-100"
  >
    <!-- ─── DESKTOP LEFT SIDEBAR ─────────────────────────────────────────────── -->
    <aside
      class="scrollbar-hide fixed left-0 top-0 z-20 hidden h-full w-20 border-r border-gray-200 bg-white md:block xl:w-72 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <SideNav
        @create="showCreateModal = true"
        @open-notifications="showNotificationOverlay = true"
        @open-cart="showCart = true"
      />
    </aside>

    <!-- ─── MAIN CONTENT AREA ────────────────────────────────────────────────── -->
    <main class="md:ml-20 xl:ml-72">
      <div class="mx-auto flex max-w-[1500px]">
        <!-- Main feed / page content -->
        <div
          ref="mainScrollRef"
          class="main-scroll scrollbar-hide h-[100dvh] min-w-0 flex-1 overflow-y-auto px-2 py-6 transition-all duration-200 sm:px-4"
          :class="[
            mainContentClasses,
            hasScrolled
              ? 'shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.07)]'
              : '',
          ]"
          @scroll.passive="onMainScroll"
        >
          <div
            class="w-full pb-20 md:pb-0"
            :class="isNarrowFeed ? 'mx-auto max-w-[560px]' : ''"
          >
            <slot />
          </div>
        </div>

        <!-- ─── RIGHT SIDEBAR (Desktop) ──────────────────────────────────────── -->
        <aside
          v-if="showRightSidebar"
          class="scrollbar-hide hidden h-[100dvh] w-[420px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4 lg:block dark:border-neutral-800 dark:bg-neutral-900"
        >
          <slot name="right-sidebar">
            <RightSideNav @open-ai="showAI = true" />
          </slot>
        </aside>
      </div>
    </main>

    <!-- ─── MOBILE BOTTOM NAVIGATION ─────────────────────────────────────────── -->
    <BottomNavMobile
      class="fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out"
      :class="bottomNavVisible ? 'translate-y-0' : 'translate-y-full'"
      @create="showCreateModal = true"
    />

    <!-- ─── FLOATING ACTION BUTTONS & BANNERS ────────────────────────────────── -->
    <MobileAIChatButton
      :is-open="showAI"
      :banner-visible="
        !dismissSellerBanner &&
        profileStore.isLoggedIn &&
        !sellerStore.hasSellers
      "
      @open="showAI = true"
      @close="showAI = false"
    />

    <ClientOnly>
      <Transition name="seller-banner">
        <div
          v-if="
            !dismissSellerBanner &&
            profileStore.isLoggedIn &&
            !sellerStore.hasSellers
          "
          class="fixed bottom-16 left-0 right-0 z-20 px-3 pb-2 md:hidden"
        >
          <div
            class="flex items-center gap-2.5 rounded-2xl bg-brand px-3 py-2.5 shadow-xl shadow-brand/30"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20"
            >
              <Icon
                name="mdi:store-plus-outline"
                size="16"
                class="text-white"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[12px] font-bold leading-tight text-white">
                Start selling on {{ $config.public.siteName || 'styleX' }}
              </p>
              <p class="text-[10px] text-white/70">
                Turn your passion into profit
              </p>
            </div>
            <NuxtLink
              to="/sellers/create"
              class="shrink-0 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-[11px] font-bold text-brand shadow-sm transition-colors hover:bg-gray-50"
            >
              Start →
            </NuxtLink>
            <button
              class="shrink-0 p-1 text-white/60 hover:text-white"
              @click="dismissSellerBanner = true"
            >
              <Icon name="mdi:close" size="16" />
            </button>
          </div>
        </div>
      </Transition>
    </ClientOnly>

    <!-- ─── MODALS & OVERLAYS ────────────────────────────────────────────────── -->
    <CreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @open-post-modal="openPostUploader"
      @open-story-modal="openStoryUploader"
      @open-product-modal="openQuickProductUploader"
    />

    <PostUploadModal
      :is-open="showPostModal"
      @close="showPostModal = false"
      @posted="handlePost"
    />
    <StoryUploadModal
      :is-open="showStoryModal"
      @close="showStoryModal = false"
      @posted="handlePost"
    />
    <QuickProductModal
      :is-open="showQuickProductModal"
      @close="showQuickProductModal = false"
      @posted="handlePost"
    />

    <SearchOverlay
      :is-open="showSearchOverlay"
      @close="showSearchOverlay = false"
    />
    <NotificationOverlay
      :is-open="showNotificationOverlay"
      @close="showNotificationOverlay = false"
    />
    <CartSidebar :is-open="showCart" @close="showCart = false" />

    <ShareModal
      :is-open="shareState.isOpen"
      :url="shareState.url"
      :title="shareState.title"
      @close="closeShare"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  defineAsyncComponent
} from 'vue'
import { useRoute } from 'vue-router'

// ─── Always-visible layout components (eager) ───────────────────────────────
import BottomNavMobile from '~~/layers/core/app/layouts/children/BottomNavMobile.vue'
import SideNav from '~~/layers/core/app/layouts/children/SideNav.vue'
import HeaderNavMobile from '~~/layers/core/app/layouts/children/HeaderNavMobile.vue'
import RightSideNav from '~~/layers/core/app/layouts/children/RightSideNav.vue'

// ─── Modals & overlays (lazy — only loaded when opened) ─────────────────────
const CreateModal = defineAsyncComponent(
  () => import('~~/layers/core/app/components/modals/CreateModal.vue'),
)
const PostUploadModal = defineAsyncComponent(
  () => import('~~/layers/social/app/components/modals/PostUploadModal.vue'),
)
const StoryUploadModal = defineAsyncComponent(
  () => import('../components/modals/StoryUploadModal.vue'),
)
const QuickProductModal = defineAsyncComponent(
  () =>
    import('~~/layers/commerce/app/components/modals/QuickProductModal.vue'),
)
const SearchOverlay = defineAsyncComponent(
  () => import('~~/layers/core/app/components/search/SearchOverLay.vue'),
)
const NotificationOverlay = defineAsyncComponent(
  () => import('~~/layers/profile/app/components/NotificationOverlay.vue'),
)
const CartSidebar = defineAsyncComponent(
  () => import('~~/layers/commerce/app/components/CartSidebar.vue'),
)
const ShareModal = defineAsyncComponent(
  () => import('~~/layers/social/app/components/modals/ShareModal.vue'),
)
const MobileAIChatButton = defineAsyncComponent(
  () => import('~~/layers/ai/chat/MobileAIChat.vue'),
)

import { useLayoutData } from '~~/layers/core/app/composables/useLayoutData'
import { useNavVisibility } from '~~/layers/core/app/composables/useNavVisibility'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useShareModal } from '~~/layers/social/app/composables/useShareModal'

// ─── Stores & Composables ───────────────────────────────────────────────────
const route = useRoute()
const { shareState, closeShare } = useShareModal()
const profileStore = useProfileStore()
const sellerStore = useSellerStore()
const { refresh } = useLayoutData()

// ─── Props ──────────────────────────────────────────────────────────────────
const props = defineProps<{
  narrowFeed?: boolean
  hideRightSidebar?: boolean
  customPadding?: boolean
}>()

// ─── Layout Detection ───────────────────────────────────────────────────────
const isNarrowFeed = computed(() => {
  if (props.narrowFeed !== undefined) return props.narrowFeed
  return ['index', 'reels', 'profile-username', 'post-id'].includes(
    route.name as string,
  )
})

const showFeedReelsTabs = computed(() => route.name === 'index')

const showRightSidebar = computed(() => {
  if (props.hideRightSidebar) return false
  return true
})

const mainContentClasses = computed(() => {
  if (props.customPadding) return ''
  // header (3.5rem/56px) + feed/reels tab (2.5rem/40px) = 6rem on mobile
  if (showFeedReelsTabs.value) return 'pt-24 md:pt-6 lg:px-4'
  return 'pt-16 md:pt-6 lg:px-4'
})

// ─── Scroll / Nav-hide Behavior ─────────────────────────────────────────────
const mainScrollRef = ref<HTMLElement | null>(null)
const hasScrolled = ref(false)
const { mobileNavVisible } = useNavVisibility()
const _bottomNavVisible = ref(true)

// Always hide bottom nav on reels page (full-screen TikTok-style scroll)
const bottomNavVisible = computed(
  () => route.name !== 'reels' && _bottomNavVisible.value,
)

let pauseTimer: ReturnType<typeof setTimeout> | null = null
const AUTO_REVEAL_AFTER_PAUSE = 1500 // ms of stillness → bring navs back

const revealNav = () => {
  mobileNavVisible.value = true
  _bottomNavVisible.value = true
}
const hideNav = () => {
  mobileNavVisible.value = false
  _bottomNavVisible.value = false
}
const scheduleReveal = () => {
  if (pauseTimer) clearTimeout(pauseTimer)
  pauseTimer = setTimeout(revealNav, AUTO_REVEAL_AFTER_PAUSE)
}

// ── Desktop: inner-div scroll ────────────────────────────────────────────────
let lastDivScrollY = 0
const onMainScroll = () => {
  const el = mainScrollRef.value
  if (!el) return
  const y = el.scrollTop
  hasScrolled.value = y > 20
  const delta = y - lastDivScrollY
  lastDivScrollY = y
  if (Math.abs(delta) < 4) return
  delta > 0 && y > 60 ? hideNav() : revealNav()
  scheduleReveal()
}

// ── Desktop fallback: window scroll ─────────────────────────────────────────
let lastWinScrollY = 0
const onWindowScroll = () => {
  const y = window.scrollY
  hasScrolled.value = y > 20
  const delta = y - lastWinScrollY
  lastWinScrollY = y
  if (Math.abs(delta) < 4) return
  delta > 0 && y > 60 ? hideNav() : revealNav()
  scheduleReveal()
}

// ── Mobile: touch direction detection (most reliable on all mobile browsers) ─
let touchStartY = 0
const onTouchStart = (e: TouchEvent) => {
  touchStartY = e.touches[0].clientY
  if (pauseTimer) clearTimeout(pauseTimer)
}
const onTouchMove = (e: TouchEvent) => {
  const diff = touchStartY - e.touches[0].clientY // positive = scrolling down
  if (Math.abs(diff) < 15) return // ignore tiny movements
  diff > 0 ? hideNav() : revealNav()
}
const onTouchEnd = () => {
  scheduleReveal()
}

// ─── Modal Controls ─────────────────────────────────────────────────────────
const showCreateModal = ref(false)
const showPostModal = ref(false)
const showStoryModal = ref(false)
const showQuickProductModal = ref(false)
const showSearchOverlay = ref(false)
const showNotificationOverlay = ref(false)
const showAI = ref(false)
const showCart = ref(false)
const dismissSellerBanner = ref(false)

const openPostUploader = () => {
  showCreateModal.value = false
  showPostModal.value = true
}
const openStoryUploader = () => {
  showCreateModal.value = false
  showStoryModal.value = true
}
const openQuickProductUploader = () => {
  showCreateModal.value = false
  showQuickProductModal.value = true
}

const handlePost = async () => {
  showPostModal.value = false
  showStoryModal.value = false
  showQuickProductModal.value = false

  await Promise.all([
    refreshNuxtData('layout-data'),
    refreshNuxtData('homepage-main'),
    refreshNuxtData('profile-data'),
  ])
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Persist banner dismiss
  dismissSellerBanner.value =
    localStorage.getItem('dismissedSellerBanner') === 'true'

  // Window scroll — catches document-level scroll (desktop fallback)
  window.addEventListener('scroll', onWindowScroll, { passive: true })
  // Touch events — most reliable scroll detection on mobile browsers
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchmove', onTouchMove, { passive: true })
  document.addEventListener('touchend', onTouchEnd, { passive: true })

  // Periodic refresh (notifications, etc.)
  refreshInterval = setInterval(() => {
    refresh()
  }, 300000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onWindowScroll)
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
  if (refreshInterval) clearInterval(refreshInterval)
  if (pauseTimer) clearTimeout(pauseTimer)
})

watch(dismissSellerBanner, (val) => {
  if (val) localStorage.setItem('dismissedSellerBanner', 'true')
  else localStorage.removeItem('dismissedSellerBanner')
})
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Seller banner transition */
.seller-banner-enter-active,
.seller-banner-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.seller-banner-enter-from,
.seller-banner-leave-to {
  transform: translateY(120%);
  opacity: 0;
}

/* Safe area insets for mobile bottom only — top padding handled by Tailwind pt-16/pt-28 */
@media (max-width: 767px) {
  .main-scroll {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
