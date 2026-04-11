<template>
  <div class="relative">
    <!-- Textarea -->
    <textarea
      ref="inputRef"
      :value="modelValue"
      @input="onInput"
      @keydown="onKeydown"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :rows="rows"
      class="w-full resize-none bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
      :class="[inputClass, maxLength && remaining < 20 ? 'pr-12' : '']"
    />

    <!-- Toolbar: emoji + char count -->
    <div class="mt-1 flex items-center justify-between">
      <div class="flex items-center gap-1">
        <!-- Emoji toggle -->
        <button
          type="button"
          @click.stop="showPicker = !showPicker"
          class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-500 dark:hover:bg-neutral-800"
          :aria-label="showPicker ? 'Close emoji picker' : 'Add emoji'"
        >
          <Icon
            :name="showPicker ? 'mdi:emoticon' : 'mdi:emoticon-outline'"
            size="20"
          />
        </button>

        <slot name="toolbar" />
      </div>

      <!-- Character counter -->
      <span
        v-if="maxLength"
        class="text-xs tabular-nums"
        :class="
          remaining <= 0
            ? 'font-semibold text-red-500'
            : remaining < 20
              ? 'text-orange-500'
              : 'text-gray-400 dark:text-neutral-500'
        "
      >
        {{ remaining }}
      </span>
    </div>

    <!-- Emoji Picker -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="showPicker"
        class="mt-1 flex flex-wrap gap-1.5 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      >
        <button
          v-for="emoji in EMOJIS"
          :key="emoji"
          type="button"
          @click.stop="insertEmoji(emoji)"
          class="rounded p-0.5 text-lg leading-none transition-transform hover:scale-125 active:scale-95"
        >
          {{ emoji }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    maxLength?: number
    rows?: number
    inputClass?: string
    submitOnEnter?: boolean
  }>(),
  {
    placeholder: 'Write something…',
    rows: 1,
    submitOnEnter: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const inputRef = ref<HTMLTextAreaElement | null>(null)
const showPicker = ref(false)

const remaining = computed(() =>
  props.maxLength ? props.maxLength - props.modelValue.length : Infinity,
)

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

const onKeydown = (e: KeyboardEvent) => {
  if (props.submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('submit')
  }
}

const insertEmoji = (emoji: string) => {
  const el = inputRef.value
  if (!el) {
    emit('update:modelValue', props.modelValue + emoji)
    return
  }
  const start = el.selectionStart ?? props.modelValue.length
  const end = el.selectionEnd ?? props.modelValue.length
  const next =
    props.modelValue.slice(0, start) + emoji + props.modelValue.slice(end)
  emit('update:modelValue', next)
  // Restore cursor after emoji
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + emoji.length, start + emoji.length)
  })
}

/** Expose focus so parent can call textEditorRef.value?.focus() */
const focus = () => inputRef.value?.focus()
defineExpose({ focus })

const EMOJIS = [
  '😂', '❤️', '🔥', '😍', '👏', '😭', '🙏', '💯', '✨', '😎',
  '🥰', '😊', '🤣', '😅', '💪', '🤩', '😩', '🥺', '😤', '👀',
  '💀', '🫶', '🤍', '💕', '🎉', '👑', '💃', '🛍️', '✅', '🤯',
  '🌟', '💥', '🎯', '👍', '🤝', '🙌', '😆', '🥳', '😋', '🤤',
]
</script>
