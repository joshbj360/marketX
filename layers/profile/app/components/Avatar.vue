<template>
  <div class="avatar-container">
    <img
      v-if="avatar && showImage"
      :src="imgAvatar(avatar)"
      class="avatar-image"
      :class="sizeClass"
      alt="User avatar"
      @error="showImage = false"
    />
    <div
      v-else
      class="avatar-placeholder"
      :class="sizeClass"
      :style="{ backgroundColor: bgColor }"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { imgAvatar } from '~~/layers/core/app/utils/cloudinary'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (v: string) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(v),
  },
})

// Reset on avatar change so a new valid URL is tried again
const showImage = ref(true)
watch(
  () => props.avatar,
  () => {
    showImage.value = true
  },
)

const sizeClass = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }
  return sizes[props.size] ?? sizes.md
})

const initials = computed(() =>
  props.username ? props.username.charAt(0).toUpperCase() : '?',
)

const bgColor = computed(() => {
  if (!props.username) return '#e2e8f0'
  const colors = [
    '#f87171',
    '#fb923c',
    '#fbbf24',
    '#a3e635',
    '#4ade80',
    '#2dd4bf',
    '#38bdf8',
    '#818cf8',
    '#c084fc',
    '#e879f9',
  ]
  const hash = props.username
    .split('')
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  return colors[Math.abs(hash) % colors.length]
})
</script>

<style scoped>
.avatar-container {
  display: inline-flex;
}

.avatar-image,
.avatar-placeholder {
  border-radius: 9999px;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}
</style>
