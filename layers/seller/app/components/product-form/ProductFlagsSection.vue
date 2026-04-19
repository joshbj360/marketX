<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
  >
    <h2 class="mb-4 font-semibold text-gray-900 dark:text-neutral-100">Product Flags</h2>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <label class="flex cursor-pointer items-center gap-2">
        <input
          v-model="form.isFeatured"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
        />
        <span class="text-sm text-gray-700 dark:text-neutral-300">Featured</span>
      </label>
      <label class="flex cursor-pointer items-center gap-2">
        <input
          v-model="form.isAccessory"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
        />
        <span class="text-sm text-gray-700 dark:text-neutral-300">Accessory</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    isFeatured: boolean
    isAccessory: boolean
  }
}>()
</script>
