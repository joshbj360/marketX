<template>
  <div class="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
    <button
      @click="emit('update:modelValue', null)"
      class="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all"
      :class="
        modelValue === null
          ? 'bg-brand text-white shadow-sm shadow-brand/30'
          : 'border border-gray-200 text-gray-600 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-400'
      "
    >
      All
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="emit('update:modelValue', cat.slug)"
      class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all"
      :class="
        modelValue === cat.slug
          ? 'bg-brand text-white shadow-sm shadow-brand/30'
          : 'border border-gray-200 text-gray-600 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-400'
      "
    >
      <img
        v-if="cat.thumbnailCatUrl"
        :src="cat.thumbnailCatUrl"
        :alt="cat.name"
        class="h-4 w-4 shrink-0 rounded-full object-cover"
        :class="modelValue === cat.slug ? 'ring-1 ring-white/50' : ''"
      />
      {{ cat.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: Array<{ id: number; name: string; slug: string; thumbnailCatUrl?: string | null }>
  modelValue: string | null
}>()

const emit = defineEmits<{ 'update:modelValue': [slug: string | null] }>()
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
