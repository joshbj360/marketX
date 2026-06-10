<!-- ~~/layers/core/app/layouts/children/SideNav.vue -->
<template>
  <div class="flex h-full flex-col p-3 xl:p-4">
    <!-- Logo -->
    <NuxtLink
      to="/"
      class="mb-6 flex shrink-0 items-center justify-center gap-2.5 xl:justify-start"
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

    <!-- Scrollable nav area — profile stays pinned below this -->
    <div class="nav-scroll min-h-0 flex-1 overflow-y-auto">
      <!-- Primary Navigation -->
      <nav class="flex flex-col space-y-1">
        <NuxtLink to="/" class="nav-button group" :class="{ active: isHome }">
          <Icon :name="isHome ? 'mdi:home' : 'mdi:home-outline'" size="24" />
          <span class="nav-text">Home</span>
        </NuxtLink>

        <NuxtLink to="/discover" class="nav-button group" active-class="active">
          <Icon name="mdi:store-search-outline" size="24" />
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

        <NuxtLink to="/squares" class="nav-button group" active-class="active">
          <Icon
            :name="isSquares ? 'mdi:storefront' : 'mdi:storefront-outline'"
            size="24"
          />
          <span class="nav-text">Squares</span>
        </NuxtLink>
      </nav>

      <!-- Seller entry point: Start Selling (users without a store) -->
      <ClientOnly>
        <NuxtLink
          v-if="profileStore.isLoggedIn && !sellerStore.hasSellers"
          to="/sellers/create"
          class="mt-2 flex items-center gap-4 rounded-xl border border-dashed border-brand/30 px-3 py-2.5 text-brand/80 transition-all hover:border-brand/60 hover:bg-brand/5 hover:text-brand"
        >
          <Icon name="mdi:store-plus-outline" size="24" />
          <span class="nav-text font-semibold">Start Selling</span>
        </NuxtLink>
      </ClientOnly>

      <!-- Seller Hub (only for users who have stores) -->
      <ClientOnly>
        <div
          v-if="profileStore.isLoggedIn && sellerStore.hasSellers"
          class="relative mt-2"
        >
          <!-- Single store → direct link -->
          <NuxtLink
            v-if="sellerStore.sellers.length === 1"
            :to="`/seller/${sellerStore.sellers[0].store_slug}/dashboard`"
            class="seller-hub-btn group"
            :class="{ active: isSellerRoute }"
          >
            <div
              class="relative flex h-6 w-6 shrink-0 items-center justify-center"
            >
              <img
                v-if="sellerStore.sellers[0].store_logo"
                :src="sellerStore.sellers[0].store_logo"
                :alt="sellerStore.sellers[0].store_name || 'Store'"
                class="h-6 w-6 rounded-md object-cover"
              />
              <Icon v-else name="mdi:store-outline" size="24" />
              <span
                v-if="isSellerRoute"
                class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900"
              />
            </div>
            <span class="nav-text">Seller Hub</span>
            <span
              v-if="isSellerRoute"
              class="ml-auto hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 xl:inline dark:bg-emerald-900/30 dark:text-emerald-400"
              >Active</span
            >
          </NuxtLink>

          <!-- Multiple stores → picker trigger -->
          <button
            v-else
            class="seller-hub-btn group w-full"
            :class="{ active: isSellerRoute }"
            @click="storePickerOpen = !storePickerOpen"
          >
            <div
              class="relative flex h-6 w-6 shrink-0 items-center justify-center"
            >
              <Icon name="mdi:store-outline" size="24" />
              <span
                v-if="isSellerRoute"
                class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900"
              />
            </div>
            <span class="nav-text">Seller Hub</span>
            <span
              class="ml-auto hidden rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 xl:inline dark:bg-neutral-800 dark:text-neutral-400"
            >
              {{ sellerStore.sellers.length }}
            </span>
          </button>

          <!-- Store picker panel (multi-store) -->
          <Transition name="menu-pop">
            <div
              v-if="storePickerOpen"
              class="absolute bottom-full left-0 z-50 mb-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              <p
                class="px-4 pb-2 pt-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500"
              >
                Switch Store
              </p>
              <NuxtLink
                v-for="store in sellerStore.sellers"
                :key="store.id"
                :to="`/seller/${store.store_slug}/dashboard`"
                class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                @click="storePickerOpen = false"
              >
                <div
                  class="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <img
                    v-if="store.store_logo"
                    :src="store.store_logo"
                    :alt="store.store_name || 'Store'"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center"
                  >
                    <Icon
                      name="mdi:store"
                      size="18"
                      class="text-gray-400 dark:text-neutral-500"
                    />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    {{ store.store_name || 'Unnamed Store' }}
                  </p>
                  <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                    @{{ store.store_slug }}
                  </p>
                </div>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  :class="
                    store.is_active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
                  "
                  >{{ store.is_active ? 'Live' : 'Off' }}</span
                >
              </NuxtLink>
              <div class="border-t border-gray-200 p-2 dark:border-neutral-700">
                <NuxtLink
                  to="/sellers/create"
                  class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/5"
                  @click="storePickerOpen = false"
                >
                  <Icon name="mdi:plus" size="16" />
                  <span class="nav-text">Add new store</span>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>
      </ClientOnly>

      <!-- Divider -->
      <div class="mx-2 my-3 h-px bg-gray-200 dark:bg-neutral-800" />

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
            <span class="nav-text">Create</span>
          </button>
          <NuxtLink v-else to="/user-register" class="sell-button group">
            <Icon name="mdi:plus-circle-outline" size="24" />
            <span class="nav-text">Create</span>
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
    </div>
    <!-- end scrollable nav area -->

    <!-- Profile — always pinned to bottom, never scrolls away -->
    <div class="relative shrink-0 pb-2 pt-1">
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

          <!-- Seller Hub in profile popup -->
          <NuxtLink
            v-if="sellerStore.hasSellers && !isSellerRoute"
            to="/seller/dashboard"
            class="menu-item group text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            @click="menuOpen = false"
          >
            <Icon name="mdi:store-outline" size="20" />
            <span>Switch to Seller Mode</span>
          </NuxtLink>
          <NuxtLink
            v-else-if="sellerStore.hasSellers && isSellerRoute"
            to="/"
            class="menu-item group"
            @click="menuOpen = false"
          >
            <Icon name="mdi:shopping-outline" size="20" />
            <span>Switch to Buyer Mode</span>
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

          <NuxtLink
            v-if="
              profileStore.me?.role === 'admin' ||
              profileStore.me?.role === 'moderator'
            "
            to="/admin"
            class="menu-item group text-rose-600 hover:bg-rose-50/80 dark:text-rose-400 dark:hover:bg-rose-950/30"
            @click="menuOpen = false"
          >
            <Icon name="mdi:shield-crown-outline" size="20" />
            <span>Admin Panel</span>
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
const isSquares = computed(() => route.path.startsWith('/squares'))
const isSellerRoute = computed(() => route.path.startsWith('/seller'))
const unreadCount = computed(() => notificationStore.unreadCount)
const messageCount = computed(() =>
  chatStore.conversations.reduce(
    (sum, c: any) => sum + (c.unreadCount ?? c.unread_count ?? 0),
    0,
  ),
)

const menuOpen = ref(false)
const storePickerOpen = ref(false)

const onClickOutside = (e: MouseEvent) => {
  const profileMenu = document.querySelector('.bottom-profile-menu')
  if (profileMenu && !profileMenu.contains(e.target as Node))
    menuOpen.value = false
  const pickerEl = document.querySelector('.store-picker-anchor')
  if (pickerEl && !pickerEl.contains(e.target as Node))
    storePickerOpen.value = false
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

.seller-hub-btn {
  @apply flex items-center gap-4 rounded-xl px-3 py-2.5 font-semibold text-gray-600 transition-all hover:bg-emerald-50 hover:text-emerald-800 dark:text-neutral-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300;
}

.seller-hub-btn.active {
  @apply bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300;
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

/* Hide scrollbar on the nav scroll area — users can still scroll if needed */
.nav-scroll::-webkit-scrollbar {
  display: none;
}
.nav-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
