<template>
  <div class="rounded-xl border p-3" :class="toneClass">
    <div class="flex items-center gap-2">
      <Icon :name="icon" size="16" />
      <p class="text-[13px] font-extrabold">{{ title }}</p>
    </div>
    <p class="mt-1.5 text-[12px] leading-5 opacity-80">
      {{ body }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  tone: 'emerald' | 'slate'
  title: string
  body: string
}>()

const toneClass = computed(() =>
  props.tone === 'emerald'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
    : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300',
)
</script>
