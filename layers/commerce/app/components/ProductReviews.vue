<template>
  <div class="space-y-6 px-1">
    <!-- Summary -->
    <div
      v-if="meta && meta.total > 0"
      class="rounded-3xl bg-gray-50 p-5 dark:bg-neutral-800"
    >
      <div class="flex items-start gap-6">
        <!-- Big Rating -->
        <div class="flex shrink-0 flex-col items-center">
          <p
            class="text-6xl font-black leading-none text-gray-900 dark:text-white"
          >
            {{ meta.averageRating ? meta.averageRating.toFixed(1) : '—' }}
          </p>
          <StarRating
            :rating="meta.averageRating ?? 0"
            size="md"
            class="mt-1"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {{ meta.total }} review{{ meta.total > 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Rating Bars -->
        <div class="flex-1 space-y-2 pt-2">
          <div
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            class="flex items-center gap-3"
          >
            <span class="w-4 text-right text-sm font-medium text-gray-500">{{
              star
            }}</span>
            <Icon name="mdi:star" size="16" class="text-amber-400" />
            <div
              class="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700"
            >
              <div
                class="h-full rounded-full bg-amber-400 transition-all"
                :style="{ width: barWidth(star) }"
              />
            </div>
            <span class="w-8 text-xs text-gray-400">{{
              ratingCount(star)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Write Review -->
    <div
      v-if="profileStore.isLoggedIn && !userReview"
      class="rounded-3xl border border-dashed border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        What’s your experience?
      </p>

      <!-- Stars -->
      <div class="mb-5 flex gap-2">
        <button
          v-for="n in 5"
          :key="n"
          class="text-4xl transition-transform active:scale-110"
          @click="draftRating = n"
          @mouseenter="hoverRating = n"
          @mouseleave="hoverRating = 0"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
              :fill="n <= (hoverRating || draftRating) ? '#F59E0B' : '#e5e7eb'"
              class="transition-colors dark:fill-gray-700"
            />
          </svg>
        </button>
      </div>

      <textarea
        v-model="draftBody"
        rows="4"
        placeholder="Tell others what you liked (or didn’t like) about this product..."
        maxlength="2000"
        class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-[15px] focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand/30 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-900"
      />

      <div class="mt-4 flex items-center justify-between">
        <span class="text-xs text-gray-400">{{ draftBody.length }}/2000</span>
        <button
          :disabled="draftRating === 0 || submitting"
          class="rounded-2xl bg-brand px-7 py-3 text-sm font-semibold text-white shadow-md shadow-brand/20 transition active:scale-95 disabled:opacity-50"
          @click="submitReview"
        >
          {{ submitting ? 'Posting...' : 'Post Review' }}
        </button>
      </div>
    </div>

    <!-- Already Reviewed -->
    <div
      v-else-if="profileStore.isLoggedIn && userReview"
      class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    >
      <Icon name="mdi:check-circle" size="20" class="mr-2 inline" />
      You've already reviewed this product. Thank you!
    </div>

    <!-- Reviews List -->
    <div v-if="reviews.length" class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="rounded-3xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/10 to-violet-100 text-lg font-bold text-brand"
          >
            {{ (review.author?.username ?? 'U')[0].toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <span class="font-semibold">{{ review.author?.username }}</span>
              <StarRating :rating="review.rating" size="sm" />
            </div>
            <p
              v-if="review.title"
              class="mt-1 font-medium text-gray-800 dark:text-neutral-200"
            >
              {{ review.title }}
            </p>
            <p
              class="mt-1 text-[14.5px] leading-relaxed text-gray-600 dark:text-neutral-300"
            >
              {{ review.body }}
            </p>
            <p class="mt-3 text-xs text-gray-400">
              {{ timeAgo(review.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Empty State -->
    <div
      v-else-if="!loading"
      class="flex flex-col items-center py-16 text-center"
    >
      <div
        class="mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-white p-10 dark:from-neutral-800 dark:to-neutral-900"
      >
        <span class="text-7xl opacity-75">⭐</span>
      </div>
      <p class="text-2xl font-semibold text-gray-900 dark:text-white">
        No reviews yet
      </p>
      <p class="mt-3 max-w-[240px] text-gray-500 dark:text-neutral-400">
        Be the first to share your thoughts about this product
      </p>

      <button
        v-if="profileStore.isLoggedIn"
        class="mt-8 flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-6 py-3.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand dark:border-neutral-700"
        @click="$el.querySelector('textarea')?.focus()"
      >
        <Icon name="mdi:pen-plus" size="20" />
        Write the first review
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !reviews.length" class="flex justify-center py-12">
      <Icon name="mdi:loading" size="28" class="animate-spin text-brand" />
    </div>

    <!-- Load More -->
    <button
      v-if="hasMore"
      class="w-full rounded-2xl border border-gray-200 py-3.5 text-sm font-medium dark:border-neutral-700"
      :disabled="loading"
      @click="loadMore"
    >
      {{ loading ? 'Loading more...' : 'Load more reviews' }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { notify } from '@kyvg/vue3-notification'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import StarRating from './StarRating.vue'
const timeAgo = (date: string | Date): string => {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(date).toLocaleDateString()
}
const ratingLabel = (n: number) =>
  ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][n] ?? ''
const props = defineProps<{ productId: number }>()
const profileStore = useProfileStore()
const reviews = ref<any[]>([])
const meta = ref<{
  total: number
  averageRating: number | null
  hasMore: boolean
  distribution?: Record<number, number>
} | null>(null)
const loading = ref(false)
const hasMore = ref(false)
let offset = 0
const draftRating = ref(0)
const hoverRating = ref(0)
const draftBody = ref('')
const submitting = ref(false)
const userReview = ref<any>(null)
const ratingCount = (star: number) => {
  return meta.value?.distribution?.[star] ?? 0
}
const barWidth = (star: number) => {
  const total = meta.value?.total ?? 0
  if (!total) return '0%'
  return `${Math.round((ratingCount(star) / total) * 100)}%`
}
const fetchReviews = async (reset = false) => {
  if (reset) {
    offset = 0
    reviews.value = []
  }
  loading.value = true
  try {
    const res: any = await $fetch(`/api/products/${props.productId}/reviews`, {
      query: { limit: 5, offset },
    })
    reviews.value = offset === 0 ? res.data : [...reviews.value, ...res.data]
    meta.value = res.meta
    hasMore.value = res.meta.hasMore
  } catch {
    // non-critical
  } finally {
    loading.value = false
  }
}
const loadMore = async () => {
  offset += 5
  await fetchReviews()
}
const submitReview = async () => {
  if (draftRating.value === 0) return
  submitting.value = true
  try {
    await $fetch(`/api/products/${props.productId}/reviews`, {
      method: 'POST',
      body: { rating: draftRating.value, body: draftBody.value || undefined },
    })
    notify({ type: 'success', text: 'Review posted!' })
    draftRating.value = 0
    draftBody.value = ''
    await fetchReviews(true)
  } catch (e: any) {
    notify({
      type: 'error',
      text: e?.data?.statusMessage || 'Failed to post review',
    })
  } finally {
    submitting.value = false
  }
}
onMounted(fetchReviews)
</script>
