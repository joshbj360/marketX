<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black">
    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center gap-3 text-white">
      <Icon name="eos-icons:loading" size="32" class="animate-spin" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="flex flex-col items-center gap-4 px-6 text-center"
    >
      <Icon name="mdi:alert-circle-outline" size="48" class="text-red-400" />
      <p class="font-medium text-white">{{ error }}</p>
      <NuxtLink to="/" class="text-sm text-white/70 underline hover:text-white"
        >Go home</NuxtLink
      >
    </div>

    <!-- Story viewer -->
    <div v-else-if="story" class="relative mx-auto h-full w-full max-w-sm">
      <!-- Progress bar -->
      <div class="absolute left-0 right-0 top-0 z-10 px-3 pt-3">
        <div class="h-0.5 overflow-hidden rounded-full bg-white/30">
          <div
            class="h-full rounded-full bg-white transition-none"
            :style="{
              width: `${progress}%`,
              transition: `width ${DURATION / 1000}s linear`,
            }"
          />
        </div>
      </div>

      <!-- Header -->
      <div
        class="absolute left-0 right-0 top-5 z-10 flex items-center justify-between px-4"
      >
        <NuxtLink
          :to="`/sellers/profile/${story.author?.username}`"
          class="flex items-center gap-2"
        >
          <img
            :src="story.author?.avatar || ''"
            class="h-9 w-9 rounded-full border-2 border-white bg-neutral-700 object-cover"
          />
          <div>
            <p class="text-sm font-semibold leading-tight text-white">
              {{ story.author?.username }}
            </p>
            <p class="text-[10px] text-white/60">{{ timeAgo }}</p>
          </div>
        </NuxtLink>
        <button
          @click="goBack"
          class="rounded-full p-2 text-white transition-colors hover:bg-white/10"
        >
          <Icon name="mdi:close" size="22" />
        </button>
      </div>

      <!-- Media -->
      <div
        class="flex h-full w-full items-center justify-center"
        @click="handleTap"
      >
        <video
          v-if="story.media?.type === 'VIDEO'"
          ref="videoEl"
          :src="story.media.url"
          class="h-full w-full object-cover"
          autoplay
          muted
          playsinline
          @ended="goBack"
        />
        <img
          v-else
          :src="story.media?.url || ''"
          class="h-full w-full object-cover"
        />
      </div>

      <!-- Product tag -->
      <div v-if="story.product" class="absolute bottom-20 left-4 right-4 z-10">
        <NuxtLink
          :to="`/discover?product=${story.product.id}`"
          class="flex items-center gap-3 rounded-2xl bg-black/60 p-3 backdrop-blur-sm"
          @click.stop
        >
          <img
            :src="story.product.bannerImageUrl || ''"
            class="h-12 w-12 shrink-0 rounded-xl bg-neutral-700 object-cover"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-semibold text-white">
              {{ story.product.title }}
            </p>
            <p class="mt-0.5 text-[11px] text-white/70">
              {{ formatPrice(story.product.price) }}
            </p>
          </div>
          <div
            class="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-black"
          >
            Shop
          </div>
        </NuxtLink>
      </div>

      <!-- Expiry -->
      <div class="absolute bottom-6 left-0 right-0 z-10 flex justify-center">
        <p class="text-[10px] text-white/40">Expires {{ expiryText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStoryApi } from '~~/layers/feed/app/services/story.api'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const api = useStoryApi()

const storyId = computed(() => route.params.id as string)
const story = ref<any>(null)
const isLoading = ref(true)
const error = ref('')
const progress = ref(0)
const videoEl = ref<HTMLVideoElement | null>(null)

const DURATION = 5000 // ms for image stories
let timer: ReturnType<typeof setTimeout> | null = null
let progressInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  try {
    const res: any = await api.getStoryById(storyId.value)
    story.value = res?.data
    if (story.value?.media?.type !== 'VIDEO') startProgress()
  } catch (e: any) {
    error.value = e.message || 'Story not found or expired'
  } finally {
    isLoading.value = false
  }
})

const startProgress = () => {
  progress.value = 0
  const step = 100 / (DURATION / 100)
  progressInterval = setInterval(() => {
    progress.value = Math.min(progress.value + step, 100)
  }, 100)
  timer = setTimeout(() => goBack(), DURATION)
}

const handleTap = () => {
  if (story.value?.media?.type === 'VIDEO') return
  // tap left half = previous (just go back), tap right half = skip
  goBack()
}

const goBack = () => {
  if (timer) clearTimeout(timer)
  if (progressInterval) clearInterval(progressInterval)
  router.back()
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (progressInterval) clearInterval(progressInterval)
})

const timeAgo = computed(() => {
  if (!story.value?.created_at) return ''
  const diff = Date.now() - new Date(story.value.created_at).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`
  return `${h}h ago`
})

const expiryText = computed(() => {
  if (!story.value?.expiresAt) return ''
  const diff = new Date(story.value.expiresAt).getTime() - Date.now()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'soon'
  return `in ${h}h`
})

import { formatProductPrice } from '~~/shared/utils/currency'
const formatPrice = (price: number) => formatProductPrice(price, 'NGN')
</script>
