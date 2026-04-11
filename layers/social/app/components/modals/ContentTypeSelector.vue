<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div
      class="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-neutral-900"
    >
      <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">
          Select Post Type
        </h3>
      </div>

      <div class="p-2">
        <button
          v-for="type in contentTypes"
          :key="type.value"
          @click="$emit('select', type.value)"
          class="flex w-full items-start gap-4 rounded-xl p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
          :class="{ 'bg-brand/10': current === type.value }"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full"
            :class="type.color"
          >
            <Icon :name="type.icon" size="24" class="text-white" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 dark:text-neutral-100">
              {{ type.label }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-neutral-400">
              {{ type.description }}
            </p>
          </div>
          <Icon
            v-if="current === type.value"
            name="mdi:check-circle"
            size="24"
            class="text-brand"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: string
}>()

defineEmits(['select', 'close'])

const contentTypes = [
  {
    value: 'EXPERIENCE',
    label: 'Experience/Review',
    description: 'Share your product experience or review',
    icon: 'mdi:star',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
  },
  {
    value: 'INSPIRATION',
    label: 'Style Inspiration',
    description: 'Show off your style and outfit ideas',
    icon: 'mdi:palette',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  {
    value: 'EDUCATIONAL',
    label: 'Tutorial/Guide',
    description: 'Teach something useful or share tips',
    icon: 'mdi:school',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  {
    value: 'ENTERTAINMENT',
    label: 'Fun/Entertainment',
    description: 'Share memes, jokes, or entertaining content',
    icon: 'mdi:emoticon-happy',
    color: 'bg-gradient-to-br from-green-500 to-teal-500',
  },
]
</script>
