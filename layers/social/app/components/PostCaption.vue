<template>
  <!-- eslint-disable vue/no-v-html -->
  <span v-html="rendered" class="post-caption" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  caption?: string | null
  mentions?: Array<{ type: 'seller' | 'user'; handle: string }> | null
  lineClamp?: number
}>()

const rendered = computed(() => {
  const text = props.caption?.trim()
  if (!text) return ''

  // Build mention handle → route map from structured mentions array
  const mentionMap = new Map<string, string>()
  for (const m of props.mentions ?? []) {
    const route = m.type === 'seller'
      ? `/sellers/profile/${m.handle}`
      : `/profile/${m.handle}`
    mentionMap.set(m.handle.toLowerCase(), route)
  }

  // 1. HTML-escape to prevent XSS before injecting any HTML
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // 2. Hashtags → brand-coloured links
  const withTags = escaped.replace(
    /(?<!\w)#([a-zA-Z][a-zA-Z0-9_]{0,29})/g,
    (_, tag) =>
      `<a href="/discover?tab=all&amp;q=%23${encodeURIComponent(tag.toLowerCase())}" class="text-brand font-medium hover:underline">#${tag}</a>`,
  )

  // 3. Mentions → profile/store links (uses mentions map if available, falls back to seller profile)
  const withMentions = withTags.replace(
    /(?<!\w)@([a-zA-Z0-9][a-zA-Z0-9_-]{0,49})/g,
    (_, handle) => {
      const route = mentionMap.get(handle.toLowerCase()) ?? `/sellers/profile/${handle}`
      return `<a href="${route}" class="text-brand font-medium hover:underline">@${handle}</a>`
    },
  )

  return withMentions
})
</script>

<style scoped>
.post-caption :deep(a) {
  cursor: pointer;
}
</style>
