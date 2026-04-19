<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
  >
    <h2 class="mb-1 font-semibold text-gray-900 dark:text-neutral-100">Categories</h2>
    <p class="mb-3 text-xs text-gray-500 dark:text-neutral-400">Select all that apply.</p>
    <div
      v-if="categoriesLoading"
      class="flex items-center gap-2 text-sm text-gray-400 dark:text-neutral-500"
    >
      <Icon name="mdi:loading" size="16" class="animate-spin" /> Loading categories…
    </div>
    <div
      v-else-if="categories.length === 0"
      class="text-sm text-gray-400 dark:text-neutral-500"
    >
      No categories available.
    </div>
    <div v-else class="flex flex-wrap gap-2">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          categoryIds.includes(cat.id)
            ? 'border-brand bg-brand text-white'
            : 'border-gray-200 bg-gray-100 text-gray-700 hover:border-brand dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
        "
        @click="toggleCategory(cat.id)"
      >
        {{ cat.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categories: Array<{ id: number; name: string }>
  categoriesLoading: boolean
  categoryIds: number[]
}>()

const toggleCategory = (id: number) => {
  const idx = props.categoryIds.indexOf(id)
  if (idx === -1) {
    props.categoryIds.push(id)
  } else {
    props.categoryIds.splice(idx, 1)
  }
}
</script>
