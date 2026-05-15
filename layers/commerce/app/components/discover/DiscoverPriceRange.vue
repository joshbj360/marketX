<template>
  <div class="space-y-2">
    <div class="grid grid-cols-1 gap-2.5">
      <label v-if="!hideMin" class="price-field">
        <span class="price-input-wrap">
          <span class="price-label">From</span>
          <input
            :value="min ?? ''"
            type="number"
            placeholder="No minimum"
            min="0"
            inputmode="numeric"
            class="price-input"
            @input="emitNumber('update:min', $event)"
          />
          <span class="price-suffix">NGN</span>
        </span>
      </label>

      <label class="price-field">
        <span class="price-input-wrap">
          <span class="price-label">{{ hideMin ? 'Maximum' : 'To' }}</span>
          <input
            :value="max ?? ''"
            type="number"
            :placeholder="hideMin ? 'No max price' : 'No maximum'"
            min="0"
            inputmode="numeric"
            class="price-input"
            @input="emitNumber('update:max', $event)"
          />
          <span class="price-suffix">NGN</span>
        </span>
      </label>
    </div>

    <p class="text-[11px] leading-4 text-gray-400 dark:text-neutral-500">
      {{
        hideMin
          ? 'Leave blank to include deals at any price.'
          : 'Leave either side blank for an open price range.'
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  min?: number | null
  max?: number | null
  hideMin?: boolean
}>()

const emit = defineEmits<{
  'update:min': [value: number | null]
  'update:max': [value: number | null]
}>()

function emitNumber(eventName: 'update:min' | 'update:max', event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit(eventName, value ? Number(value) : null)
}
</script>

<style scoped>
.price-field {
  @apply block min-w-0;
}

.price-label {
  @apply w-20 shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-neutral-500;
}

.price-input-wrap {
  @apply flex min-h-12 w-full items-center rounded-xl border border-gray-200 bg-white px-3 shadow-sm shadow-gray-200/40 transition focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none;
}

.price-input {
  @apply w-full min-w-0 bg-transparent py-2 text-[13px] font-bold text-gray-800 placeholder-gray-400 outline-none dark:text-neutral-100 dark:placeholder-neutral-500;
}

.price-suffix {
  @apply ml-2 shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[9px] font-black tracking-wide text-gray-400 dark:bg-neutral-800 dark:text-neutral-500;
}
</style>
