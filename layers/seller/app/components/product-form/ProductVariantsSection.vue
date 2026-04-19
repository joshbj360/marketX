<template>
  <div
    class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
  >
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-neutral-100">Variants</h2>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
          Sizes, colours, or any option that changes price or stock.
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
        @click="addVariant"
      >
        <Icon name="mdi:plus" size="15" /> Add Variant
      </button>
    </div>

    <div v-if="variants.length" class="space-y-2">
      <div
        v-for="(variant, i) in variants"
        :key="i"
        class="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Size / Name *
            </label>
            <input
              v-model="variant.size"
              placeholder="e.g. M, Red, 42"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Price (₦)
              <span class="font-normal opacity-60">— blank = base price</span>
            </label>
            <input
              v-model.number="variant.price"
              type="number"
              min="0"
              placeholder="Same as base"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              Stock
            </label>
            <input
              v-model.number="variant.stock"
              type="number"
              min="0"
              placeholder="0"
              class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        </div>
        <button
          type="button"
          class="mt-6 flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          @click="removeVariant(i)"
        >
          <Icon name="mdi:trash-can-outline" size="16" />
        </button>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-700"
      @click="addVariant"
    >
      <Icon name="mdi:tag-multiple-outline" size="28" class="text-gray-400 dark:text-neutral-500" />
      <span class="text-sm font-medium text-gray-500 dark:text-neutral-400">
        Click to add your first variant
      </span>
      <span class="text-xs text-gray-400 dark:text-neutral-500">e.g. Small / Medium / Large or Red / Blue</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  variants: Array<{ size: string; price: number | null; stock: number }>
}>()

const addVariant = () => {
  props.variants.push({ size: '', price: null, stock: 0 })
}

const removeVariant = (i: number) => {
  props.variants.splice(i, 1)
}
</script>
