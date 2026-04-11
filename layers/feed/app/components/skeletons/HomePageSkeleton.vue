<template>
  <div class="w-full space-y-4 pb-20 sm:space-y-6">
    <!-- Stories skeleton -->
    <!-- Added px-2 for mobile edge breathing room, flex-nowrap to prevent wrapping bugs -->
    <div
      class="pointer-events-none flex flex-nowrap gap-3 overflow-hidden px-2 sm:gap-4 sm:px-0"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="flex shrink-0 flex-col items-center gap-2"
      >
        <!-- Scaled down slightly for mobile, back to 70px for tablet+ -->
        <div
          class="h-16 w-16 transform-gpu animate-pulse rounded-full bg-gray-200 sm:h-[70px] sm:w-[70px] dark:bg-neutral-800"
        />
        <div
          class="h-2.5 w-12 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
        />
      </div>
    </div>

    <!-- Post card skeletons -->
    <div
      v-for="i in 3"
      :key="i"
      class="transform-gpu overflow-hidden border-y border-gray-100 bg-white sm:rounded-2xl sm:border dark:border-neutral-800 dark:bg-neutral-950"
    >
      <!-- Author header -->
      <div class="flex items-center gap-3 px-4 py-3">
        <div
          class="h-10 w-10 shrink-0 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
        />
        <div class="flex-1 space-y-2">
          <div
            class="h-3 w-28 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
          />
          <div
            class="h-2.5 w-16 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
          />
        </div>
        <div
          class="h-5 w-14 shrink-0 transform-gpu animate-pulse rounded-md bg-gray-100 dark:bg-neutral-800"
        />
      </div>

      <!-- Media placeholder -->
      <!-- FIXED: Swapped inline styles for Tailwind aspect ratio classes for better iOS support -->
      <div
        class="w-full transform-gpu animate-pulse bg-gray-100 dark:bg-neutral-800"
        :class="i % 2 === 0 ? 'aspect-square' : 'aspect-[4/5]'"
      />

      <!-- Action bar -->
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-5">
          <div
            class="h-5 w-8 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
          />
          <div
            class="h-5 w-8 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
          />
          <div
            class="h-5 w-6 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
          />
        </div>
        <div
          class="h-6 w-6 transform-gpu animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed, purely presentational
</script>
