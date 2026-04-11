<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div
        class="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-xl dark:bg-neutral-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Comments
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-500 hover:text-gray-700 dark:text-neutral-400"
          >
            <Icon name="mdi:close" class="h-6 w-6" />
          </button>
        </div>
        <p class="text-sm text-gray-500 dark:text-neutral-400">
          Comments for this post
        </p>
        <p class="mt-4 text-center text-sm text-gray-400 dark:text-neutral-500">
          Coming soon
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean; post: any }>()
defineEmits(['close'])
</script>
