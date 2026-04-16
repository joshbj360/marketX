<template>
  <div class="p-4">
    <!-- View toggle -->
    <div class="mb-4 flex gap-2">
      <button
        v-for="v in views"
        :key="v.key"
        @click="activeView = v.key"
        class="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all"
        :class="
          activeView === v.key
            ? 'bg-brand text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
        "
      >
        <Icon :name="v.icon" size="14" />
        {{ v.label }}
      </button>
    </div>

    <!-- ── POSTS VIEW ── -->
    <template v-if="activeView === 'posts'">
      <!-- Skeleton -->
      <div
        v-if="postsLoading && likedPosts.length === 0"
        class="grid grid-cols-3 gap-0.5"
      >
        <div
          v-for="i in 9"
          :key="i"
          class="aspect-square animate-pulse rounded-sm bg-gray-100 dark:bg-neutral-800"
        />
      </div>

      <!-- Empty -->
      <div
        v-else-if="likedPosts.length === 0"
        class="flex flex-col items-center justify-center gap-3 py-12"
      >
        <Icon
          name="mdi:heart-outline"
          size="48"
          class="text-gray-300 dark:text-neutral-700"
        />
        <p class="text-[13px] text-gray-500 dark:text-neutral-400">
          No liked posts yet
        </p>
      </div>

      <!-- Grid -->
      <div v-else>
        <div class="grid grid-cols-3 gap-0.5">
          <button
            v-for="post in likedPosts"
            :key="post.id"
            @click="openPost(post)"
            class="group relative aspect-square overflow-hidden rounded-sm bg-gray-100 dark:bg-neutral-800"
          >
            <img
              v-if="firstMedia(post)?.type === 'IMAGE'"
              :src="firstMedia(post)!.url"
              :alt="post.caption || 'Liked post'"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <img
              v-else-if="firstMedia(post)?.type === 'VIDEO'"
              :src="videoThumb(firstMedia(post)!.url)"
              :alt="post.caption || 'Post'"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center p-3"
              :class="contentTypeGradient(post.contentType)"
            >
              <p
                class="line-clamp-4 text-center text-[11px] font-medium leading-relaxed text-white"
              >
                {{ post.caption || post.content || '…' }}
              </p>
            </div>

            <!-- Hover overlay -->
            <div
              class="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div class="flex items-center gap-1 text-white drop-shadow">
                <Icon name="mdi:heart" size="18" />
                <span class="text-[12px] font-semibold">{{
                  formatNum(post._count?.likes || 0)
                }}</span>
              </div>
              <div class="flex items-center gap-1 text-white drop-shadow">
                <Icon name="mdi:comment" size="18" />
                <span class="text-[12px] font-semibold">{{
                  formatNum(post._count?.comments || 0)
                }}</span>
              </div>
            </div>

            <!-- Multi-image indicator -->
            <div
              class="pointer-events-none absolute right-1.5 top-1.5 flex flex-col items-end gap-1"
            >
              <Icon
                v-if="firstMedia(post)?.type === 'VIDEO'"
                name="mdi:play-circle"
                size="16"
                class="text-white drop-shadow-lg"
              />
              <Icon
                v-if="(post.mediaItems?.length || 0) > 1"
                name="mdi:layers"
                size="16"
                class="text-white drop-shadow-lg"
              />
              <!-- Heart badge -->
              <Icon
                name="mdi:heart"
                size="14"
                class="text-red-400 drop-shadow-lg"
              />
            </div>
          </button>
        </div>

        <div v-if="postsHasMore" class="mt-4 flex justify-center">
          <button
            @click="loadMorePosts"
            :disabled="postsLoading"
            class="rounded-lg px-6 py-2 text-[13px] font-semibold text-brand hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-neutral-800"
          >
            {{ postsLoading ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ── PRODUCTS VIEW ── -->
    <template v-else>
      <!-- Skeleton -->
      <div
        v-if="productsLoading && likedProducts.length === 0"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="aspect-[3/4] bg-gray-100 dark:bg-neutral-800" />
          <div class="space-y-2 p-3">
            <div class="h-3 w-3/4 rounded bg-gray-100 dark:bg-neutral-800" />
            <div class="h-3 w-1/2 rounded bg-gray-100 dark:bg-neutral-800" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="likedProducts.length === 0"
        class="flex flex-col items-center justify-center gap-3 py-12"
      >
        <Icon
          name="mdi:heart-box-outline"
          size="48"
          class="text-gray-300 dark:text-neutral-700"
        />
        <p class="text-[13px] text-gray-500 dark:text-neutral-400">
          No liked products yet
        </p>
        <p class="text-[11px] text-gray-400 dark:text-neutral-500">
          Tap ♥ on any product to save it here
        </p>
      </div>

      <!-- Grid -->
      <div v-else>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NuxtLink
            v-for="product in likedProducts"
            :key="product.id"
            :to="`/sellers/profile/${product.seller?.store_slug}`"
            class="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <!-- Image -->
            <div
              class="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-neutral-800"
            >
              <img
                v-if="product.media?.[0]?.url"
                :src="product.media[0].url"
                :alt="product.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Icon
                  name="mdi:package-variant"
                  size="32"
                  class="text-gray-300 dark:text-neutral-600"
                />
              </div>
              <!-- Liked badge -->
              <div
                class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm dark:bg-neutral-900/90"
              >
                <Icon name="mdi:heart" size="14" class="text-red-500" />
              </div>
              <!-- Affiliate pill -->
              <div
                v-if="product.affiliateCommission"
                class="absolute bottom-2 left-2 rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
              >
                {{ product.affiliateCommission }}% affiliate
              </div>
            </div>
            <!-- Info -->
            <div class="p-3">
              <p
                class="truncate text-[13px] font-bold text-gray-900 transition-colors group-hover:text-brand dark:text-neutral-100"
              >
                {{ product.title }}
              </p>
              <p class="mt-0.5 text-[12px] font-semibold text-brand">
                {{ formatKobo(product.price) }}
              </p>
              <p
                class="mt-0.5 truncate text-[10px] text-gray-400 dark:text-neutral-500"
              >
                {{ product.seller?.store_name }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <div v-if="productsHasMore" class="mt-4 flex justify-center">
          <button
            @click="loadMoreProducts"
            :disabled="productsLoading"
            class="rounded-lg px-6 py-2 text-[13px] font-semibold text-brand hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-neutral-800"
          >
            {{ productsLoading ? 'Loading…' : 'Load more' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Post detail modal -->
    <PostDetailModal
      v-if="selectedPost"
      :post="selectedPost"
      @close="selectedPost = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePostStore } from '~~/layers/social/app/store/post.store'
import { usePost } from '~~/layers/social/app/composables/usePost'
import PostDetailModal from '~~/layers/social/app/components/modals/PostDetailModal.vue'
import { useProductApi } from '~~/layers/commerce/app/services/product.api'
import { useCurrency } from '~~/layers/core/app/composables/useCurrency'
import { videoThumb } from '~~/layers/core/app/utils/cloudinary'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const props = defineProps<{ username: string }>()

const postStore = usePostStore()
const {
  fetchUserLikedPosts,
  isLoading: postsLoading,
  normalizePost,
} = usePost()
const { formatKobo } = useCurrency()

const activeView = ref<'posts' | 'products'>('posts')
const views = [
  { key: 'posts', label: 'Posts', icon: 'mdi:grid' },
  { key: 'products', label: 'Products', icon: 'mdi:shopping-outline' },
]

// ── Posts ──────────────────────────────────────────────────────────────────
const selectedPost = ref<IFeedItem | null>(null)
const postsHasMore = ref(false)
const postsOffset = ref(0)
const POSTS_LIMIT = 20

const likedPosts = computed(() =>
  postStore.getLikedPostsByUsername(props.username),
)

onMounted(async () => {
  if (likedPosts.value.length === 0) await loadPosts()
  await loadProducts()
})

async function loadPosts() {
  const result = await fetchUserLikedPosts(
    props.username,
    POSTS_LIMIT,
    postsOffset.value,
  )
  postsHasMore.value = result?.meta?.hasMore ?? false
}

const loadMorePosts = async () => {
  postsOffset.value += POSTS_LIMIT
  await loadPosts()
}

const firstMedia = (post: any) => {
  if (post.mediaItems?.length) return post.mediaItems[0]
  if (Array.isArray(post.media)) return post.media[0] ?? null
  return post.media ?? null
}

const openPost = (post: any) => {
  selectedPost.value = normalizePost(post)
}

// ── Products ───────────────────────────────────────────────────────────────
const likedProducts = ref<any[]>([])
const productsLoading = ref(false)
const productsHasMore = ref(false)
const productsOffset = ref(0)
const PRODUCTS_LIMIT = 12

async function loadProducts(reset = false) {
  if (reset) {
    likedProducts.value = []
    productsOffset.value = 0
  }
  productsLoading.value = true
  try {
    const res: any = await useProductApi().getLikedProducts({
      limit: PRODUCTS_LIMIT,
      offset: productsOffset.value,
    })
    likedProducts.value.push(...(res?.data ?? []))
    productsHasMore.value = res?.meta?.hasMore ?? false
  } catch {
    /* silent */
  } finally {
    productsLoading.value = false
  }
}

const loadMoreProducts = async () => {
  productsOffset.value += PRODUCTS_LIMIT
  await loadProducts()
}

// ── Helpers ────────────────────────────────────────────────────────────────
const formatNum = (n: number) =>
  n >= 1_000 ? `${(n / 1_000).toFixed(1)}k` : n.toString()

const contentTypeGradient = (type?: string) => {
  const map: Record<string, string> = {
    EXPERIENCE: 'bg-gradient-to-br from-blue-500 to-blue-700',
    INSPIRATION: 'bg-gradient-to-br from-amber-400 to-amber-600',
    COMMERCE: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
    EDUCATIONAL: 'bg-gradient-to-br from-orange-500 to-orange-700',
    ENTERTAINMENT: 'bg-gradient-to-br from-pink-500 to-pink-700',
  }
  return map[type ?? ''] ?? 'bg-gradient-to-br from-gray-400 to-gray-600'
}
</script>
