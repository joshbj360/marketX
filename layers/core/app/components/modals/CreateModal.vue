<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-neutral-900"
      >
        <!-- Header -->
        <div
          class="border-b border-gray-200 p-4 text-center dark:border-neutral-800"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Create
          </h2>
        </div>

        <!-- Options -->
        <div class="p-2">
          <button class="create-option" @click="$emit('open-post-modal')">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500"
            >
              <Icon name="mdi:image-plus" size="24" class="text-white" />
            </div>
            <div class="flex-1 text-left">
              <p class="font-semibold text-gray-900 dark:text-neutral-100">
                Post
              </p>
              <p class="text-sm text-gray-500 dark:text-neutral-400">
                Share photos and videos
              </p>
            </div>
          </button>

          <button class="create-option" @click="$emit('open-story-modal')">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500"
            >
              <Icon name="mdi:camera-plus" size="24" class="text-white" />
            </div>
            <div class="flex-1 text-left">
              <p class="font-semibold text-gray-900 dark:text-neutral-100">
                Story
              </p>
              <p class="text-sm text-gray-500 dark:text-neutral-400">
                Share a moment
              </p>
            </div>
          </button>

          <button
            v-if="profileStore.me?.role === 'seller'"
            class="create-option"
            @click="$emit('open-product-modal')"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500"
            >
              <Icon name="mdi:shopping-outline" size="24" class="text-white" />
            </div>
            <div class="flex-1 text-left">
              <p class="font-semibold text-gray-900 dark:text-neutral-100">
                Product
              </p>
              <p class="text-sm text-gray-500 dark:text-neutral-400">
                List an item for sale
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'

defineProps<{
  isOpen: boolean
}>()

defineEmits([
  'close',
  'open-post-modal',
  'open-story-modal',
  'open-product-modal',
])

const profileStore = useProfileStore()
</script>

<style scoped>
.create-option {
  @apply flex w-full items-center gap-4 rounded-xl p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800;
}
</style>
