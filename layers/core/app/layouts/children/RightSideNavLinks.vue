<template>
  <div
    class="flex h-full flex-col border-l border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- ─── SCROLLABLE CONTENT AREA ─────────────────────────────────────────── -->
    <div class="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-3">
      <!-- 1. Help Topics -->
      <div
        class="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30"
      >
        <div class="mb-3 flex items-center gap-2">
          <Icon
            name="mdi:book-open-page-variant-outline"
            size="20"
            class="text-brand"
          />
          <h3 class="font-bold text-gray-900 dark:text-neutral-100">
            Help Topics
          </h3>
        </div>
        <div class="space-y-1.5">
          <NuxtLink to="/help/getting-started" class="quick-link group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:rocket-launch-outline" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Getting Started</span
            >
          </NuxtLink>
          <NuxtLink to="/help/orders" class="quick-link group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:package-variant-closed" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Orders & Tracking</span
            >
          </NuxtLink>
          <NuxtLink to="/help/returns" class="quick-link group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:keyboard-return" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Returns & Refunds</span
            >
          </NuxtLink>
          <NuxtLink to="/help/sellers" class="quick-link group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:storefront-outline" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Seller Guide</span
            >
          </NuxtLink>
        </div>
      </div>

      <!-- 2. Legal & Policies -->
      <div
        class="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/30"
      >
        <div class="mb-3 flex items-center gap-2">
          <Icon name="mdi:scale-balance" size="20" class="text-brand" />
          <h3 class="font-bold text-gray-900 dark:text-neutral-100">
            Legal & Policies
          </h3>
        </div>
        <div class="space-y-1.5">
          <NuxtLink to="/terms" class="quick-link group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:file-document-outline" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Terms of Service</span
            >
          </NuxtLink>
          <NuxtLink to="/privacy" class="quick-link group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:shield-check-outline" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Privacy Policy</span
            >
          </NuxtLink>
          <NuxtLink to="/policy/cookies" class="quick-link group">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors group-hover:border-brand/30 group-hover:text-brand dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Icon name="mdi:cookie-outline" size="18" />
            </div>
            <span
              class="text-sm font-medium text-gray-700 transition-colors group-hover:text-brand dark:text-neutral-300"
              >Cookie Policy</span
            >
          </NuxtLink>
        </div>
      </div>

      <!-- 3. Footer Copyright -->
      <div class="px-2 py-4">
        <div
          class="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-400 dark:text-neutral-500"
        >
          <NuxtLink
            to="/about"
            class="transition-colors hover:text-gray-800 dark:hover:text-gray-300"
            >About {{ config.public.siteName || 'MarketX' }}</NuxtLink
          >
          <NuxtLink
            to="/support"
            class="transition-colors hover:text-gray-800 dark:hover:text-gray-300"
            >Support Center</NuxtLink
          >
        </div>
        <div
          class="flex items-center justify-center text-center text-[11px] font-medium text-gray-400 dark:text-neutral-600"
        >
          <p>
            © {{ new Date().getFullYear() }}
            {{ config.public.siteName || 'MarketX' }}. All rights reserved.
          </p>
        </div>
      </div>
    </div>

    <!-- ─── STICKY BOTTOM CONTACT CTA ────────────────────────────────────────── -->
    <div
      class="sticky bottom-0 flex-shrink-0 bg-white px-3 pb-4 pt-2 dark:bg-neutral-900"
    >
      <div
        class="rounded-2xl border border-brand/10 bg-brand/5 p-4 text-center shadow-sm dark:bg-brand/10"
      >
        <div
          class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand"
        >
          <Icon name="mdi:email-fast-outline" size="20" />
        </div>
        <h4 class="mb-1 text-sm font-bold text-gray-900 dark:text-white">
          Need direct help?
        </h4>
        <p class="mb-3 text-[11px] text-gray-600 dark:text-neutral-400">
          Our team typically responds in under 24hrs.
        </p>
        <a
          :href="`mailto:${config.public.supportEmail || 'support@marketx.com'}`"
          class="block w-full rounded-xl bg-brand py-2.5 text-xs font-bold text-white transition-all hover:bg-[#d81b36] hover:shadow-md active:scale-95"
        >
          Contact Support
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
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
