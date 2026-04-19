<template>
  <header
    class="mobile-header border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-900/80"
  >
    <div class="flex h-14 items-center justify-between px-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand shadow-md shadow-brand/25"
        >
          <span class="text-xs font-black italic text-white">MX</span>
        </div>
        <span
          class="text-lg font-black tracking-tight text-gray-900 dark:text-neutral-100"
          >{{ $config.public.siteName || 'MarketX' }}</span
        >
      </NuxtLink>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button @click="$emit('open-cart')" class="header-button">
          <div class="relative">
            <Icon name="mdi:shopping-outline" size="26" />
            <span
              v-if="cartCount > 0"
              class="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-0.5 text-[9px] font-bold text-white"
              >{{ cartCount > 9 ? '9+' : cartCount }}</span
            >
          </div>
        </button>
        <NuxtLink to="/discover" class="header-button">
          <Icon name="mdi:magnify" size="24" />
        </NuxtLink>

        <ClientOnly>
          <button
            v-if="profileStore.isLoggedIn"
            @click="$emit('open-notifications')"
            class="header-button relative"
          >
            <Icon name="mdi:bell-outline" size="24" />
            <span
              v-if="unreadCount > 0"
              class="absolute right-0 top-0 block h-2 w-2 rounded-full bg-brand"
            ></span>
          </button>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useNotificationStore } from '~~/layers/profile/app/stores/notification.store'

defineEmits(['open-notifications', 'open-cart'])

const profileStore = useProfileStore()
const notificationStore = useNotificationStore()

const { cartCount } = useCart()

const unreadCount = computed(() => notificationStore.unreadCount)
</script>

<style scoped>
.mobile-header {
  padding-top: env(safe-area-inset-top, 0px);
}

/* Hide on desktop */
@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}

.header-button {
  @apply rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100;
}
</style>
