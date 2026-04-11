<template>
  <nav
    v-bind="$attrs"
    class="bottom-nav fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200/60 bg-white/90 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/90"
  >
    <div class="flex h-16 items-center justify-around px-2">
      <!-- Home -->
      <NuxtLink to="/" class="nav-item" :class="{ active: isHome }">
        <Icon :name="isHome ? 'mdi:home' : 'mdi:home-outline'" size="26" />
      </NuxtLink>

      <!-- Discover -->
      <NuxtLink to="/discover" class="nav-item" active-class="active">
        <Icon name="mdi:compass-outline" size="26" />
      </NuxtLink>

      <!-- Create (centre CTA) — logged in: open create modal; guest: go to register -->
      <ClientOnly>
        <button
          v-if="profileStore.isLoggedIn"
          class="sell-btn"
          aria-label="Sell"
          @click="$emit('create')"
        >
          <Icon name="mdi:plus-circle-outline" size="20" class="text-white" />
          <span class="text-[11px] font-bold leading-none text-white"
            >create</span
          >
        </button>
        <NuxtLink
          v-else
          to="/user-register"
          class="sell-btn"
          aria-label="Start selling"
        >
          <Icon name="mdi:plus-circle-outline" size="20" class="text-white" />
          <span class="text-[11px] font-bold leading-none text-white"
            >create</span
          >
        </NuxtLink>
        <template #fallback>
          <div class="sell-btn pointer-events-none opacity-0" />
        </template>
      </ClientOnly>

      <!-- Map -->
      <NuxtLink to="/map" class="nav-item" active-class="active">
        <Icon name="mdi:map-marker-radius-outline" size="26" />
      </NuxtLink>

      <!-- Profile -->
      <ClientOnly>
        <div v-if="profileStore.isLoggedIn" ref="menuRef" class="relative">
          <button class="nav-item" @click="menuOpen = !menuOpen">
            <Avatar
              :username="profileStore.me?.username ?? 'User'"
              :avatar="profileStore.me?.avatar ?? ''"
              size="sm"
              class="ring-2 transition-all"
              :class="isProfileActive ? 'ring-brand' : 'ring-transparent'"
            />
          </button>

          <!-- Profile popup -->
          <Transition name="menu-pop">
            <div
              v-if="menuOpen"
              class="absolute bottom-full right-0 z-50 mb-3 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              <NuxtLink
                :to="'/profile/' + profileStore.me?.username"
                class="menu-item"
                @click="menuOpen = false"
              >
                <Icon name="mdi:account-circle-outline" size="18" />
                <span>View Profile</span>
              </NuxtLink>
              <NuxtLink
                to="/buyer/orders"
                class="menu-item"
                @click="menuOpen = false"
              >
                <Icon name="mdi:package-variant-closed" size="18" />
                <span>My Orders</span>
              </NuxtLink>
              <NuxtLink
                v-if="sellerStore.hasSellers"
                to="/seller/dashboard"
                class="menu-item"
                @click="menuOpen = false"
              >
                <Icon name="mdi:store-outline" size="18" />
                <span>My Stores</span>
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="menu-item"
                @click="menuOpen = false"
              >
                <Icon name="mdi:cog-outline" size="18" />
                <span>Settings</span>
              </NuxtLink>
              <div class="mx-3 h-px bg-gray-100 dark:bg-neutral-800" />
              <button
                class="menu-item w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                @click="handleLogout"
              >
                <Icon name="mdi:logout-variant" size="18" />
                <span>Log Out</span>
              </button>
            </div>
          </Transition>
        </div>

        <NuxtLink v-else to="/user-login" class="nav-item" aria-label="Sign in">
          <Icon name="mdi:account-circle-outline" size="26" />
        </NuxtLink>
      </ClientOnly>
    </div>
  </nav>

  <!-- Backdrop -->
  <Teleport to="body">
    <div v-if="menuOpen" class="fixed inset-0 z-20" @click="menuOpen = false" />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useChatStore } from '~~/layers/profile/app/stores/chat.store'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'

defineEmits(['create'])
defineOptions({ inheritAttrs: false })

const route = useRoute()
const profileStore = useProfileStore()
const sellerStore = useSellerStore()
const chatStore = useChatStore()
const { logout } = useAuth()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const isHome = computed(() => route.path === '/')
const isProfileActive = computed(
  () => route.path.startsWith('/profile') || route.path.startsWith('/seller'),
)
const messageCount = computed(() =>
  chatStore.conversations.reduce(
    (sum, c: any) => sum + (c.unreadCount ?? c.unread_count ?? 0),
    0,
  ),
)

const handleLogout = async () => {
  menuOpen.value = false
  await logout()
}

const onClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<style scoped>
.bottom-nav {
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  transition: transform 0.25s ease;
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}

.nav-item {
  @apply relative flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:text-gray-900 dark:text-neutral-500 dark:hover:text-neutral-100;
}

.nav-item.active {
  @apply text-brand dark:text-brand;
}

/* Sell button — taller pill, gradient brand */
.sell-btn {
  @apply flex h-12 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl bg-brand shadow-lg shadow-brand/30 transition-transform active:scale-95;
}

.menu-item {
  @apply flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-800;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}
</style>
