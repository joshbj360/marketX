<template>
  <div class="feed-tab-bar" v-bind="$attrs">
    <div class="scrollbar-hide flex items-center gap-1 overflow-x-auto px-3 py-2">
      <button
        v-for="tab in FEED_TABS"
        :key="tab.id"
        class="feed-tab"
        :class="{ active: activeTab === tab.id }"
        @click="setTab(tab.id)"
      >
        <Icon :name="tab.icon" size="14" class="shrink-0" />
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFeedTab } from '~~/layers/feed/app/composables/useFeedTab'

defineOptions({ inheritAttrs: false })

const { activeTab, setTab, FEED_TABS } = useFeedTab()
</script>

<style scoped>
.feed-tab-bar {
  border-bottom: 1px solid rgba(0,0,0,0.06);
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
}

.dark .feed-tab-bar {
  border-bottom-color: rgba(255,255,255,0.06);
  background: rgba(10,10,15,0.95);
}

/* Hide on desktop — desktop uses SideNav */
@media (min-width: 768px) {
  .feed-tab-bar {
    display: none;
  }
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.feed-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.dark .feed-tab {
  color: #71717a;
}

.feed-tab:hover {
  color: #111827;
  background: rgba(0,0,0,0.05);
}

.dark .feed-tab:hover {
  color: #f4f4f5;
  background: rgba(255,255,255,0.06);
}

.feed-tab.active {
  color: #F43F5E;
  background: rgba(244, 63, 94, 0.08);
}

.dark .feed-tab.active {
  color: #F43F5E;
  background: rgba(244, 63, 94, 0.1);
}
</style>
