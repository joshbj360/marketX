<!-- layers/seller/app/components/SellerSignupSection.vue -->
<!-- Drop-in collapsible "Want to sell?" accordion for any auth/onboarding form. -->
<!-- v-model binds the store name value; emits '' when collapsed/cleared.       -->
<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700">
    <!-- Toggle row -->
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/60"
      @click="toggle"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
          <Icon name="mdi:storefront-outline" size="17" class="text-brand" />
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-800 dark:text-neutral-200">
            Want to sell on {{ siteName }}?
          </p>
          <p class="text-xs text-gray-500 dark:text-neutral-400">
            {{ open ? 'Fill in your store name to get started' : 'Open a store right after signing up' }}
          </p>
        </div>
      </div>
      <Icon
        name="mdi:chevron-down"
        size="18"
        class="shrink-0 text-gray-400 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- Expandable body -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="open" class="border-t border-gray-100 px-4 pb-4 pt-3 dark:border-neutral-700">
        <p class="mb-3 flex items-start gap-1.5 text-xs text-blue-600 dark:text-blue-400">
          <Icon name="mdi:information-outline" size="13" class="mt-0.5 shrink-0" />
          Your account is created first. Then we'll set up your store — logo, products, and more.
        </p>

        <label class="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-neutral-400">
          Store Name <span class="text-brand">*</span>
        </label>
        <input
          :value="modelValue"
          type="text"
          placeholder="e.g. Lagos Streetwear Co."
          maxlength="100"
          autocomplete="organization"
          class="w-full rounded-xl border border-gray-200 bg-white/60 px-4 py-3 text-sm placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-500"
          :class="{ 'border-red-400 dark:border-red-600': error }"
          @input="onInput"
        />
        <p v-if="error" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
        <p v-else-if="modelValue" class="mt-1 text-xs text-gray-400 dark:text-neutral-500">
          You can change this any time from your store settings.
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string
  error?: string
  siteName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const siteName = computed(() => props.siteName || 'MarketX')
const open = ref(false)

const toggle = () => {
  open.value = !open.value
  if (!open.value) emit('update:modelValue', '')
}

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>
