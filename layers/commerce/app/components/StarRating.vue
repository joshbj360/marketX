<template>
  <div
    class="flex items-center gap-0.5"
    :aria-label="`${rating} out of 5 stars`"
  >
    <svg
      v-for="n in 5"
      :key="n"
      :width="sizeMap[size ?? 'md']"
      :height="sizeMap[size ?? 'md']"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="`star-grad-${uid}-${n}`" x1="0" y1="0" x2="1" y2="0">
          <stop :offset="`${fillPercent(n)}%`" stop-color="#F59E0B" />
          <stop :offset="`${fillPercent(n)}%`" stop-color="transparent" />
        </linearGradient>
      </defs>
      <!-- Background (empty) star -->
      <path
        d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
        :fill="emptyColor"
      />
      <!-- Filled overlay using gradient -->
      <path
        d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
        :fill="`url(#star-grad-${uid}-${n})`"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  rating: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

const uid = Math.random().toString(36).slice(2, 7)

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 22,
}

const emptyColor = 'currentColor'

// For each star n (1-5), returns how much of the star to fill (0–100)
const fillPercent = (n: number): number => {
  const r = props.rating
  if (r >= n) return 100
  if (r <= n - 1) return 0
  return Math.round((r - (n - 1)) * 100)
}

// dark-aware empty star color via class — use text-gray-200 / dark:text-neutral-700
</script>

<style scoped>
svg {
  color: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  svg {
    color: #404040;
  }
}

:global(.dark) svg {
  color: #404040;
}
</style>
