<template>
  <Teleport to="body">
    <Transition name="pop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30" @click="$emit('close')" />

        <!-- Popup -->
        <div class="relative w-full max-w-[280px] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-neutral-900">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-neutral-800">
            <span class="text-[13px] font-bold text-gray-900 dark:text-neutral-100">
              {{ total > 0 ? `${total.toLocaleString()} ${total === 1 ? $t('post.like') : $t('post.likes')}` : $t('post.likes') }}
            </span>
            <button
              @click="$emit('close')"
              class="text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-neutral-200"
            >
              <Icon name="mdi:close" size="16" />
            </button>
          </div>

          <!-- List -->
          <div ref="listEl" class="max-h-[240px] overflow-y-auto" @scroll="onScroll">
            <!-- Skeleton -->
            <div v-if="loading && likers.length === 0">
              <div v-for="n in 4" :key="n" class="flex items-center gap-2.5 px-4 py-2">
                <div class="h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-neutral-800" />
                <div class="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-neutral-800" />
              </div>
            </div>

            <!-- Empty -->
            <div v-else-if="!loading && likers.length === 0" class="flex flex-col items-center gap-1.5 py-8 text-gray-400">
              <Icon name="mdi:heart-outline" size="28" />
              <p class="text-[12px]">{{ $t('post.noLikesYet') }}</p>
            </div>

            <!-- Rows -->
            <div v-else>
              <NuxtLink
                v-for="liker in likers"
                :key="liker.id"
                :to="`/profile/${liker.username}`"
                class="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/60"
                @click="$emit('close')"
              >
                <img
                  v-if="liker.avatar"
                  :src="imgAvatar(liker.avatar)"
                  :alt="liker.username"
                  class="h-7 w-7 shrink-0 rounded-full object-cover"
                />
                <div
                  v-else
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-neutral-700"
                >
                  <Icon name="mdi:account" size="16" />
                </div>
                <span class="truncate text-[13px] font-medium text-gray-900 dark:text-neutral-100">
                  {{ liker.username }}
                </span>
              </NuxtLink>

              <div v-if="loadingMore" class="flex justify-center py-2">
                <Icon name="mdi:loading" size="16" class="animate-spin text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { imgAvatar } from '~~/layers/core/app/utils/cloudinary'

interface Liker {
  id: string
  username: string
  avatar: string | null
}

const props = defineProps<{
  isOpen: boolean
  type: 'post' | 'product'
  targetId: string | number
}>()

defineEmits<{ close: [] }>()

const likers = ref<Liker[]>([])
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const offset = ref(0)
const limit = 20
const listEl = ref<HTMLElement | null>(null)

async function fetchLikers(reset = false) {
  if (reset) {
    likers.value = []
    offset.value = 0
    total.value = 0
  }

  if (offset.value === 0) loading.value = true
  else loadingMore.value = true

  try {
    const url =
      props.type === 'post'
        ? `/api/posts/${props.targetId}/likes`
        : `/api/commerce/products/${props.targetId}/likes`

    const res = await $fetch<{
      success: boolean
      data: { likes: Array<{ profile?: Liker; user?: Liker }>; total: number }
    }>(url, { query: { limit, offset: offset.value } })

    const rows = res.data.likes.map((l) => l.profile ?? l.user!)
    likers.value.push(...rows)
    total.value = res.data.total
    offset.value += rows.length
  } catch {
    // empty state handles it
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && offset.value < total.value && !loadingMore.value) {
    fetchLikers()
  }
}

watch(
  () => [props.isOpen, props.targetId] as const,
  ([open]) => { if (open) fetchLikers(true) },
)
</script>

<style scoped>
.pop-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.pop-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
