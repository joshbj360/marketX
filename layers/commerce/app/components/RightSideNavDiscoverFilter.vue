<template>
  <aside
    class="discover-filter-panel overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
  >
    <div
      class="border-b border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand ring-1 ring-brand/15"
            >
              <Icon name="mdi:tune-variant" size="17" />
            </span>
            <div class="min-w-0">
              <p
                class="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-neutral-500"
              >
                Discover
              </p>
              <h3
                class="truncate text-[14px] font-extrabold text-gray-950 dark:text-neutral-50"
              >
                {{ currentTabMeta.label }} filters
              </h3>
            </div>
          </div>
        </div>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 text-[11px] font-bold text-brand transition hover:border-brand/30 hover:bg-brand/15 focus:outline-none focus:ring-2 focus:ring-brand/20"
          @click="resetFilters(activeTab)"
        >
          <Icon name="mdi:refresh" size="13" />
          Reset
        </button>
      </div>

      <div class="mt-3 flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200 dark:bg-neutral-950 dark:text-neutral-300 dark:ring-neutral-800"
        >
          <Icon :name="currentTabMeta.icon" size="13" class="text-brand" />
          {{ currentTabMeta.label }}
        </span>
        <span
          v-if="hasActiveFilters"
          class="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-1 text-[11px] font-black text-white shadow-sm shadow-brand/20"
        >
          {{ activeFilterCount }} active
        </span>
        <span
          v-else
          class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500 dark:bg-neutral-800 dark:text-neutral-400"
        >
          Default
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-4 p-4">
      <template v-if="activeTab === 'products'">
        <FilterSection label="Sort by" icon="mdi:sort">
          <div class="filter-option-list">
            <button
              v-for="opt in SORT_OPTIONS"
              :key="opt.value"
              type="button"
              class="filter-chip"
              :class="
                filters.products.sortBy === opt.value
                  ? 'filter-chip--active'
                  : ''
              "
              :aria-pressed="filters.products.sortBy === opt.value"
              @click="filters.products.sortBy = opt.value"
            >
              <Icon :name="opt.icon" size="14" />
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </FilterSection>

        <FilterSection label="Price range" icon="mdi:cash-multiple">
          <PriceRange
            :min="filters.products.minPrice"
            :max="filters.products.maxPrice"
            @update:min="filters.products.minPrice = $event"
            @update:max="filters.products.maxPrice = $event"
          />
        </FilterSection>
      </template>

      <template v-else-if="activeTab === 'fresh'">
        <FilterSection label="Sort by" icon="mdi:sort">
          <div class="filter-option-list">
            <button
              v-for="opt in SORT_OPTIONS"
              :key="opt.value"
              type="button"
              class="filter-chip"
              :class="
                filters.fresh.sortBy === opt.value ? 'filter-chip--active' : ''
              "
              :aria-pressed="filters.fresh.sortBy === opt.value"
              @click="filters.fresh.sortBy = opt.value"
            >
              <Icon :name="opt.icon" size="14" />
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </FilterSection>

        <FilterSection label="Price range" icon="mdi:cash-multiple">
          <PriceRange
            :min="filters.fresh.minPrice"
            :max="filters.fresh.maxPrice"
            @update:min="filters.fresh.minPrice = $event"
            @update:max="filters.fresh.maxPrice = $event"
          />
        </FilterSection>
      </template>

      <template v-else-if="activeTab === 'deals'">
        <FilterSection label="Minimum discount" icon="mdi:sale-outline">
          <div class="filter-option-list">
            <button
              v-for="pct in DISCOUNT_OPTIONS"
              :key="pct.value"
              type="button"
              class="filter-chip"
              :class="
                filters.deals.minDiscount === pct.value
                  ? 'filter-chip--active'
                  : ''
              "
              :aria-pressed="filters.deals.minDiscount === pct.value"
              @click="filters.deals.minDiscount = pct.value"
            >
              {{ pct.label }}
            </button>
          </div>
        </FilterSection>

        <FilterSection label="Max price" icon="mdi:cash-check">
          <PriceRange
            :min="null"
            :max="filters.deals.maxPrice"
            :hide-min="true"
            @update:max="filters.deals.maxPrice = $event"
          />
        </FilterSection>
      </template>

      <template v-else-if="activeTab === 'preloved'">
        <FilterSection label="Price range" icon="mdi:cash-multiple">
          <PriceRange
            :min="filters.preloved.minPrice"
            :max="filters.preloved.maxPrice"
            @update:min="filters.preloved.minPrice = $event"
            @update:max="filters.preloved.maxPrice = $event"
          />
        </FilterSection>

        <InfoPanel
          icon="mdi:recycle"
          tone="emerald"
          title="Pre-loved only"
          body="Second-hand and thrift products are shown in this tab."
        />
      </template>

      <template v-else-if="activeTab === 'squares'">
        <FilterSection label="Minimum sellers" icon="mdi:store-group-outline">
          <div class="filter-option-list">
            <button
              v-for="opt in MEMBER_OPTIONS"
              :key="opt.value ?? 'any'"
              type="button"
              class="filter-chip"
              :class="
                filters.squares.minMembers === opt.value
                  ? 'filter-chip--active'
                  : ''
              "
              :aria-pressed="filters.squares.minMembers === opt.value"
              @click="filters.squares.minMembers = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </FilterSection>
      </template>

      <template v-else-if="activeTab === 'sellers'">
        <FilterSection label="Show only" icon="mdi:storefront-check-outline">
          <label
            class="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 transition hover:border-brand/30 hover:bg-brand/5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-brand/30 dark:hover:bg-brand/10"
          >
            <span class="flex min-w-0 items-center gap-2.5">
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"
              >
                <Icon name="mdi:tag-heart-outline" size="16" />
              </span>
              <span
                class="text-[13px] font-bold text-gray-700 dark:text-neutral-200"
              >
                Has active deals
              </span>
            </span>
            <input
              v-model="filters.sellers.hasDeals"
              type="checkbox"
              class="sr-only"
            />
            <span
              class="relative h-6 w-11 shrink-0 rounded-full transition"
              :class="
                filters.sellers.hasDeals
                  ? 'bg-brand'
                  : 'bg-gray-200 dark:bg-neutral-700'
              "
            >
              <span
                class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition"
                :class="filters.sellers.hasDeals ? 'translate-x-5' : ''"
              />
            </span>
          </label>
        </FilterSection>
      </template>

      <template v-else-if="activeTab === 'trending'">
        <FilterSection label="Time range" icon="mdi:clock-outline">
          <div class="filter-option-list">
            <button
              v-for="opt in TIME_OPTIONS"
              :key="opt.value"
              type="button"
              class="filter-chip"
              :class="
                filters.trending.timeRange === opt.value
                  ? 'filter-chip--active'
                  : ''
              "
              :aria-pressed="filters.trending.timeRange === opt.value"
              @click="filters.trending.timeRange = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </FilterSection>
      </template>

      <template v-else-if="activeTab === 'tags'">
        <FilterSection label="Sort tags by" icon="mdi:tag-multiple-outline">
          <div class="filter-option-list">
            <button
              type="button"
              class="filter-chip"
              :class="
                filters.tags.sort === 'popular' ? 'filter-chip--active' : ''
              "
              :aria-pressed="filters.tags.sort === 'popular'"
              @click="filters.tags.sort = 'popular'"
            >
              <Icon name="mdi:fire" size="14" />
              Popular
            </button>
            <button
              type="button"
              class="filter-chip"
              :class="
                filters.tags.sort === 'newest' ? 'filter-chip--active' : ''
              "
              :aria-pressed="filters.tags.sort === 'newest'"
              @click="filters.tags.sort = 'newest'"
            >
              <Icon name="mdi:lightning-bolt" size="14" />
              Newest
            </button>
          </div>
        </FilterSection>
      </template>

      <template v-else-if="activeTab === 'people'">
        <InfoPanel
          icon="mdi:account-search-outline"
          tone="slate"
          title="Search people"
          body="Use the search field to find people by name or username."
        />
      </template>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FilterSection from './discover/DiscoverFilterSection.vue'
import InfoPanel from './discover/DiscoverInfoPanel.vue'
import PriceRange from './discover/DiscoverPriceRange.vue'
import { useDiscoverFilters } from '../composables/useDiscoverFilters'

const { activeTab, filters, hasActiveFilters, resetFilters } =
  useDiscoverFilters()

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Newest', icon: 'mdi:lightning-bolt' },
  { value: 'popular' as const, label: 'Popular', icon: 'mdi:fire' },
  { value: 'price_asc' as const, label: 'Low price', icon: 'mdi:sort-ascending' },
  {
    value: 'price_desc' as const,
    label: 'High price',
    icon: 'mdi:sort-descending',
  },
]

const DISCOUNT_OPTIONS = [
  { value: 0, label: 'Any deal' },
  { value: 10, label: '10%+ off' },
  { value: 20, label: '20%+ off' },
  { value: 30, label: '30%+ off' },
  { value: 50, label: '50%+ off' },
  { value: 70, label: '70%+ off' },
]

const MEMBER_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 5, label: '5+' },
  { value: 10, label: '10+' },
  { value: 25, label: '25+' },
  { value: 50, label: '50+' },
  { value: 100, label: '100+' },
]

const TIME_OPTIONS = [
  { value: 'all' as const, label: 'All time' },
  { value: 'today' as const, label: 'Today' },
  { value: 'week' as const, label: 'This week' },
  { value: 'month' as const, label: 'This month' },
]

const TAB_META: Record<string, { label: string; icon: string }> = {
  trending: { label: 'Trending', icon: 'mdi:fire' },
  squares: { label: 'Squares', icon: 'mdi:store-marker-outline' },
  fresh: { label: 'Fresh Drops', icon: 'mdi:lightning-bolt' },
  deals: { label: 'Deals', icon: 'mdi:tag-heart-outline' },
  preloved: { label: 'Pre-loved', icon: 'mdi:recycle' },
  products: { label: 'Products', icon: 'mdi:shopping-outline' },
  sellers: { label: 'Sellers', icon: 'mdi:storefront-outline' },
  people: { label: 'People', icon: 'mdi:account-group-outline' },
  tags: { label: 'Tags', icon: 'mdi:tag-outline' },
}

const currentTabMeta = computed(
  () => TAB_META[activeTab.value] ?? { label: 'Discover', icon: 'mdi:compass' },
)

const activeFilterCount = computed(() => {
  const t = activeTab.value
  let n = 0
  if (t === 'products') {
    if (filters.products.sortBy !== 'newest') n++
    if (filters.products.minPrice !== null) n++
    if (filters.products.maxPrice !== null) n++
  } else if (t === 'fresh') {
    if (filters.fresh.sortBy !== 'newest') n++
    if (filters.fresh.minPrice !== null) n++
    if (filters.fresh.maxPrice !== null) n++
  } else if (t === 'deals') {
    if (filters.deals.minDiscount > 0) n++
    if (filters.deals.maxPrice !== null) n++
  } else if (t === 'preloved') {
    if (filters.preloved.minPrice !== null) n++
    if (filters.preloved.maxPrice !== null) n++
  } else if (t === 'sellers' && filters.sellers.hasDeals) {
    n++
  } else if (t === 'trending' && filters.trending.timeRange !== 'all') {
    n++
  } else if (t === 'tags' && filters.tags.sort !== 'popular') {
    n++
  } else if (t === 'squares' && filters.squares.minMembers !== null) {
    n++
  }
  return n
})
</script>

<style scoped>
.discover-filter-panel {
  backdrop-filter: blur(16px);
}

.filter-option-list {
  @apply grid grid-cols-1 gap-2;
}

.filter-chip {
  @apply inline-flex min-h-11 w-full items-center justify-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-[13px] font-bold leading-tight text-gray-600 shadow-sm shadow-gray-200/40 transition
         hover:border-brand/30 hover:bg-brand/5 hover:text-brand
         focus:outline-none focus:ring-2 focus:ring-brand/20
         dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:shadow-none dark:hover:border-brand/30 dark:hover:bg-brand/10 dark:hover:text-brand;
}

.filter-chip--active {
  @apply border-brand/40 bg-brand text-white shadow-sm shadow-brand/25 hover:bg-brand hover:text-white dark:border-brand/50 dark:bg-brand dark:text-white;
}

</style>
