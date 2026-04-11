<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 bg-white dark:bg-neutral-950">
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div
          class="flex items-center gap-4 border-b border-gray-200 p-4 dark:border-neutral-800"
        >
          <button class="md:hidden" @click="$emit('close')">
            <Icon name="mdi:arrow-left" size="24" />
          </button>
          <div class="relative flex-1">
            <Icon
              name="mdi:magnify"
              size="20"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products, stores, posts… or @username"
              autofocus
              class="w-full rounded-lg bg-gray-100 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
            />
          </div>
          <button
            v-if="searchQuery"
            class="text-gray-500 dark:text-neutral-400"
            @click="searchQuery = ''"
          >
            <Icon name="mdi:close" size="20" />
          </button>
        </div>

        <!-- Results -->
        <div class="flex-1 overflow-y-auto">
          <!-- Empty State -->
          <div
            v-if="!searchQuery"
            class="py-20 text-center text-gray-500 dark:text-neutral-400"
          >
            <Icon name="mdi:magnify" size="48" class="mx-auto mb-3" />
            <p>Search for users, stores, products, or posts</p>
          </div>

          <!-- Loading -->
          <div v-else-if="isSearching" class="flex justify-center py-20">
            <Icon name="eos-icons:loading" size="32" class="text-brand" />
          </div>

          <!-- No Results -->
          <div
            v-else-if="searchQuery && !hasResults"
            class="py-20 text-center text-gray-500 dark:text-neutral-400"
          >
            <Icon name="mdi:magnify-close" size="48" class="mx-auto mb-3" />
            <p>No results for "{{ searchQuery }}"</p>
          </div>

          <!-- Results Sections -->
          <div v-else class="space-y-6 p-4">
            <!-- Users -->
            <div v-if="results.data.users.length">
              <h3
                class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
              >
                People
              </h3>
              <div class="space-y-1">
                <button
                  v-for="user in results.data.users"
                  :key="user.id"
                  class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                  @click="navigateToUser(user.username)"
                >
                  <img
                    v-if="user.avatar"
                    :src="imgAvatar(user.avatar)"
                    :alt="user.username"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700"
                  >
                    <Icon name="mdi:account" size="20" class="text-gray-400" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate font-medium text-gray-900 dark:text-neutral-100"
                    >
                      {{ user.full_name || user.username }}
                    </p>
                    <p
                      class="truncate text-sm text-gray-500 dark:text-neutral-400"
                    >
                      @{{ user.username }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Stores -->
            <div v-if="results.data.stores.length">
              <h3
                class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
              >
                Stores
              </h3>
              <div class="space-y-1">
                <button
                  v-for="store in results.data.stores"
                  :key="store.id"
                  class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                  @click="navigateToStore(store.store_slug)"
                >
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
                  >
                    <img
                      v-if="store.store_logo"
                      :src="imgAvatar(store.store_logo)"
                      :alt="store.store_name"
                      class="h-full w-full object-cover"
                    />
                    <Icon
                      v-else
                      name="mdi:store"
                      size="20"
                      class="text-gray-400"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate font-medium text-gray-900 dark:text-neutral-100"
                    >
                      {{ store.store_name }}
                    </p>
                    <p
                      class="truncate text-xs text-gray-500 dark:text-neutral-400"
                    >
                      {{ store.followers_count }} followers
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="results.data.tags.length">
              <h3
                class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
              >
                Tags
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in results.data.tags"
                  :key="tag.id"
                  class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-brand"
                  @click="navigateToTag(tag)"
                >
                  <span class="text-gray-400 dark:text-neutral-500">#</span>
                  {{ tag.name }}
                  <span class="text-xs text-gray-400 dark:text-neutral-500">{{
                    tag._count?.products ?? ''
                  }}</span>
                </button>
              </div>
            </div>

            <!-- Products -->
            <div v-if="results.data.products.length">
              <h3
                class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
              >
                Products
              </h3>
              <div class="space-y-1">
                <button
                  v-for="product in results.data.products"
                  :key="product.id"
                  class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                  @click="navigateToProduct(product.slug)"
                >
                  <div
                    class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800"
                  >
                    <img
                      v-if="product.media?.[0]?.url"
                      :src="imgThumb(product.media[0].url)"
                      :alt="product.title"
                      class="h-full w-full object-cover"
                    />
                    <Icon
                      v-else
                      name="mdi:package-variant"
                      size="24"
                      class="m-auto mt-3 text-gray-400"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate font-medium text-gray-900 dark:text-neutral-100"
                    >
                      {{ product.title }}
                    </p>
                    <p class="text-sm font-semibold text-brand">
                      ₦{{ Number(product.price).toLocaleString() }}
                    </p>
                    <p
                      class="truncate text-xs text-gray-400 dark:text-neutral-500"
                    >
                      by {{ product.seller?.store_name }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Posts -->
            <div v-if="results.data.posts.length">
              <h3
                class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
              >
                Posts
              </h3>
              <div class="space-y-1">
                <button
                  v-for="post in results.data.posts"
                  :key="post.id"
                  class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                  @click="navigateToPost(post.id)"
                >
                  <div
                    class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800"
                  >
                    <img
                      v-if="post.media?.[0]?.url"
                      :src="imgThumb(post.media[0].url)"
                      :alt="post.caption || 'Post'"
                      class="h-full w-full object-cover"
                    />
                    <Icon
                      v-else
                      name="mdi:post-outline"
                      size="24"
                      class="m-auto mt-3 text-gray-400"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate text-sm text-gray-900 dark:text-neutral-100"
                    >
                      {{ post.caption || post.content || 'No caption' }}
                    </p>
                    <div class="mt-1 flex items-center gap-2">
                      <img
                        v-if="post.author?.avatar"
                        :src="imgAvatar(post.author.avatar)"
                        class="h-4 w-4 rounded-full object-cover"
                      />
                      <p class="text-xs text-gray-400 dark:text-neutral-500">
                        @{{ post.author?.username }}
                      </p>
                      <span class="text-xs text-gray-300 dark:text-neutral-600"
                        >·</span
                      >
                      <span class="text-xs text-gray-400 dark:text-neutral-500"
                        >{{ post._count?.likes ?? 0 }} likes</span
                      >
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useSearchApi } from '~~/layers/core/app/services/search.api'
import { imgAvatar, imgThumb } from '~~/layers/core/app/utils/cloudinary'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const router = useRouter()
const searchApi = useSearchApi()

const searchQuery = ref('')
const isSearching = ref(false)
const results = ref<{
  success: boolean
  data: {
    users: any[]
    products: any[]
    posts: any[]
    stores: any[]
    tags: any[]
  }
}>({
  success: false,
  data: { users: [], products: [], posts: [], stores: [], tags: [] },
})

const hasResults = computed(
  () =>
    results.value.data.users.length > 0 ||
    results.value.data.stores.length > 0 ||
    results.value.data.products.length > 0 ||
    results.value.data.posts.length > 0 ||
    results.value.data.tags.length > 0,
)

const empty = { users: [], products: [], posts: [], stores: [], tags: [] }
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  const trimmed = val.trim()
  const isAtSearch = trimmed.startsWith('@')
  const cleanQuery = isAtSearch ? trimmed.slice(1) : trimmed
  const minLen = isAtSearch ? 1 : 2

  if (!cleanQuery || cleanQuery.length < minLen) {
    results.value.data = { ...empty }
    isSearching.value = false
    return
  }

  isSearching.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const searchType = isAtSearch ? 'users' : 'all'
      const res = await searchApi.search(cleanQuery, searchType)
      if (res?.success && res.data) {
        results.value.data = {
          users: (res.data as any).users || [],
          products: (res.data as any).products || [],
          posts: (res.data as any).posts || [],
          stores: (res.data as any).stores || [],
          tags: (res.data as any).tags || [],
        }
      }
    } catch (e) {
      console.error('Search error:', e)
      results.value.data = { ...empty }
    } finally {
      isSearching.value = false
    }
  }, 350)
})

const navigateToUser = (username: string) => {
  emit('close')
  router.push(`/profile/${username}`)
}

const navigateToStore = (slug: string) => {
  emit('close')
  router.push(`/sellers/profile/${slug}`)
}

const navigateToProduct = (slug: string) => {
  emit('close')
  router.push(`/product/${slug}`)
}

const navigateToPost = (id: number) => {
  emit('close')
  router.push(`/post/${id}`)
}

const navigateToTag = (tag: any) => {
  emit('close')
  router.push({ path: '/discover', query: { tab: 'tags', tagId: tag.id } })
}
</script>
