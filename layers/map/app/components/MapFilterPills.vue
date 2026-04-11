<!-- layers/map/app/components/MapFilterPills.vue -->
<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
    <button
      v-for="pill in pills"
      :key="pill.value"
      class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all"
      :class="active === pill.value
        ? 'bg-white text-gray-900 shadow-md'
        : 'bg-black/30 text-white/80 backdrop-blur-md hover:bg-black/50'"
      @click="$emit('update:active', pill.value)"
    >
      <Icon :name="pill.icon" size="14" />
      {{ pill.label }}
      <span
        v-if="pill.count !== undefined"
        class="ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black"
        :class="active === pill.value ? 'bg-brand/15 text-brand' : 'bg-white/15 text-white/70'"
      >{{ pill.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MapFilter } from '../types/map.types'

const props = defineProps<{
  active: MapFilter
  totalCount?: number
  dealCount?: number
  premiumCount?: number
  verifiedCount?: number
}>()

defineEmits<{ 'update:active': [filter: MapFilter] }>()

const pills = computed(() => [
  { value: 'all' as MapFilter,      icon: 'mdi:map-marker-multiple-outline', label: 'All',      count: props.totalCount },
  { value: 'deals' as MapFilter,    icon: 'mdi:tag-outline',                 label: 'Deals',    count: props.dealCount },
  { value: 'premium' as MapFilter,  icon: 'mdi:crown-outline',               label: 'Premium',  count: props.premiumCount },
  { value: 'verified' as MapFilter, icon: 'mdi:shield-check-outline',        label: 'Verified', count: props.verifiedCount },
])
</script>

<style scoped>
.scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
