import { ref, reactive, computed } from 'vue'

export type DiscoverTabKey =
  | 'trending' | 'squares' | 'fresh' | 'deals'
  | 'preloved' | 'products' | 'sellers' | 'people' | 'tags'

export type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'popular'

// ── Module-level singletons — one state shared across all components ──────────

const activeTab = ref<DiscoverTabKey>('trending')

const filters = reactive({
  products: {
    sortBy: 'newest' as SortBy,
    minPrice: null as number | null,
    maxPrice: null as number | null,
  },
  fresh: {
    sortBy: 'newest' as SortBy,
    minPrice: null as number | null,
    maxPrice: null as number | null,
  },
  deals: {
    minDiscount: 0,          // 0 = show all with any discount
    maxPrice: null as number | null,
  },
  preloved: {
    minPrice: null as number | null,
    maxPrice: null as number | null,
  },
  squares: {
    minMembers: null as number | null,
  },
  sellers: {
    hasDeals: false,
  },
  trending: {
    timeRange: 'all' as 'today' | 'week' | 'month' | 'all',
  },
  people: {},
  tags: {
    sort: 'popular' as 'popular' | 'newest',
  },
})

const DEFAULTS = {
  products: { sortBy: 'newest' as SortBy, minPrice: null, maxPrice: null },
  fresh:    { sortBy: 'newest' as SortBy, minPrice: null, maxPrice: null },
  deals:    { minDiscount: 0, maxPrice: null },
  preloved: { minPrice: null, maxPrice: null },
  squares:  { minMembers: null },
  sellers:  { hasDeals: false },
  trending: { timeRange: 'all' as 'today' | 'week' | 'month' | 'all' },
  people:   {},
  tags:     { sort: 'popular' as 'popular' | 'newest' },
}

function resetFilters(tab?: DiscoverTabKey) {
  const keys = tab ? [tab] : Object.keys(DEFAULTS) as DiscoverTabKey[]
  for (const k of keys) {
    Object.assign((filters as any)[k], (DEFAULTS as any)[k])
  }
}

const hasActiveFilters = computed(() => {
  const t = activeTab.value
  if (t === 'products') {
    const f = filters.products
    return f.sortBy !== 'newest' || f.minPrice !== null || f.maxPrice !== null
  }
  if (t === 'fresh') {
    const f = filters.fresh
    return f.sortBy !== 'newest' || f.minPrice !== null || f.maxPrice !== null
  }
  if (t === 'deals') {
    return filters.deals.minDiscount > 0 || filters.deals.maxPrice !== null
  }
  if (t === 'preloved') {
    return filters.preloved.minPrice !== null || filters.preloved.maxPrice !== null
  }
  if (t === 'sellers') return filters.sellers.hasDeals
  if (t === 'trending') return filters.trending.timeRange !== 'all'
  if (t === 'tags') return filters.tags.sort !== 'popular'
  if (t === 'squares') return filters.squares.minMembers !== null
  return false
})

// ── Public API ────────────────────────────────────────────────────────────────

export const useDiscoverFilters = () => ({
  activeTab,
  filters,
  hasActiveFilters,
  resetFilters,
})
