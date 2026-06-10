<template>
  <div class="mt-5">
    <!-- Tag detail view -->
    <div v-if="selectedTag">
      <div class="mb-5 flex items-center gap-3">
        <button
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          @click="clearSelectedTag"
        >
          <Icon name="mdi:arrow-left" size="18" />
        </button>
        <div>
          <h2
            class="text-2xl font-black tracking-tight text-gray-900 dark:text-neutral-100"
          >
            <span class="text-brand">#</span>{{ selectedTag.name }}
          </h2>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
            {{ tagTotal }} product{{ tagTotal !== 1 ? 's' : '' }} tagged
          </p>
        </div>
      </div>

      <div
        v-if="tagProductsLoading && !tagProducts.length"
        class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        />
      </div>

      <div
        v-else-if="!tagProductsLoading && !tagProducts.length"
        class="py-20 text-center"
      >
        <p class="text-sm text-gray-500 dark:text-neutral-400">
          No products tagged
          <span class="font-bold text-brand">#{{ selectedTag.name }}</span>
          yet
        </p>
      </div>

      <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <ProductCardMini
          v-for="product in tagProducts"
          :key="product.id"
          :product="product"
          @open-detail="emit('open-detail', $event)"
        />
      </div>
    </div>

    <!-- Hashtag browser -->
    <div v-else>
      <div v-if="tagsLoading" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          v-for="n in 12"
          :key="n"
          class="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        />
      </div>

      <div v-else-if="!allTags.length" class="py-24 text-center">
        <Icon
          name="mdi:tag-outline"
          size="48"
          class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
        />
        <p class="text-sm text-gray-500 dark:text-neutral-400">
          No hashtags yet
        </p>
      </div>

      <div v-else>
        <div v-if="!props.searchInput" class="mb-5">
          <div class="mb-3 flex items-center gap-2">
            <Icon name="mdi:fire" size="16" class="text-orange-500" />
            <p
              class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
            >
              Trending now
            </p>
          </div>
          <div class="relative">
          <div
            class="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
          >
            <button
              v-for="tag in allTags.slice(0, 8)"
              :key="tag.id"
              class="group flex shrink-0 flex-col items-start rounded-2xl border border-gray-200 bg-white p-3.5 transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              style="min-width: 110px"
              @click="openTagView(tag)"
            >
              <span class="text-xl font-black leading-none text-brand">#</span>
              <span
                class="mt-1 text-sm font-bold text-gray-900 dark:text-neutral-100"
              >
                {{ tag.name }}
              </span>
              <span
                class="mt-1 text-[11px] text-gray-400 dark:text-neutral-500"
              >
                {{ tag._count.products || tag._count.posts }}
                {{ tag._count.products ? 'products' : 'posts' }}
              </span>
            </button>
          </div>
          <div class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent dark:from-neutral-950" />
          </div>
        </div>

        <div v-if="!props.searchInput" class="mb-2 flex items-center gap-2">
          <p
            class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
          >
            All hashtags
          </p>
        </div>
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <button
            v-for="tag in allTags"
            :key="tag.id"
            class="group flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:border-brand/20 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            @click="openTagView(tag)"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 dark:bg-brand/20"
            >
              <span class="text-sm font-black text-brand">#</span>
            </div>
            <div class="min-w-0">
              <p
                class="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-brand dark:text-neutral-200"
              >
                {{ tag.name }}
              </p>
              <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                {{
                  tag._count.products
                    ? `${tag._count.products} products`
                    : `${tag._count.posts} posts`
                }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { IProduct } from '~~/layers/commerce/app/types/commerce.types'
import ProductCardMini from '~~/layers/commerce/app/components/ProductCardMini.vue'
import { useDiscoverTags } from '~~/layers/commerce/app/composables/useDiscoverTags'
import { useDiscoverFilters } from '~~/layers/commerce/app/composables/useDiscoverFilters'

const props = defineProps<{
  searchInput: string
  pendingTagName: string | null
}>()

const emit = defineEmits<{
  'open-detail': [product: IProduct]
  'tag-resolved': []
}>()

const route = useRoute()
const { filters } = useDiscoverFilters()
const {
  allTags,
  tagsLoading,
  selectedTag,
  tagProducts,
  tagTotal,
  tagProductsLoading,
  loadTags,
  openTagView,
  clearSelectedTag,
} = useDiscoverTags()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.searchInput,
  (val) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => loadTags(val || undefined), 350)
  },
)

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

watch(
  () => filters.tags.sort,
  () => loadTags(props.searchInput || undefined),
)

onMounted(async () => {
  if (props.pendingTagName) {
    await loadTags(props.pendingTagName)
    const match = allTags.value.find(
      (t) => t.name.toLowerCase() === props.pendingTagName!.toLowerCase(),
    )
    if (match) {
      await openTagView(match)
    } else {
      await loadTags()
    }
    emit('tag-resolved')
    return
  }

  const tagId = Number(route.query.tagId)
  if (tagId) {
    await loadTags()
    const tag = allTags.value.find((t) => t.id === tagId)
    if (tag) openTagView(tag)
    return
  }

  loadTags()
})
</script>
