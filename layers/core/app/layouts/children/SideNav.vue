<!-- ~~/layers/core/app/layouts/children/SideNav.vue -->
<template>
  <div class="flex h-full flex-col p-3 xl:p-4">
    <!-- Logo -->
    <NuxtLink
      to="/"
      class="mb-6 flex items-center justify-center gap-2.5 xl:justify-start"
    >
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand shadow-lg shadow-brand/25"
      >
        <span class="text-sm font-black italic text-white">MX</span>
      </div>
      <span
        class="hidden text-xl font-black tracking-tight text-gray-900 xl:inline dark:text-white"
      >
        {{ $config.public.siteName || 'MarketX' }}
      </span>
    </NuxtLink>

    <!-- Primary Navigation -->
    <nav class="flex flex-col space-y-1">
      <NuxtLink to="/" class="nav-button group" :class="{ active: isHome }">
        <Icon :name="isHome ? 'mdi:home' : 'mdi:home-outline'" size="24" />
        <span class="nav-text">Home</span>
      </NuxtLink>

      <NuxtLink to="/discover" class="nav-button group" active-class="active">
        <Icon
          :name="isDiscover ? 'mdi:compass' : 'mdi:compass-outline'"
          size="24"
        />
        <span class="nav-text">Discover</span>
      </NuxtLink>

      <NuxtLink to="/reels" class="nav-button group" active-class="active">
        <Icon name="mdi:play-box-multiple-outline" size="24" />
        <span class="nav-text">Reels</span>
      </NuxtLink>

      <NuxtLink to="/map" class="nav-button group" active-class="active">
        <Icon name="mdi:map-marker-radius-outline" size="24" />
        <span class="nav-text">Near Me</span>
      </NuxtLink>
    </nav>

    <!-- Divider -->
    <div class="mx-2 my-3 h-px bg-gray-100 dark:bg-neutral-800" />

    <!-- User actions (logged-in only) -->
    <nav class="flex flex-col space-y-1">
      <!-- Sell / Create -->
      <ClientOnly>
        <button
          v-if="profileStore.isLoggedIn"
          class="sell-button group"
          @click="$emit('create')"
        >
          <Icon name="mdi:plus-circle-outline" size="24" />
          <span class="nav-text">create</span>
        </button>
        <NuxtLink v-else to="/user-register" class="sell-button group">
          <Icon name="mdi:plus-circle-outline" size="24" />
          <span class="nav-text">create post</span>
        </NuxtLink>
      </ClientOnly>

      <!-- Notifications -->
      <ClientOnly>
        <button
          v-if="profileStore.isLoggedIn"
          class="nav-button group relative"
          @click="$emit('open-notifications')"
        >
          <div class="relative">
            <Icon name="mdi:bell-outline" size="24" />
            <span
              v-if="unreadCount > 0"
              class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white"
              >{{ unreadCount > 99 ? '99+' : unreadCount }}</span
            >
          </div>
          <span class="nav-text">Notifications</span>
        </button>
      </ClientOnly>

      <!-- Inbox / Messages -->
      <ClientOnly>
        <NuxtLink
          v-if="profileStore.isLoggedIn"
          to="/messages"
          class="nav-button group relative"
          active-class="active"
        >
          <div class="relative">
            <Icon name="mdi:message-outline" size="24" />
            <span
              v-if="messageCount > 0"
              class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white"
              >{{ messageCount > 99 ? '99+' : messageCount }}</span
            >
          </div>
          <span class="nav-text">Inbox</span>
        </NuxtLink>
      </ClientOnly>

      <!-- Cart -->
      <button class="nav-button group relative" @click="$emit('open-cart')">
        <div class="relative">
          <Icon name="mdi:cart-outline" size="24" />
          <span
            v-if="cartCount > 0"
            class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white"
            >{{ cartCount > 99 ? '99+' : cartCount }}</span
          >
        </div>
        <span class="nav-text">{{ $t('nav.cart') }}</span>
      </button>
    </nav>

    <!-- Bottom: Profile section -->
    <div class="relative mt-auto pb-2">
      <ClientOnly>
        <button
          v-if="profileStore.isLoggedIn"
          class="nav-button group w-full justify-between"
          :class="{ 'bg-gray-100 dark:bg-neutral-800': menuOpen }"
          @click="menuOpen = !menuOpen"
        >
          <div class="flex items-center gap-3">
            <Avatar
              :username="profileStore.me?.username || 'User'"
              :avatar="profileStore.me?.avatar ?? undefined"
              size="md"
              class="ring-2 ring-gray-200 dark:ring-neutral-700"
            />
            <span
              class="hidden max-w-[140px] truncate font-medium text-gray-900 xl:inline dark:text-white"
            >
              {{ profileStore.me?.username || 'Profile' }}
            </span>
          </div>
          <Icon
            name="mdi:chevron-up"
            size="20"
            class="hidden text-gray-500 transition-transform xl:block"
            :class="{ 'rotate-180': menuOpen }"
          />
        </button>

        <NuxtLink v-else to="/user-login" class="nav-button group">
          <Icon name="mdi:login" size="24" />
          <span class="nav-text">{{ $t('nav.signIn') }}</span>
        </NuxtLink>
      </ClientOnly>

      <!-- Profile popup menu -->
      <Transition name="menu-pop">
        <div
          v-if="menuOpen && profileStore.isLoggedIn"
          class="absolute bottom-full left-0 z-50 mb-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
        >
          <NuxtLink
            :to="`/profile/${profileStore.me?.username}`"
            class="menu-item group"
            @click="menuOpen = false"
          >
            <Icon name="mdi:account-circle-outline" size="20" />
            <span>View Profile</span>
          </NuxtLink>

          <NuxtLink
            to="/buyer/orders"
            class="menu-item group"
            @click="menuOpen = false"
          >
            <Icon name="mdi:package-variant-closed" size="20" />
            <span>My Orders</span>
          </NuxtLink>

          <NuxtLink
            v-if="sellerStore.hasSellers"
            to="/seller/dashboard"
            class="menu-item group"
            @click="menuOpen = false"
          >
            <Icon name="mdi:store-outline" size="20" />
            <span>My Stores</span>
          </NuxtLink>

          <div class="mx-4 my-1.5 h-px bg-gray-100 dark:bg-neutral-800" />

          <NuxtLink
            to="/settings"
            class="menu-item group"
            @click="menuOpen = false"
          >
            <Icon name="mdi:cog-outline" size="20" />
            <span>Settings</span>
          </NuxtLink>

          <div class="mx-4 my-1.5 h-px bg-gray-100 dark:bg-neutral-800" />

          <button
            class="menu-item group w-full text-left text-red-600 hover:bg-red-50/80 dark:text-red-400 dark:hover:bg-red-950/30"
            @click="logout"
          >
            <Icon name="mdi:logout-variant" size="20" />
            <span>Log Out</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useNotificationStore } from '~~/layers/profile/app/stores/notification.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useChatStore } from '~~/layers/profile/app/stores/chat.store'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'

const emit = defineEmits(['create', 'open-notifications', 'open-cart'])

const route = useRoute()
const { logout } = useAuth()
const profileStore = useProfileStore()
const notificationStore = useNotificationStore()
const sellerStore = useSellerStore()
const chatStore = useChatStore()
const { cartCount } = useCart()

const isHome = computed(() => route.path === '/')
const isDiscover = computed(() => route.path === '/discover')
const unreadCount = computed(() => notificationStore.unreadCount)
const messageCount = computed(() =>
  chatStore.conversations.reduce(
    (sum, c: any) => sum + (c.unreadCount ?? c.unread_count ?? 0),
    0,
  ),
)

const menuOpen = ref(false)

const onClickOutside = (e: MouseEvent) => {
  const el = document.querySelector('.bottom-profile-menu')
  if (el && !el.contains(e.target as Node)) menuOpen.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<style scoped>
.nav-button {
  @apply flex items-center gap-4 rounded-xl px-3 py-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white;
}

.nav-button.active {
  @apply bg-brand/10 font-semibold text-gray-900 dark:bg-brand/20 dark:text-white;
}

.sell-button {
  @apply flex items-center gap-4 rounded-xl px-3 py-2.5 font-semibold text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white;
}

.nav-text {
  @apply hidden text-[15px] xl:inline;
}

.menu-item {
  @apply flex items-center gap-3 px-5 py-3.5 text-sm text-gray-800 transition-colors hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-800;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: all 0.18s ease;
}
.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
