<template>
  <div class="custom-scrollbar h-full overflow-y-auto p-4">
    <div v-if="post" class="space-y-5 pb-6">

      <!-- ── CONTENT TYPE BADGE ──────────────────────────────── -->
      <div class="flex items-center gap-2">
        <span
          class="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
          :style="{ background: accentGradient }"
        >
          {{ post.contentType }}
        </span>
      </div>

      <!-- ── AUTHOR CARD ─────────────────────────────────────── -->
      <div
        class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
      >
        <p class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
          Posted by
        </p>
        <NuxtLink
          :to="`/profile/${post.author.username}`"
          class="group flex items-center gap-3"
        >
          <div class="relative shrink-0">
            <div
              class="h-12 w-12 overflow-hidden rounded-full bg-gray-200 ring-2 ring-white dark:bg-neutral-700 dark:ring-neutral-900"
            >
              <img
                v-if="post.author.avatar"
                :src="imgThumb(post.author.avatar, 96, 96)"
                :alt="post.author.username"
                class="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-sm font-black text-brand"
              >
                {{ post.author.username.slice(0, 2).toUpperCase() }}
              </div>
            </div>
            <span
              v-if="post.author.role === 'seller'"
              class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white dark:ring-neutral-900"
            >
              <Icon name="mdi:check" size="10" class="text-white" />
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-bold text-gray-900 transition-colors group-hover:text-brand dark:text-white">
              {{ post.author.username }}
            </p>
            <p class="text-xs text-gray-400 dark:text-neutral-500 capitalize">
              {{ post.author.role }}
            </p>
          </div>
        </NuxtLink>
        <NuxtLink
          :to="`/profile/${post.author.username}`"
          class="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 shadow-sm transition-all hover:border-brand/30 hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-brand"
        >
          View profile <Icon name="mdi:arrow-right" size="13" />
        </NuxtLink>
      </div>

      <!-- ── MORE FROM THIS AUTHOR ──────────────────────────── -->
      <div
        class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
      >
        <div class="mb-3 flex items-center justify-between">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
            More from @{{ post.author.username }}
          </p>
          <NuxtLink
            :to="`/profile/${post.author.username}`"
            class="text-[11px] font-semibold text-gray-400 hover:text-brand dark:text-neutral-500"
          >
            All →
          </NuxtLink>
        </div>

        <!-- Skeleton -->
        <div v-if="loadingMore" class="grid grid-cols-3 gap-1.5">
          <div
            v-for="i in 6"
            :key="i"
            class="aspect-square animate-pulse rounded-lg bg-gray-200 dark:bg-neutral-700"
          />
        </div>

        <!-- Grid -->
        <div v-else-if="morePosts.length" class="grid grid-cols-3 gap-1.5">
          <NuxtLink
            v-for="p in morePosts"
            :key="p.id"
            :to="`/post/${p.id}`"
            class="group relative aspect-square overflow-hidden rounded-lg bg-black"
          >
            <img
              v-if="postThumb(p)"
              :src="postThumb(p)!"
              class="h-full w-full object-cover opacity-90 transition-all duration-200 group-hover:scale-105 group-hover:opacity-100"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-neutral-800"
            >
              <Icon name="mdi:text-box-outline" size="20" class="text-gray-400" />
            </div>
            <!-- Video indicator -->
            <div
              v-if="firstMedia(p)?.type === 'VIDEO'"
              class="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-0.5"
            >
              <Icon name="mdi:play" size="10" class="text-white" />
            </div>
          </NuxtLink>
        </div>

        <p
          v-else-if="!loadingMore"
          class="py-4 text-center text-xs text-gray-400 dark:text-neutral-500"
        >
          No other posts yet
        </p>
      </div>

      <!-- ── TAGGED PRODUCTS ────────────────────────────────── -->
      <div
        v-if="taggedProducts.length"
        class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/40"
      >
        <p class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
          Products in this post
        </p>
        <div class="space-y-2.5">
          <NuxtLink
            v-for="prod in taggedProducts"
            :key="prod.id"
            :to="prod.slug ? `/product/${prod.slug}` : '#'"
            class="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60"
          >
            <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-700">
              <img
                v-if="productThumb(prod)"
                :src="productThumb(prod)!"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Icon name="mdi:package-variant-closed" size="18" class="text-gray-400" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-brand dark:text-white">
                {{ prod.name || 'Product' }}
              </p>
              <p v-if="prod.price" class="text-xs font-bold text-brand">
                {{ formatPrice(prod.price) }}
              </p>
            </div>
            <Icon name="mdi:chevron-right" size="16" class="shrink-0 text-gray-300 group-hover:text-brand dark:text-neutral-600" />
          </NuxtLink>
        </div>
      </div>

    </div>

    <!-- Blank state before post loads -->
    <div v-else class="space-y-4 p-1">
      <div
        v-for="i in 3"
        :key="i"
        class="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { usePostApi } from '../services/post.api'
import { imgThumb } from '~~/layers/core/app/utils/cloudinary'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import type { IPost, IProduct } from '../types/post.types'

const props = defineProps<{ post: IFeedItem | null }>()

const postApi = usePostApi()
const morePosts = ref<IPost[]>([])
const loadingMore = ref(false)

const ACCENT: Record<string, string> = {
  EXPERIENCE: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  INSPIRATION: 'linear-gradient(135deg, #f59e0b, #b45309)',
  COMMERCE: 'linear-gradient(135deg, #22c55e, #15803d)',
  EDUCATIONAL: 'linear-gradient(135deg, #f97316, #c2410c)',
  ENTERTAINMENT: 'linear-gradient(135deg, #ec4899, #be185d)',
}

const accentGradient = computed(() =>
  props.post ? (ACCENT[props.post.contentType] ?? 'linear-gradient(135deg, #9ca3af, #6b7280)') : '',
)

const taggedProducts = computed(() =>
  (props.post?.taggedProducts ?? []) as Partial<IProduct>[],
)

const firstMedia = (p: IPost) => {
  const arr = Array.isArray(p.media) ? p.media : p.media ? [p.media] : []
  return arr.find((m: any) => !m.isBgMusic) ?? null
}

const postThumb = (p: IPost): string | null => {
  const m = firstMedia(p)
  if (!m) return null
  const raw = m.thumbnailUrl || m.url
  return imgThumb(raw, 200, 200)
}

const productThumb = (prod: Partial<IProduct>): string | null => {
  const url = (prod as any).media?.[0]?.url ?? (prod as any).thumbnailUrl ?? null
  return url ? imgThumb(url, 96, 96) : null
}

const formatPrice = (price: number | string) => {
  const n = Number(price)
  return isNaN(n) ? String(price) : `₦${n.toLocaleString()}`
}

const loadMorePosts = async () => {
  if (!props.post?.author?.username) return
  loadingMore.value = true
  try {
    const res = await postApi.getUserPosts(props.post.author.username, 7)
    const all: IPost[] = res.data ?? []
    morePosts.value = all.filter((p) => p.id !== props.post!.id).slice(0, 6)
  } catch {
    // silently ignore — sidebar is non-critical
  } finally {
    loadingMore.value = false
  }
}

onMounted(loadMorePosts)

watch(
  () => props.post?.id,
  () => {
    morePosts.value = []
    loadMorePosts()
  },
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
.custom-scrollbar { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
.dark .custom-scrollbar { scrollbar-color: #4b5563 transparent; }
</style>
