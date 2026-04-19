<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      >
        <div
          class="flex min-w-[200px] flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-2xl dark:bg-neutral-900"
        >
          <!-- Saving -->
          <template v-if="state === 'saving'">
            <Icon name="eos-icons:loading" size="32" class="animate-spin text-brand" />
            <p class="text-sm font-semibold text-gray-700 dark:text-neutral-300">
              {{ savingText }}
            </p>
          </template>

          <!-- Success -->
          <template v-else-if="state === 'success'">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <Icon name="mdi:check-circle" size="28" class="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-neutral-300">
              {{ successText }}
            </p>
          </template>

          <!-- Error -->
          <template v-else-if="state === 'error'">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <Icon name="mdi:alert-circle" size="28" class="text-red-500 dark:text-red-400" />
            </div>
            <p class="max-w-[220px] text-center text-sm font-semibold text-gray-700 dark:text-neutral-300">
              {{ errorText || 'Something went wrong' }}
            </p>
            <button
              @click="visible = false"
              class="mt-1 rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-300 dark:border-neutral-700 dark:text-neutral-400"
            >
              Dismiss
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  saving: boolean
  success?: boolean
  error?: string | null
  savingText?: string
  successText?: string
  successDuration?: number
}>(), {
  savingText: 'Saving…',
  successText: 'Saved!',
  successDuration: 1500,
})

const visible = ref(false)
const state = ref<'saving' | 'success' | 'error'>('saving')
const errorText = ref<string | null>(null)

let dismissTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.saving, (isSaving) => {
  if (isSaving) {
    state.value = 'saving'
    visible.value = true
    if (dismissTimer) clearTimeout(dismissTimer)
  }
})

watch(() => props.success, (isSuccess) => {
  if (isSuccess) {
    state.value = 'success'
    visible.value = true
    dismissTimer = setTimeout(() => {
      visible.value = false
    }, props.successDuration)
  }
})

watch(() => props.error, (err) => {
  if (err) {
    errorText.value = err
    state.value = 'error'
    visible.value = true
    if (dismissTimer) clearTimeout(dismissTimer)
  }
})

onUnmounted(() => {
  if (dismissTimer) clearTimeout(dismissTimer)
})
</script>
