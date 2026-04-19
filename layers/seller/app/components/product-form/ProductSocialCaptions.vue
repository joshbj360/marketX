<template>
  <div
    v-if="hasAiCaptions"
    class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_0_15px_rgba(240,44,86,0.05)] sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
  >
    <div class="mb-2 flex items-center gap-2">
      <Icon name="mdi:share-all-outline" size="24" class="text-brand" />
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-neutral-100">Social Media Posts</h2>
        <p class="text-xs text-gray-500 dark:text-neutral-400">
          These will automatically publish to your linked accounts when you create the product.
        </p>
      </div>
    </div>

    <div class="space-y-4">
      <div class="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <label class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
          <Icon name="mdi:instagram" class="text-pink-600" size="16" />
          Instagram
        </label>
        <textarea
          v-model="captions.instagram"
          rows="4"
          class="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        />
      </div>

      <div class="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <label class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
          <Icon name="mdi:facebook" class="text-blue-600" size="16" />
          Facebook
        </label>
        <textarea
          v-model="captions.facebook"
          rows="3"
          class="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        />
      </div>

      <div class="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
        <label class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
          <Icon name="mdi:pinterest" class="text-red-600" size="16" />
          Pinterest
        </label>
        <textarea
          v-model="captions.pinterest"
          rows="2"
          class="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  captions: {
    instagram: string
    facebook: string
    pinterest: string
  }
}>()

const hasAiCaptions = computed(
  () => !!(props.captions.instagram || props.captions.facebook || props.captions.pinterest),
)
</script>
