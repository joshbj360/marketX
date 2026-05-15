<template>
  <HomeLayout
    :narrow-feed="false"
    :custom-padding="true"
    :narrow-sidebar="true"
  >
    <div class="discover-page-wrap relative w-full pb-20 md:pb-0 md:pt-0">
      <!-- ─── STICKY HEADER ──────────────────────────────────────────────── -->
      <div
        class="discover-sticky-header -mx-4 border-b border-gray-100 bg-white/90 px-4 pb-3 pt-4 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/90"
        :style="{ top: discoverStickyTop }"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <h1
            class="text-xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100"
          >
            Discover
          </h1>
          <div class="relative flex-1 sm:max-w-sm">
            <Icon
              name="mdi:magnify"
              size="18"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500"
            />
            <input
              v-model="searchInput"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full rounded-full border border-transparent bg-gray-100/80 py-2 pl-9 pr-8 text-[13px] text-gray-900 placeholder-gray-400 transition-all focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 dark:bg-neutral-800/80 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:bg-neutral-800"
            />
            <button
              v-if="searchInput"
              aria-label="Clear search"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200"
              @click="searchInput = ''"
            >
              <Icon name="mdi:close" size="13" />
            </button>
          </div>
        </div>

        <!-- Tab Bar -->
        <div
          class="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5"
        >
          <button
            v-for="tab in TABS"
            :key="tab.key"
            class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all"
            :class="
              activeTab === tab.key
                ? 'bg-brand text-white shadow-sm shadow-brand/30'
                : 'text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            "
            @click="activeTab = tab.key"
          >
            <Icon :name="tab.icon" size="15" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ─── TAB PANELS ────────────────────────────────────────────────── -->
      <DiscoverTrending
        v-if="activeTab === 'trending'"
        @open-detail="openDetail"
      />
      <DiscoverSquares
        v-else-if="activeTab === 'squares'"
        :search-input="searchInput"
      />
      <DiscoverFresh
        v-else-if="activeTab === 'fresh'"
        :search-input="searchInput"
        :selected-category="selectedCategory"
        :categories="categories"
        @update:selected-category="selectedCategory = $event"
        @open-detail="openDetail"
      />
      <DiscoverDeals
        v-else-if="activeTab === 'deals'"
        :search-input="searchInput"
        :selected-category="selectedCategory"
        :categories="categories"
        @update:selected-category="selectedCategory = $event"
        @open-detail="openDetail"
      />
      <DiscoverPreloved
        v-else-if="activeTab === 'preloved'"
        :search-input="searchInput"
        :selected-category="selectedCategory"
        :categories="categories"
        @update:selected-category="selectedCategory = $event"
        @open-detail="openDetail"
      />
      <DiscoverProducts
        v-else-if="activeTab === 'products'"
        :search-input="searchInput"
        :selected-category="selectedCategory"
        :categories="categories"
        @update:selected-category="selectedCategory = $event"
        @open-detail="openDetail"
        @clear-search="searchInput = ''"
      />
      <DiscoverSellers
        v-else-if="activeTab === 'sellers'"
        :search-input="searchInput"
        :selected-category="selectedCategory"
        :categories="categories"
        @update:selected-category="selectedCategory = $event"
      />
      <DiscoverPeople
        v-else-if="activeTab === 'people'"
        :search-input="searchInput"
      />
      <DiscoverTags
        v-else-if="activeTab === 'tags'"
        :search-input="searchInput"
        :pending-tag-name="pendingTagName"
        @tag-resolved="pendingTagName = null"
        @open-detail="openDetail"
      />
    </div>

    <ProductDetailModal
      :product="selectedProduct"
      :loading="discoverDetailLoading"
      @close="selectedProduct = null"
    />

    <template #right-sidebar>
      <RightSideNavDiscoverFilter />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import type { IProduct } from '~~/layers/commerce/app/types/commerce.types'
import type { Category } from '~~/shared/types/category'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import ProductDetailModal from '~~/layers/commerce/app/components/modals/ProductDetailModal.vue'
import RightSideNavDiscoverFilter from '~~/layers/commerce/app/components/RightSideNavDiscoverFilter.vue'
import DiscoverTrending from '~~/layers/commerce/app/components/discover/Trending.vue'
import DiscoverSquares from '~~/layers/commerce/app/components/discover/Squares.vue'
import DiscoverFresh from '~~/layers/commerce/app/components/discover/Fresh.vue'
import DiscoverDeals from '~~/layers/commerce/app/components/discover/Deals.vue'
import DiscoverPreloved from '~~/layers/commerce/app/components/discover/Preloved.vue'
import DiscoverProducts from '~~/layers/commerce/app/components/discover/Products.vue'
import DiscoverSellers from '~~/layers/commerce/app/components/discover/Sellers.vue'
import DiscoverPeople from '~~/layers/commerce/app/components/discover/People.vue'
import DiscoverTags from '~~/layers/commerce/app/components/discover/Tags.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useProductDetail } from '~~/layers/commerce/app/composables/useProductDetail'
import { useLayoutData } from '~~/layers/core/app/composables/useLayoutData'
import { useNavVisibility } from '~~/layers/core/app/composables/useNavVisibility'
import { useSeo } from '~~/layers/core/app/composables/useSeo'
import { useDiscoverFilters } from '~~/layers/commerce/app/composables/useDiscoverFilters'
import { useRoute } from 'vue-router'

const { setDiscoverPage } = useSeo()
setDiscoverPage()

const { mobileNavVisible } = useNavVisibility()
const discoverStickyTop = computed(() =>
  mobileNavVisible.value
    ? 'calc(3.5rem + env(safe-area-inset-top, 0px))'
    : '0px',
)

const { data: layoutData } = useLayoutData()
const categories = computed<Category[]>(
  () => layoutData.value?.categories ?? [],
)
const selectedCategory = ref<string | null>(null)

const TABS = [
  { key: 'trending', label: 'Trending', icon: 'mdi:fire' },
  { key: 'squares', label: 'Squares', icon: 'mdi:store-marker-outline' },
  { key: 'fresh', label: 'Fresh Drops', icon: 'mdi:lightning-bolt' },
  { key: 'deals', label: 'Deals', icon: 'mdi:tag-heart-outline' },
  { key: 'preloved', label: 'Pre-loved', icon: 'mdi:recycle' },
  { key: 'products', label: 'Products', icon: 'mdi:shopping-outline' },
  { key: 'sellers', label: 'Sellers', icon: 'mdi:storefront-outline' },
  { key: 'people', label: 'People', icon: 'mdi:account-group-outline' },
  { key: 'tags', label: 'Tags', icon: 'mdi:tag-outline' },
] as const

const { activeTab } = useDiscoverFilters()
const searchInput = ref('')
const pendingTagName = ref<string | null>(null)

const searchPlaceholder = computed(() => {
  const map: Record<string, string> = {
    trending: 'Search trending…',
    squares: 'Search squares…',
    fresh: 'Search fresh drops…',
    deals: 'Search deals…',
    preloved: 'Search pre-loved items…',
    products: 'Search products…',
    sellers: 'Search stores…',
    people: 'Search people by name or @username',
    tags: 'Search tags…',
  }
  return map[activeTab.value] ?? 'Search…'
})

watch(activeTab, () => {
  searchInput.value = ''
  selectedCategory.value = null
})

const {
  selectedProduct,
  detailLoading: discoverDetailLoading,
  openProduct: openDetail,
} = useProductDetail()

// ─── Route deep-links ────────────────────────────────────────────────────────
const route = useRoute()

const applyTagNameParam = (tagName: string) => {
  activeTab.value = 'tags'
  pendingTagName.value = tagName
}

watch(
  () => route.query.tagName,
  (val) => {
    if (val && typeof val === 'string') applyTagNameParam(val)
  },
)

onMounted(() => {
  const tagName = route.query.tagName as string | undefined
  if (tagName) {
    applyTagNameParam(tagName)
    return
  }

  const validTabs = [
    'trending',
    'squares',
    'fresh',
    'deals',
    'preloved',
    'products',
    'sellers',
    'people',
    'tags',
  ] as const
  const tab = route.query.tab as string | undefined
  if (tab && (validTabs as readonly string[]).includes(tab)) {
    activeTab.value = tab as typeof activeTab.value
  }
})
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.discover-page-wrap {
  padding-top: calc(3.5rem + env(safe-area-inset-top, 0px));
}
@media (min-width: 768px) {
  .discover-page-wrap {
    padding-top: 0;
  }
}

.discover-sticky-header {
  position: sticky;
  z-index: 20;
  transition: top 300ms ease-in-out;
}
@media (min-width: 768px) {
  .discover-sticky-header {
    top: 0 !important;
  }
}
</style>
