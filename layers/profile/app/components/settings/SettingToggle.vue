<template>
  <div
    class="flex items-center justify-between px-5 py-4 transition-colors"
    :class="border ? 'border-b border-gray-100 dark:border-neutral-800' : ''"
  >
    <div class="flex items-center gap-3">
      <Icon
        :name="icon"
        size="20"
        class="shrink-0 text-gray-500 dark:text-neutral-400"
      />
      <div>
        <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">
          {{ label }}
        </p>
        <p
          v-if="description"
          class="mt-0.5 text-xs text-gray-400 dark:text-neutral-500"
        >
          {{ description }}
        </p>
      </div>
    </div>
    <!-- Toggle switch -->
    <button
      @click="$emit('change', !value)"
      class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none"
      :class="value ? 'bg-brand' : 'bg-gray-200 dark:bg-neutral-700'"
      :aria-checked="value"
      role="switch"
    >
      <span
        class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
        :class="value ? 'translate-x-5' : 'translate-x-0'"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  description?: string
  value: boolean
  border?: boolean
}>()
defineEmits<{ change: [value: boolean] }>()
</script>
