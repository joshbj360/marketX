<template>
  <section class="filter-section">
    <div class="mb-2.5 flex items-center gap-2">
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400"
      >
        <Icon :name="icon" size="13" />
      </span>
      <p
        class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-400"
      >
        {{ label }}
      </p>
    </div>

    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon: string
}>()
</script>

<style scoped>
.filter-section {
  @apply rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-900/30;
}
</style>
