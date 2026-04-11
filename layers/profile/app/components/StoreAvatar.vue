<template>
  <div class="store-avatar-container" :class="sizeClass">
    <img
      v-if="logo && showImage"
      :src="imgAvatar(logo)"
      :alt="storeName"
      class="h-full w-full object-cover"
      @error="showImage = false"
    />
    <div
      v-else
      class="store-avatar-placeholder h-full w-full"
      :style="{ backgroundColor: bgColor }"
    >
      <Icon :name="'mdi:store'" :size="iconSize" class="text-white/90" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { imgAvatar } from '~~/layers/core/app/utils/cloudinary'

const props = defineProps({
  storeName: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md',
    validator: (v: string) => ['sm', 'md', 'lg', 'xl'].includes(v),
  },
})

const showImage = ref(true)
watch(
  () => props.logo,
  () => {
    showImage.value = true
  },
)

const sizeClass = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-12 h-12 rounded-xl',
  }
  return sizes[props.size] ?? sizes.md
})

const iconSize = computed(() => {
  const map: Record<string, string> = { sm: '14', md: '16', lg: '20', xl: '22' }
  return map[props.size] ?? '16'
})

const bgColor = computed(() => {
  if (!props.storeName) return '#f02c56'
  const colors = [
    '#f02c56',
    '#7c3aed',
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ]
  const hash = props.storeName
    .split('')
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  return colors[Math.abs(hash) % colors.length]
})
</script>

<style scoped>
.store-avatar-container {
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
}

.store-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
