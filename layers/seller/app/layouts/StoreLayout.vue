<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-neutral-950">
    <!-- ── Desktop Sidebar (xl+) ─────────────────────────────────── -->
    <aside
      class="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white xl:flex dark:border-neutral-800 dark:bg-neutral-900"
    >
      <!-- Logo / Back to Styli -->
      <div class="border-b border-gray-100 p-4 dark:border-neutral-800">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand shadow-sm shadow-brand/20"
          >
            <span class="text-xs font-black italic text-white">sX</span>
          </div>
          <span class="text-sm font-bold text-gray-500 dark:text-neutral-400"
            >← Back to {{ $config.public.siteName || 'styleX' }}</span
          >
        </NuxtLink>
      </div>

      <!-- Store Switcher -->
      <div class="border-b border-gray-100 px-3 py-2.5 dark:border-neutral-800">
        <StoreSwitcher />
      </div>

      <!-- Nav Links -->
      <nav class="flex flex-1 flex-col space-y-0.5 px-2 py-3">
        <template v-if="storeSlug">
          <NuxtLink
            :to="`/seller/${storeSlug}/dashboard`"
            class="seller-nav-link"
            active-class="active"
          >
            <Icon name="mdi:view-dashboard-outline" size="22" />
            <span>Overview</span>
          </NuxtLink>
          <NuxtLink
            :to="`/seller/${storeSlug}/products`"
            class="seller-nav-link"
            active-class="active"
          >
            <Icon name="mdi:package-variant-closed" size="22" />
            <span>Products</span>
          </NuxtLink>
          <NuxtLink
            :to="`/seller/${storeSlug}/orders`"
            class="seller-nav-link"
            active-class="active"
          >
            <Icon name="mdi:truck-outline" size="22" />
            <span>Orders</span>
          </NuxtLink>
          <NuxtLink
            :to="`/seller/${storeSlug}/messages`"
            class="seller-nav-link"
            active-class="active"
          >
            <Icon name="mdi:message-outline" size="22" />
            <span>Messages</span>
          </NuxtLink>
          <NuxtLink
            :to="`/seller/${storeSlug}/settings`"
            class="seller-nav-link"
            active-class="active"
          >
            <Icon name="mdi:cog-outline" size="22" />
            <span>Settings</span>
          </NuxtLink>
          <div class="px-2 pb-1 pt-3">
            <span
              class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-600"
              >General</span
            >
          </div>
          <div class="my-1 border-t border-gray-100 dark:border-neutral-800" />
        </template>
        <NuxtLink
          to="/seller/dashboard"
          class="seller-nav-link"
          exact-active-class="active"
        >
          <Icon name="mdi:store-outline" size="22" />
          <span>My Stores</span>
        </NuxtLink>
        <NuxtLink to="/sellers/create" class="seller-nav-link">
          <Icon name="mdi:plus-circle-outline" size="22" />
          <span>New Store</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- ── Mobile / Tablet wrapper ───────────────────────────────── -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Mobile top bar (< xl) -->
      <header
        class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 xl:hidden dark:border-neutral-800 dark:bg-neutral-900"
      >
        <NuxtLink
          to="/"
          class="flex shrink-0 items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-neutral-400"
        >
          <Icon name="mdi:arrow-left" size="20" />
          <div
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-brand"
          >
            <span class="text-[9px] font-black italic text-white">sX</span>
          </div>
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <StoreSwitcher />
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto xl:pb-0" style="padding-bottom: max(5rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))">
        <slot />
      </main>

      <!-- Mobile bottom tab bar (< xl) -->
      <nav
        v-if="storeSlug"
        class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-200 bg-white px-2 xl:hidden dark:border-neutral-800 dark:bg-neutral-900"
        style="height: calc(4rem + env(safe-area-inset-bottom, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px)"
      >
        <NuxtLink
          :to="`/seller/${storeSlug}/dashboard`"
          class="mobile-tab"
          active-class="mobile-tab-active"
        >
          <Icon name="mdi:view-dashboard-outline" size="24" />
          <span>Overview</span>
        </NuxtLink>
        <NuxtLink
          :to="`/seller/${storeSlug}/products`"
          class="mobile-tab"
          active-class="mobile-tab-active"
        >
          <Icon name="mdi:package-variant-closed" size="24" />
          <span>Products</span>
        </NuxtLink>
        <NuxtLink
          :to="`/seller/${storeSlug}/orders`"
          class="mobile-tab"
          active-class="mobile-tab-active"
        >
          <Icon name="mdi:truck-outline" size="24" />
          <span>Orders</span>
        </NuxtLink>
        <NuxtLink
          :to="`/seller/${storeSlug}/messages`"
          class="mobile-tab"
          active-class="mobile-tab-active"
        >
          <Icon name="mdi:message-outline" size="24" />
          <span>Messages</span>
        </NuxtLink>
        <NuxtLink
          :to="`/seller/${storeSlug}/settings`"
          class="mobile-tab"
          active-class="mobile-tab-active"
        >
          <Icon name="mdi:cog-outline" size="24" />
          <span>Settings</span>
        </NuxtLink>
      </nav>

      <!-- Mobile bottom tab bar — no store context -->
      <nav
        v-else
        class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-200 bg-white px-2 xl:hidden dark:border-neutral-800 dark:bg-neutral-900"
        style="height: calc(4rem + env(safe-area-inset-bottom, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px)"
      >
        <NuxtLink
          to="/seller/dashboard"
          class="mobile-tab"
          active-class="mobile-tab-active"
        >
          <Icon name="mdi:store-outline" size="24" />
          <span>My Stores</span>
        </NuxtLink>
        <NuxtLink to="/sellers/create" class="mobile-tab">
          <Icon name="mdi:plus-circle-outline" size="24" />
          <span>New Store</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import StoreSwitcher from '~~/layers/seller/app/components/StoreSwitcher.vue'

const route = useRoute()
const storeSlug = computed(() => route.params.storeSlug as string | undefined)
</script>

<style scoped>
.seller-nav-link {
  @apply flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white;
}
.seller-nav-link.active {
  @apply bg-gray-100 font-semibold text-gray-900 dark:bg-neutral-800 dark:text-white;
}

.mobile-tab {
  @apply flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium text-gray-500 transition-colors dark:text-neutral-500;
}
.mobile-tab-active {
  @apply text-brand;
}
</style>
