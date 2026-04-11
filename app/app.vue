<template>
  <div
    class="min-h-screen bg-white text-neutral-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NuxtNotifications
      position="top right"
      :speed="400"
      :duration="4000"
      :max="4"
    />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = colorMode.preference || 'dark'

const { defaults } = useSeo()
defaults()

// Re-apply text size on app load
if (import.meta.client) {
  const { settings } = useSettings()
  watch(
    () => settings.value.textSize,
    (size) => {
      document.documentElement.classList.remove(
        'text-size-small',
        'text-size-large',
      )
      if (size !== 'medium')
        document.documentElement.classList.add(`text-size-${size}`)
    },
    { immediate: true },
  )
}
</script>

<style>
/* Notification theme styles */
:root {
  --vn-bg-color: #262626;
  --vn-border-color: #404040;
  --vn-text-color: #f5f5f5;
  --vn-success-color: #22c55e;
  --vn-error-color: #ef4444;
  --vn-warn-color: #f97316;
  --vn-info-color: #3b82f6;
}
html:not(.dark) {
  --vn-bg-color: #ffffff;
  --vn-border-color: #e5e7eb;
  --vn-text-color: #171717;
}

/* Notification container positioning */
.vue-notification-group {
  /* Mobile: below the fixed header */
  top: calc(3.5rem + env(safe-area-inset-top, 0px) + 8px) !important;
  z-index: 9999 !important;
}

/* Desktop: standard top margin */
@media (min-width: 768px) {
  .vue-notification-group {
    top: 12px !important;
  }
}

/* Notification card styling */
.vue-notification-wrapper {
  margin: 0 8px 6px !important;
}

.vue-notification {
  border-radius: 10px !important;
  font-size: 13px !important;
  padding: 10px 14px !important;
  border-left-width: 4px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Text size scaling */
html.text-size-small {
  font-size: 14px;
}
html.text-size-large {
  font-size: 18px;
}
</style>
