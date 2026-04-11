<template>
  <div v-if="!expired" class="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
    <Icon name="mdi:clock-outline" size="11" class="shrink-0" />
    <span>{{ display }}</span>
  </div>
  <div v-else class="text-[10px] font-semibold text-gray-400">Deal ended</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ endsAt: string }>()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const remaining = computed(() => new Date(props.endsAt).getTime() - now.value)
const expired = computed(() => remaining.value <= 0)

const display = computed(() => {
  const ms = remaining.value
  if (ms <= 0) return ''
  const s = Math.floor(ms / 1000)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60

  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${mins}m left`
  if (mins > 0) return `${mins}m ${secs}s left`
  return `${secs}s left`
})

onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>
