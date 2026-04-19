<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
  >
    <label class="mb-3 block text-sm font-semibold text-gray-900 dark:text-neutral-100">
      Tags
      <span class="ml-1 font-normal text-gray-400 dark:text-neutral-500">(optional, max 10)</span>
    </label>
    <div v-if="tagNames.length" class="mb-2 flex flex-wrap gap-1.5">
      <span
        v-for="(tag, i) in tagNames"
        :key="i"
        class="flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand"
      >
        #{{ tag }}
        <button
          type="button"
          class="ml-0.5 rounded-full hover:bg-brand/20"
          @click="tagNames.splice(i, 1)"
        >
          <Icon name="mdi:close" size="13" />
        </button>
      </span>
    </div>
    <input
      v-if="tagNames.length < 10"
      v-model="tagInput"
      type="text"
      placeholder="Type a tag and press Enter or comma"
      class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition-all focus:border-brand/50 focus:bg-white focus:ring-2 focus:ring-brand/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:bg-neutral-800"
      @keydown.enter.prevent="addTag"
      @keydown.188.prevent="addTag"
    />
    <p class="mt-1.5 text-xs text-gray-400 dark:text-neutral-500">
      Tags help shoppers find your product. E.g. "streetwear", "vintage", "summer"
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tagNames: string[]
}>()

const tagInput = ref('')

const addTag = () => {
  const tag = tagInput.value.trim().replace(/^#/, '').replace(/,$/, '')
  if (tag && !props.tagNames.includes(tag) && props.tagNames.length < 10) {
    props.tagNames.push(tag)
  }
  tagInput.value = ''
}
</script>
