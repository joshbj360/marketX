<!-- layers/auth/components/AuthLayout.vue -->
<template>
  <div
    class="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-4 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950"
  >
    <div
      class="flex max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-900"
    >
      <!-- Left Section: Form -->
      <div
        class="flex flex-1 flex-col justify-center overflow-auto p-8 sm:p-12 lg:p-14"
      >
        <!-- Brand -->
        <div class="mb-8 flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand"
            >
              <Icon name="mdi:hanger" class="h-6 w-6 text-white" />
            </div>
          </NuxtLink>
        </div>

        <!-- Title & Subtitle -->
        <div class="mb-8">
          <h1
            class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white"
          >
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="text-sm text-gray-500 sm:text-base dark:text-gray-400"
          >
            {{ subtitle }}
          </p>
        </div>

        <!-- Form Content (Slot) -->
        <slot />

        <!-- Bottom Links (Slot for customization) -->
        <slot name="footer" />
      </div>

      <!-- Right Section: Visual Branding -->
      <div class="relative hidden w-1/2 overflow-hidden lg:flex">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
            alt="Fashion"
            class="h-full w-full object-cover"
          />
          <!-- Gradient Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-[#f02c56]/90 via-[#c01a40]/85 to-[#8a0f2b]/90"
          />
        </div>

        <!-- Content -->
        <div
          class="relative z-10 flex flex-col items-center justify-center p-8 text-center text-white"
        >
          <div class="max-w-xs space-y-4">
            <!-- Main Heading -->
            <div class="space-y-3">
              <div class="inline-block">
                <div
                  class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                >
                  <Icon name="mdi:hanger" class="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 class="text-2xl font-bold leading-tight">
                Discover Your Perfect Style
              </h2>
              <p class="text-sm leading-relaxed text-white/90">
                Shop from curated collections, connect with sellers worldwide,
                and express your unique fashion sense.
              </p>
            </div>

            <!-- Feature Icons -->
            <div class="flex justify-center gap-3 pt-6">
              <div class="group">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-white/30"
                >
                  <Icon name="mdi:palette" class="h-5 w-5 text-white" />
                </div>
                <p class="mt-1 text-xs text-white/80">Curated</p>
              </div>
              <div class="group">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-white/30"
                >
                  <Icon name="mdi:account-group" class="h-5 w-5 text-white" />
                </div>
                <p class="mt-1 text-xs text-white/80">Community</p>
              </div>
              <div class="group">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-white/30"
                >
                  <Icon name="mdi:cart" class="h-5 w-5 text-white" />
                </div>
                <p class="mt-1 text-xs text-white/80">Seamless</p>
              </div>
            </div>
          </div>

          <!-- Bottom Stats -->
          <div class="absolute bottom-6 left-0 right-0 px-8">
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="rounded-lg bg-white/10 px-1 py-2 backdrop-blur-sm">
                <div class="text-lg font-bold">500+</div>
                <div class="text-xs text-white/80">Sellers</div>
              </div>
              <div class="rounded-lg bg-white/10 px-1 py-2 backdrop-blur-sm">
                <div class="text-lg font-bold">50K+</div>
                <div class="text-xs text-white/80">Products</div>
              </div>
              <div class="rounded-lg bg-white/10 px-1 py-2 backdrop-blur-sm">
                <div class="text-lg font-bold">100K+</div>
                <div class="text-xs text-white/80">Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>
