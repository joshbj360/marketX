<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="true" :custom-padding="true">
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
          <!-- Search -->
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
              @click="searchInput = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200"
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
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all"
            :class="
              activeTab === tab.key
                ? 'bg-brand text-white shadow-sm shadow-brand/30'
                : 'text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            "
          >
            <Icon :name="tab.icon" size="15" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: TRENDING                                                       -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'trending'" class="mt-5 space-y-8">

        <!-- ── HORIZONTAL BARS ──────────────────────────────────────────── -->
        <!-- Fresh Drops strip -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="mdi:lightning-bolt" size="18" class="text-amber-400" />
              <h2 class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">Fresh Drops</h2>
            </div>
            <button @click="activeTab = 'fresh'" class="text-xs font-semibold text-brand hover:underline">See all →</button>
          </div>
          <!-- Skeleton -->
          <div class="scroll-strip-wrap">
            <div v-if="stripsLoading && !freshStrip.length" class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              <div v-for="n in 6" :key="n" class="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800" />
            </div>
            <div v-else-if="freshStrip.length" class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 snap-x snap-mandatory">
              <div v-for="product in freshStrip" :key="product.id" class="w-40 shrink-0 snap-start">
                <ProductCardMini :product="product" @open-detail="openDetail" />
              </div>
            </div>
            <div class="scroll-fade-right" />
          </div>
        </section>

        <!-- Hot Deals strip -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="mdi:tag-heart-outline" size="18" class="text-brand" />
              <h2 class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">Hot Deals</h2>
            </div>
            <button @click="activeTab = 'deals'" class="text-xs font-semibold text-brand hover:underline">See all →</button>
          </div>
          <div class="scroll-strip-wrap">
            <div v-if="stripsLoading && !dealStrip.length" class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              <div v-for="n in 6" :key="n" class="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800" />
            </div>
            <div v-else-if="dealStrip.length" class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 snap-x snap-mandatory">
              <div v-for="product in dealStrip" :key="product.id" class="w-40 shrink-0 snap-start">
                <ProductCardMini :product="product" @open-detail="openDetail" />
              </div>
            </div>
            <div class="scroll-fade-right" />
          </div>
        </section>

        <!-- Pre-loved strip -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Icon name="mdi:recycle" size="18" class="text-emerald-500" />
              <h2 class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">Pre-loved</h2>
            </div>
            <button @click="activeTab = 'preloved'" class="text-xs font-semibold text-brand hover:underline">See all →</button>
          </div>
          <div class="scroll-strip-wrap">
            <div v-if="stripsLoading && !prelovedStrip.length" class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
              <div v-for="n in 6" :key="n" class="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800" />
            </div>
            <div v-else-if="prelovedStrip.length" class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 snap-x snap-mandatory">
              <div v-for="product in prelovedStrip" :key="product.id" class="w-40 shrink-0 snap-start">
                <ProductCardMini :product="product" @open-detail="openDetail" />
              </div>
            </div>
            <div class="scroll-fade-right" />
          </div>
        </section>

        <!-- Loading -->
        <div v-if="trendingLoading" class="space-y-8">
          <div class="flex gap-2 overflow-x-auto pb-1">
            <div
              v-for="n in 10"
              :key="n"
              class="h-8 w-20 shrink-0 animate-pulse rounded-full bg-gray-100 dark:bg-neutral-800"
            />
          </div>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="n in 8"
              :key="n"
              class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
            />
          </div>
        </div>

        <template v-else>
          <!-- Trending Tags Chips -->
          <section v-if="trendingTags.length">
            <div class="mb-3 flex items-center gap-2">
              <Icon name="mdi:fire" size="18" class="text-orange-500" />
              <h2
                class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
              >
                Trending Tags
              </h2>
            </div>
            <div class="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
              <button
                v-for="tag in trendingTags"
                :key="tag.id"
                @click="openTagView(tag)"
                class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-700 transition-all hover:border-brand/40 hover:bg-brand/5 hover:text-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-brand/50 dark:hover:text-brand"
              >
                <span class="text-gray-400 dark:text-neutral-500">#</span>
                {{ tag.name }}
                <span
                  class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500 dark:bg-neutral-800 dark:text-neutral-400"
                  >{{ tag._count.products }}</span
                >
              </button>
            </div>
          </section>

          <!-- Trending Products -->
          <section v-if="trendingProducts.length">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="mdi:trending-up" size="18" class="text-brand" />
                <h2
                  class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
                >
                  Hot Right Now
                </h2>
              </div>
              <button
                @click="activeTab = 'products'"
                class="text-xs font-semibold text-brand hover:underline"
              >
                See all →
              </button>
            </div>
            <div
              class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              <ProductCardMini
                v-for="product in trendingProducts"
                :key="product.id"
                :product="product"
                @open-detail="openDetail"
              />
            </div>
          </section>

          <!-- Featured Sellers -->
          <section v-if="featuredSellers.length">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon
                  name="mdi:store-check-outline"
                  size="18"
                  class="text-brand"
                />
                <h2
                  class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300"
                >
                  Top Stores
                </h2>
              </div>
              <button
                @click="activeTab = 'sellers'"
                class="text-xs font-semibold text-brand hover:underline"
              >
                See all →
              </button>
            </div>
            <!-- Mobile: horizontal scroll strip; Desktop: grid -->
            <div class="scroll-strip-wrap md:hidden">
              <div class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
                <NuxtLink
                  v-for="seller in featuredSellers"
                  :key="seller.id"
                  :to="`/sellers/profile/${seller.store_slug}`"
                  class="group flex w-[100px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 text-center transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div class="h-14 w-14 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800">
                    <img v-if="seller.store_logo" :src="seller.store_logo" :alt="seller.store_name" class="h-full w-full object-cover" />
                    <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-purple-600">
                      <Icon name="mdi:storefront" size="20" class="text-white" />
                    </div>
                  </div>
                  <div class="w-full min-w-0">
                    <p class="truncate text-[11px] font-bold text-gray-900 group-hover:text-brand dark:text-neutral-100">{{ seller.store_name }}</p>
                    <p class="text-[10px] text-gray-400 dark:text-neutral-500">{{ formatNum(seller.followers_count || 0) }} followers</p>
                  </div>
                </NuxtLink>
              </div>
              <div class="scroll-fade-right" />
            </div>
            <!-- Desktop grid -->
            <div class="hidden gap-3 sm:grid-cols-3 md:grid lg:grid-cols-6">
              <NuxtLink
                v-for="seller in featuredSellers"
                :key="seller.id"
                :to="`/sellers/profile/${seller.store_slug}`"
                class="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div class="h-14 w-14 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800">
                  <img v-if="seller.store_logo" :src="seller.store_logo" :alt="seller.store_name" class="h-full w-full object-cover" />
                  <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-purple-600">
                    <Icon name="mdi:storefront" size="22" class="text-white" />
                  </div>
                </div>
                <div class="w-full min-w-0">
                  <p class="truncate text-xs font-bold text-gray-900 transition-colors group-hover:text-brand dark:text-neutral-100">{{ seller.store_name }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-neutral-500">{{ formatNum(seller.followers_count || 0) }} followers</p>
                </div>
              </NuxtLink>
            </div>
          </section>

          <!-- Empty trending -->
          <div
            v-if="
              !trendingProducts.length &&
              !trendingTags.length &&
              !featuredSellers.length
            "
            class="py-24 text-center"
          >
            <Icon
              name="mdi:fire-off"
              size="48"
              class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
            />
            <p class="text-sm text-gray-500 dark:text-neutral-400">
              Nothing trending yet
            </p>
          </div>
        </template>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: PRODUCTS                                                       -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'products'" class="mt-5">
        <!-- Category pills -->
        <CategoryPills
          v-if="categories.length"
          :categories="categories"
          :model-value="selectedCategory"
          class="mb-3"
          @update:model-value="selectedCategory = $event"
        />
        <!-- Filter pills -->
        <div class="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="f in productFilters"
            :key="f.key"
            @click="productFilter = f.key"
            class="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all"
            :class="
              productFilter === f.key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'border border-gray-200 text-gray-600 hover:border-gray-400 dark:border-neutral-700 dark:text-neutral-400'
            "
          >
            {{ f.label }}
          </button>
        </div>

        <!-- Skeleton -->
        <div
          v-if="productsLoading && !products.length"
          class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <div
            v-for="n in 10"
            :key="n"
            class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
          />
        </div>

        <!-- No results -->
        <div
          v-else-if="!productsLoading && !products.length"
          class="py-24 text-center"
        >
          <Icon
            name="mdi:text-search"
            size="48"
            class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
          />
          <p class="text-sm text-gray-500 dark:text-neutral-400">
            No products found{{ searchInput ? ` for "${searchInput}"` : '' }}
          </p>
          <button
            v-if="searchInput"
            @click="searchInput = ''"
            class="mt-3 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Clear search
          </button>
        </div>

        <!-- Grid -->
        <div
          v-else
          class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <ProductCardMini
            v-for="product in products"
            :key="product.id"
            :product="product"
            @open-detail="openDetail"
          />
        </div>

        <!-- Infinite scroll trigger -->
        <div ref="productTrigger" class="mt-6 h-10" />
        <div
          v-if="productsLoading && products.length"
          class="flex justify-center py-8"
        >
          <Icon name="eos-icons:loading" size="24" class="text-brand" />
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: SELLERS                                                        -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'sellers'" class="mt-5">
        <!-- Category pills (filters by sellers who carry products in this category) -->
        <CategoryPills
          v-if="categories.length"
          :categories="categories"
          :model-value="selectedCategory"
          class="mb-4"
          @update:model-value="selectedCategory = $event"
        />
        <!-- Skeleton -->
        <div
          v-if="sellersLoading && !sellers.length"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          <div
            v-for="n in 8"
            :key="n"
            class="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
          />
        </div>

        <!-- Empty -->
        <div
          v-else-if="!sellersLoading && !sellers.length"
          class="py-24 text-center"
        >
          <Icon
            name="mdi:store-search-outline"
            size="48"
            class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
          />
          <p class="text-sm text-gray-500 dark:text-neutral-400">
            No stores found{{ searchInput ? ` for "${searchInput}"` : '' }}
          </p>
        </div>

        <!-- Grid -->
        <div
          v-else
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          <NuxtLink
            v-for="seller in sellers"
            :key="seller.id"
            :to="`/sellers/profile/${seller.store_slug}`"
            class="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div
              class="relative h-20 overflow-hidden bg-gradient-to-br from-brand to-purple-600"
            >
              <img
                v-if="seller.store_banner"
                :src="seller.store_banner"
                :alt="seller.store_name"
                class="h-full w-full object-cover opacity-80"
              />
            </div>
            <div class="relative -mt-6 px-3 pb-4">
              <div
                class="mb-2 h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-neutral-900 dark:bg-neutral-900"
              >
                <img
                  v-if="seller.store_logo"
                  :src="seller.store_logo"
                  :alt="seller.store_name"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-purple-600"
                >
                  <Icon name="mdi:storefront" size="18" class="text-white" />
                </div>
              </div>
              <div class="flex items-start justify-between gap-1">
                <div class="min-w-0">
                  <div class="flex items-center gap-1">
                    <p
                      class="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-brand dark:text-neutral-100"
                    >
                      {{ seller.store_name }}
                    </p>
                    <Icon
                      v-if="seller.is_verified"
                      name="mdi:check-decagram"
                      size="13"
                      class="shrink-0 text-blue-500"
                    />
                  </div>
                  <p
                    class="mt-0.5 text-[11px] text-gray-500 dark:text-neutral-400"
                  >
                    {{ formatNum(seller.followers_count || 0) }} followers ·
                    {{ seller._count?.products || 0 }} items
                  </p>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Infinite scroll trigger -->
        <div ref="sellerTrigger" class="mt-6 h-10" />
        <div
          v-if="sellersLoading && sellers.length"
          class="flex justify-center py-8"
        >
          <Icon name="eos-icons:loading" size="24" class="text-brand" />
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: PEOPLE                                                         -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'people'" class="mt-5">
        <!-- Hint when no search -->
        <div v-if="!searchInput" class="py-16 text-center">
          <Icon
            name="mdi:account-search-outline"
            size="56"
            class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
          />
          <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">
            Search by username or name
          </p>
          <p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">
            Type something in the search bar above
          </p>
        </div>

        <!-- Searching -->
        <div v-else-if="peopleLoading" class="space-y-3 pt-2">
          <div
            v-for="n in 5"
            :key="n"
            class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-neutral-900"
          >
            <div
              class="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"
            />
            <div class="flex-1 space-y-1.5">
              <div
                class="h-3.5 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-neutral-700"
              />
              <div
                class="h-3 w-20 animate-pulse rounded-md bg-gray-100 dark:bg-neutral-800"
              />
            </div>
          </div>
        </div>

        <!-- No results -->
        <div
          v-else-if="searchInput && !people.length"
          class="py-16 text-center"
        >
          <p class="text-sm text-gray-500 dark:text-neutral-400">
            No users found for "{{ searchInput }}"
          </p>
        </div>

        <!-- People list -->
        <div v-else-if="people.length" class="space-y-1 pt-1">
          <NuxtLink
            v-for="user in people"
            :key="user.id"
            :to="`/profile/${user.username}`"
            class="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
            >
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.username"
                class="h-full w-full object-cover"
              />
              <Icon
                v-else
                name="mdi:account"
                size="22"
                class="text-gray-400 dark:text-neutral-500"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100"
              >
                {{ user.full_name || user.username }}
              </p>
              <p class="truncate text-xs text-gray-500 dark:text-neutral-400">
                @{{ user.username }}
              </p>
            </div>
            <Icon
              name="mdi:chevron-right"
              size="18"
              class="shrink-0 text-gray-300 dark:text-neutral-600"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: TAGS / HASHTAGS                                                -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'tags'" class="mt-5">

        <!-- ── Tag detail view ─────────────────────────────────────────── -->
        <div v-if="selectedTag">
          <!-- Header -->
          <div class="mb-5 flex items-center gap-3">
            <button
              @click="selectedTag = null; tagProducts = []; tagTotal = 0"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <Icon name="mdi:arrow-left" size="18" />
            </button>
            <div>
              <h2 class="text-2xl font-black tracking-tight text-gray-900 dark:text-neutral-100">
                <span class="text-brand">#</span>{{ selectedTag.name }}
              </h2>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                {{ tagTotal }} product{{ tagTotal !== 1 ? 's' : '' }} tagged
              </p>
            </div>
          </div>

          <!-- Tag products loading -->
          <div v-if="tagProductsLoading && !tagProducts.length" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <div v-for="n in 8" :key="n" class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800" />
          </div>

          <!-- Tag products empty -->
          <div v-else-if="!tagProductsLoading && !tagProducts.length" class="py-20 text-center">
            <p class="text-sm text-gray-500 dark:text-neutral-400">No products tagged <span class="font-bold text-brand">#{{ selectedTag.name }}</span> yet</p>
          </div>

          <!-- Tag products grid -->
          <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <ProductCardMini v-for="product in tagProducts" :key="product.id" :product="product" @open-detail="openDetail" />
          </div>
        </div>

        <!-- ── Hashtag browser ──────────────────────────────────────────── -->
        <div v-else>
          <!-- Loading skeleton -->
          <div v-if="tagsLoading" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div v-for="n in 12" :key="n" class="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800" />
          </div>

          <!-- Empty -->
          <div v-else-if="!allTags.length" class="py-24 text-center">
            <Icon name="mdi:tag-outline" size="48" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
            <p class="text-sm text-gray-500 dark:text-neutral-400">No hashtags yet</p>
          </div>

          <!-- Hashtag grid -->
          <div v-else>
            <!-- Top trending row -->
            <div v-if="!searchInput" class="mb-5">
              <div class="mb-3 flex items-center gap-2">
                <Icon name="mdi:fire" size="16" class="text-orange-500" />
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">Trending now</p>
              </div>
              <div class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
                <button
                  v-for="tag in allTags.slice(0, 8)"
                  :key="tag.id"
                  @click="openTagView(tag)"
                  class="group flex shrink-0 flex-col items-start rounded-2xl border border-gray-100 bg-white p-3.5 transition-all hover:border-brand/20 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                  style="min-width: 110px"
                >
                  <span class="text-xl font-black leading-none text-brand">#</span>
                  <span class="mt-1 text-sm font-bold text-gray-900 dark:text-neutral-100">{{ tag.name }}</span>
                  <span class="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">{{ tag._count.products || tag._count.posts }} {{ tag._count.products ? 'products' : 'posts' }}</span>
                </button>
              </div>
            </div>

            <!-- Full hashtag grid -->
            <div class="mb-2 flex items-center gap-2" v-if="!searchInput">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">All hashtags</p>
            </div>
            <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <button
                v-for="tag in allTags"
                :key="tag.id"
                @click="openTagView(tag)"
                class="group flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white p-3 text-left transition-all hover:border-brand/20 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 dark:bg-brand/20">
                  <span class="text-sm font-black text-brand">#</span>
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-brand dark:text-neutral-200">{{ tag.name }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-neutral-500">{{ tag._count.products ? `${tag._count.products} products` : `${tag._count.posts} posts` }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: FRESH DROPS                                                    -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'fresh'" class="mt-5">
        <CategoryPills
          v-if="categories.length"
          :categories="categories"
          :model-value="selectedCategory"
          class="mb-4"
          @update:model-value="selectedCategory = $event"
        />
        <div v-if="freshLoading && !freshProducts.length" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div v-for="n in 10" :key="n" class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800" />
        </div>
        <div v-else-if="!freshLoading && !freshProducts.length" class="py-24 text-center">
          <Icon name="mdi:lightning-bolt-outline" size="48" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
          <p class="text-sm text-gray-500 dark:text-neutral-400">No fresh drops yet{{ searchInput ? ` for "${searchInput}"` : '' }}</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <ProductCardMini v-for="product in freshProducts" :key="product.id" :product="product" @open-detail="openDetail" />
        </div>
        <div ref="freshTrigger" class="mt-6 h-10" />
        <div v-if="freshLoading && freshProducts.length" class="flex justify-center py-8">
          <Icon name="eos-icons:loading" size="24" class="text-brand" />
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: DEALS                                                          -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'deals'" class="mt-5">
        <CategoryPills
          v-if="categories.length"
          :categories="categories"
          :model-value="selectedCategory"
          class="mb-4"
          @update:model-value="selectedCategory = $event"
        />
        <div v-if="dealLoading && !dealProducts.length" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div v-for="n in 10" :key="n" class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800" />
        </div>
        <div v-else-if="!dealLoading && !dealProducts.length" class="py-24 text-center">
          <Icon name="mdi:tag-heart-outline" size="48" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
          <p class="text-sm text-gray-500 dark:text-neutral-400">No deals right now{{ searchInput ? ` for "${searchInput}"` : '' }}</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <ProductCardMini v-for="product in dealProducts" :key="product.id" :product="product" @open-detail="openDetail" />
        </div>
        <div ref="dealTrigger" class="mt-6 h-10" />
        <div v-if="dealLoading && dealProducts.length" class="flex justify-center py-8">
          <Icon name="eos-icons:loading" size="24" class="text-brand" />
        </div>
      </div>

      <!-- ────────────────────────────────────────────────────────────────── -->
      <!-- TAB: PRE-LOVED                                                      -->
      <!-- ────────────────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'preloved'" class="mt-5">
        <CategoryPills
          v-if="categories.length"
          :categories="categories"
          :model-value="selectedCategory"
          class="mb-4"
          @update:model-value="selectedCategory = $event"
        />
        <div v-if="prelovedLoading && !prelovedProducts.length" class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div v-for="n in 10" :key="n" class="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800" />
        </div>
        <div v-else-if="!prelovedLoading && !prelovedProducts.length" class="py-24 text-center">
          <Icon name="mdi:recycle" size="48" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
          <p class="text-sm text-gray-500 dark:text-neutral-400">No pre-loved items yet{{ searchInput ? ` for "${searchInput}"` : '' }}</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <ProductCardMini v-for="product in prelovedProducts" :key="product.id" :product="product" @open-detail="openDetail" />
        </div>
        <div ref="prelovedTrigger" class="mt-6 h-10" />
        <div v-if="prelovedLoading && prelovedProducts.length" class="flex justify-center py-8">
          <Icon name="eos-icons:loading" size="24" class="text-brand" />
        </div>
      </div>
    </div>

    <!-- ─── MODALS ──────────────────────────────────────────────────────── -->
    <ProductDetailModal
      :product="selectedProduct"
      :loading="discoverDetailLoading"
      @close="selectedProduct = null"
    />
  </HomeLayout>
</template>

<script setup lang="ts">
import type { IProduct } from '~~/layers/commerce/app/types/commerce.types'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import ProductCardMini from '~~/layers/commerce/app/components/ProductCardMini.vue'
import ProductDetailModal from '~~/layers/commerce/app/components/modals/ProductDetailModal.vue'
import CategoryPills from '~~/layers/commerce/app/components/CategoryPills.vue'
import { useProductDetail } from '~~/layers/commerce/app/composables/useProductDetail'
import { useLayoutData } from '~~/layers/core/app/composables/useLayoutData'
import { useNavVisibility } from '~~/layers/core/app/composables/useNavVisibility'

const { setDiscoverPage } = useSeo()
setDiscoverPage()

// ── Nav visibility sync (for sticky header top offset) ────────────────────
const { mobileNavVisible } = useNavVisibility()
const discoverStickyTop = computed(() =>
  mobileNavVisible.value
    ? 'calc(3.5rem + env(safe-area-inset-top, 0px))'
    : '0px',
)

// ── Categories (for pills) ─────────────────────────────────────────────────
const { data: layoutData } = useLayoutData()
const categories = computed(() => layoutData.value?.categories ?? [])
const selectedCategory = ref<string | null>(null)

// ── Tabs ────────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'trending', label: 'Trending', icon: 'mdi:fire' },
  { key: 'fresh', label: 'Fresh Drops', icon: 'mdi:lightning-bolt' },
  { key: 'deals', label: 'Deals', icon: 'mdi:tag-heart-outline' },
  { key: 'preloved', label: 'Pre-loved', icon: 'mdi:recycle' },
  { key: 'products', label: 'Products', icon: 'mdi:shopping-outline' },
  { key: 'sellers', label: 'Sellers', icon: 'mdi:storefront-outline' },
  { key: 'people', label: 'People', icon: 'mdi:account-group-outline' },
  { key: 'tags', label: 'Tags', icon: 'mdi:tag-outline' },
] as const

type TabKey = (typeof tabs)[number]['key']
const activeTab = ref<TabKey>('trending')

const searchInput = ref('')

const searchPlaceholder = computed(() => {
  const map: Record<TabKey, string> = {
    trending: 'Search trending…',
    fresh: 'Search fresh drops…',
    deals: 'Search deals…',
    preloved: 'Search pre-loved items…',
    products: 'Search products…',
    sellers: 'Search stores…',
    people: 'Search people by name or @username',
    tags: 'Search tags…',
  }
  return map[activeTab.value]
})

// Reset search + category filter when switching tabs
watch(activeTab, () => {
  searchInput.value = ''
  selectedTag.value = null
  selectedCategory.value = null
})

// Reload current tab when category changes
watch(selectedCategory, () => {
  if (activeTab.value === 'products') loadProducts(true)
  else if (activeTab.value === 'fresh') loadFresh(true)
  else if (activeTab.value === 'deals') loadDeals(true)
  else if (activeTab.value === 'preloved') loadPreloved(true)
  else if (activeTab.value === 'sellers') loadSellers(true)
})

const {
  selectedProduct,
  detailLoading: discoverDetailLoading,
  openProduct: openDetail,
} = useProductDetail()
const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

// ── TRENDING ─────────────────────────────────────────────────────────────────
const trendingLoading = ref(false)
const trendingProducts = ref<IProduct[]>([])
const trendingTags = ref<any[]>([])
const featuredSellers = ref<any[]>([])

const loadTrending = async () => {
  trendingLoading.value = true
  try {
    const res = await $fetch<any>('/api/feed/trending')
    if (res?.data) {
      trendingProducts.value = res.data.trendingProducts ?? []
      trendingTags.value = res.data.trendingTags ?? []
      featuredSellers.value = res.data.featuredSellers ?? []
    }
  } catch {
    //
  } finally {
    trendingLoading.value = false
  }
}

// ── HORIZONTAL BAR STRIPS (shown in Trending tab) ─────────────────────────────
const freshStrip = ref<IProduct[]>([])
const dealStrip = ref<IProduct[]>([])
const prelovedStrip = ref<IProduct[]>([])
const stripsLoading = ref(false)

const loadStrips = async () => {
  stripsLoading.value = true
  const [fresh, deals, preloved] = await Promise.allSettled([
    fetchProducts({ status: 'PUBLISHED', limit: 10, offset: 0 }),
    fetchProducts({ status: 'PUBLISHED', limit: 10, offset: 0, minDiscount: 1 }),
    fetchProducts({ status: 'PUBLISHED', limit: 10, offset: 0, isThrift: true }),
  ])
  freshStrip.value = fresh.status === 'fulfilled' ? fresh.value?.products ?? [] : []
  dealStrip.value = deals.status === 'fulfilled' ? deals.value?.products ?? [] : []
  prelovedStrip.value = preloved.status === 'fulfilled' ? preloved.value?.products ?? [] : []
  stripsLoading.value = false
}

// ── FRESH DROPS (dedicated tab) ───────────────────────────────────────────────
const freshProducts = ref<IProduct[]>([])
const freshTotal = ref(0)
const freshLoading = ref(false)
const freshTrigger = ref<HTMLElement | null>(null)

const loadFresh = async (reset = false) => {
  if (reset) { freshProducts.value = []; freshTotal.value = 0 }
  if (freshLoading.value) return
  freshLoading.value = true
  try {
    const filters: any = { status: 'PUBLISHED' }
    if (searchInput.value.trim()) filters.search = searchInput.value.trim()
    if (selectedCategory.value) filters.categorySlug = selectedCategory.value
    const result = await fetchProducts({ ...filters, limit: PROD_LIMIT, offset: freshProducts.value.length })
    freshProducts.value.push(...(result?.products ?? []))
    freshTotal.value = result?.total ?? 0
  } catch {} finally { freshLoading.value = false }
}

// ── DEALS (dedicated tab) ─────────────────────────────────────────────────────
const dealProducts = ref<IProduct[]>([])
const dealTotal = ref(0)
const dealLoading = ref(false)
const dealTrigger = ref<HTMLElement | null>(null)

const loadDeals = async (reset = false) => {
  if (reset) { dealProducts.value = []; dealTotal.value = 0 }
  if (dealLoading.value) return
  dealLoading.value = true
  try {
    const filters: any = { status: 'PUBLISHED', minDiscount: 1 }
    if (searchInput.value.trim()) filters.search = searchInput.value.trim()
    if (selectedCategory.value) filters.categorySlug = selectedCategory.value
    const result = await fetchProducts({ ...filters, limit: PROD_LIMIT, offset: dealProducts.value.length })
    dealProducts.value.push(...(result?.products ?? []))
    dealTotal.value = result?.total ?? 0
  } catch {} finally { dealLoading.value = false }
}

// ── PRE-LOVED (dedicated tab) ─────────────────────────────────────────────────
const prelovedProducts = ref<IProduct[]>([])
const prelovedTotal = ref(0)
const prelovedLoading = ref(false)
const prelovedTrigger = ref<HTMLElement | null>(null)

const loadPreloved = async (reset = false) => {
  if (reset) { prelovedProducts.value = []; prelovedTotal.value = 0 }
  if (prelovedLoading.value) return
  prelovedLoading.value = true
  try {
    const filters: any = { status: 'PUBLISHED', isThrift: true }
    if (searchInput.value.trim()) filters.search = searchInput.value.trim()
    if (selectedCategory.value) filters.categorySlug = selectedCategory.value
    const result = await fetchProducts({ ...filters, limit: PROD_LIMIT, offset: prelovedProducts.value.length })
    prelovedProducts.value.push(...(result?.products ?? []))
    prelovedTotal.value = result?.total ?? 0
  } catch {} finally { prelovedLoading.value = false }
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
const productFilters = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New Arrivals' },
  { key: 'thrift', label: 'Thrift' },
  { key: 'deals', label: 'On Sale' },
]
const productFilter = ref('all')
const products = ref<IProduct[]>([])
const productsTotal = ref(0)
const productsLoading = ref(false)
const productTrigger = ref<HTMLElement | null>(null)
const PROD_LIMIT = 24

const { fetchProducts } = useProduct()

const loadProducts = async (reset = false) => {
  if (reset) {
    products.value = []
    productsTotal.value = 0
  }
  if (productsLoading.value) return
  productsLoading.value = true
  try {
    const filters: any = { status: 'PUBLISHED' }
    if (searchInput.value.trim()) filters.search = searchInput.value.trim()
    if (productFilter.value === 'thrift') filters.isThrift = true
    if (productFilter.value === 'deals') filters.minDiscount = 1
    if (selectedCategory.value) filters.categorySlug = selectedCategory.value
    const result = await fetchProducts({
      ...filters,
      limit: PROD_LIMIT,
      offset: products.value.length,
    })
    products.value.push(...(result?.products ?? []))
    productsTotal.value = result?.total ?? 0
  } catch {
    //
  } finally {
    productsLoading.value = false
  }
}

// ── SELLERS ───────────────────────────────────────────────────────────────────
const sellers = ref<any[]>([])
const sellersTotal = ref(0)
const sellersLoading = ref(false)
const sellerTrigger = ref<HTMLElement | null>(null)

const loadSellers = async (reset = false) => {
  if (reset) {
    sellers.value = []
    sellersTotal.value = 0
  }
  if (sellersLoading.value) return
  sellersLoading.value = true
  try {
    const res = await $fetch<any>('/api/seller/featured', {
      params: {
        limit: 20,
        offset: sellers.value.length,
        search: searchInput.value.trim() || undefined,
        categorySlug: selectedCategory.value || undefined,
      },
    })
    if (res?.data) {
      sellers.value.push(...res.data)
      sellersTotal.value = res.meta?.total ?? res.data.length
    }
  } catch {
    //
  } finally {
    sellersLoading.value = false
  }
}

// ── PEOPLE ─────────────────────────────────────────────────────────────────
const people = ref<any[]>([])
const peopleLoading = ref(false)

const searchPeople = async (q: string) => {
  if (!q || q.trim().length < 1) {
    people.value = []
    return
  }
  peopleLoading.value = true
  try {
    const res = await $fetch<any>('/api/search', {
      params: { q: q.replace(/^@/, '').trim(), type: 'users', limit: 20 },
    })
    people.value = res?.data?.users ?? []
  } catch {
    people.value = []
  } finally {
    peopleLoading.value = false
  }
}

// ── TAGS ──────────────────────────────────────────────────────────────────
const allTags = ref<any[]>([])
const tagsLoading = ref(false)
const selectedTag = ref<any | null>(null)
const tagProducts = ref<IProduct[]>([])
const tagTotal = ref(0)
const tagProductsLoading = ref(false)

const loadTags = async (search?: string) => {
  tagsLoading.value = true
  try {
    const res = await $fetch<any>('/api/tags', {
      params: { limit: 100, search: search || undefined },
    })
    allTags.value = res?.data ?? []
  } catch {
    //
  } finally {
    tagsLoading.value = false
  }
}

const openTagView = async (tag: any) => {
  selectedTag.value = tag
  tagProducts.value = []
  tagTotal.value = 0
  tagProductsLoading.value = true
  try {
    const res = await $fetch<any>(`/api/tags/${tag.id}/products`)
    tagProducts.value = res?.data?.products ?? []
    tagTotal.value = res?.data?.total ?? 0
  } catch {
    //
  } finally {
    tagProductsLoading.value = false
  }
  // Switch to tags tab if not already there
  activeTab.value = 'tags'
}

// ── Watchers & search debouncing ──────────────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const debouncedSearchAction = (val: string) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (activeTab.value === 'products') loadProducts(true)
    else if (activeTab.value === 'fresh') loadFresh(true)
    else if (activeTab.value === 'deals') loadDeals(true)
    else if (activeTab.value === 'preloved') loadPreloved(true)
    else if (activeTab.value === 'sellers') loadSellers(true)
    else if (activeTab.value === 'people') searchPeople(val)
    else if (activeTab.value === 'tags') loadTags(val)
  }, 350)
}

watch(searchInput, (val) => debouncedSearchAction(val))
watch(productFilter, () => loadProducts(true))

// Load data when tab changes
// Guard tags: don't auto-load if we're about to handle a ?tagName= param
const route = useRoute()
watch(activeTab, (tab) => {
  if (tab === 'trending' && !trendingProducts.value.length) loadTrending()
  else if (tab === 'fresh' && !freshProducts.value.length) loadFresh()
  else if (tab === 'deals' && !dealProducts.value.length) loadDeals()
  else if (tab === 'preloved' && !prelovedProducts.value.length) loadPreloved()
  else if (tab === 'products' && !products.value.length) loadProducts()
  else if (tab === 'sellers' && !sellers.value.length) loadSellers()
  else if (tab === 'tags' && !allTags.value.length && !route.query.tagName) loadTags()
})

// ── Tag deep-link handler (used by onMounted + route watcher) ─────────────
const handleTagNameParam = async (tagName: string) => {
  activeTab.value = 'tags'
  selectedTag.value = null
  tagProducts.value = []
  await loadTags(tagName)
  const match = allTags.value.find(
    (t) => t.name.toLowerCase() === tagName.toLowerCase(),
  )
  if (match) {
    await openTagView(match)
  } else {
    // Tag exists in captions but has no products yet — load full tag list as fallback
    await loadTags()
  }
}

// Handle within-page navigation (already on /discover, route.query changes)
watch(() => route.query.tagName, (newTagName) => {
  if (newTagName && typeof newTagName === 'string') {
    handleTagNameParam(newTagName)
  }
})

// ── Infinite scroll ───────────────────────────────────────────────────────
const productHasMore = computed(() => products.value.length < productsTotal.value)
const sellerHasMore = computed(() => sellers.value.length < sellersTotal.value)
const freshHasMore = computed(() => freshProducts.value.length < freshTotal.value)
const dealHasMore = computed(() => dealProducts.value.length < dealTotal.value)
const prelovedHasMore = computed(() => prelovedProducts.value.length < prelovedTotal.value)

onMounted(async () => {
  const tabParam = route.query.tab as string | undefined

  // Handle deep-links: ?tab=tags&tagId=N, ?tab=fresh, ?tab=deals, ?tab=preloved, etc.
  if (tabParam === 'tags') {
    activeTab.value = 'tags'
    await loadTags()
    const tagId = Number(route.query.tagId)
    if (tagId) {
      const tag = allTags.value.find((t) => t.id === tagId)
      if (tag) openTagView(tag)
    }
    return
  }

  // Handle ?tagName=fashion deep-link (from clicking hashtags in PostCard)
  const tagNameParam = route.query.tagName as string | undefined
  if (tagNameParam) {
    await handleTagNameParam(tagNameParam)
    return
  }

  const validTabs = ['trending', 'fresh', 'deals', 'preloved', 'products', 'sellers', 'people', 'tags'] as const
  if (tabParam && (validTabs as readonly string[]).includes(tabParam)) {
    activeTab.value = tabParam as typeof activeTab.value
    // Load data for the target tab
    if (tabParam === 'fresh') { loadStrips(); loadFresh(); return }
    if (tabParam === 'deals') { loadStrips(); loadDeals(); return }
    if (tabParam === 'preloved') { loadStrips(); loadPreloved(); return }
    if (tabParam === 'products') { loadProducts(); return }
    if (tabParam === 'sellers') { loadSellers(); return }
  }

  // Default: load trending + horizontal strips in parallel
  loadTrending()
  loadStrips()

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return
      if (activeTab.value === 'products' && productHasMore.value) loadProducts()
      else if (activeTab.value === 'sellers' && sellerHasMore.value) loadSellers()
      else if (activeTab.value === 'fresh' && freshHasMore.value) loadFresh()
      else if (activeTab.value === 'deals' && dealHasMore.value) loadDeals()
      else if (activeTab.value === 'preloved' && prelovedHasMore.value) loadPreloved()
    },
    { rootMargin: '400px' },
  )

  watchEffect(() => {
    if (productTrigger.value) observer.observe(productTrigger.value)
    if (sellerTrigger.value) observer.observe(sellerTrigger.value)
    if (freshTrigger.value) observer.observe(freshTrigger.value)
    if (dealTrigger.value) observer.observe(dealTrigger.value)
    if (prelovedTrigger.value) observer.observe(prelovedTrigger.value)
  })

  onUnmounted(() => observer.disconnect())
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

/* Outer wrapper — top padding matches fixed mobile nav height + safe area */
.discover-page-wrap {
  padding-top: calc(3.5rem + env(safe-area-inset-top, 0px));
}
@media (min-width: 768px) {
  .discover-page-wrap { padding-top: 0; }
}

/* Sticky discover header — top is driven by JS (discoverStickyTop) so it
   tracks the mobile nav's show/hide animation in perfect sync */
.discover-sticky-header {
  position: sticky;
  z-index: 20;
  /* Matches the mobile nav transition so header rises/falls with it */
  transition: top 300ms ease-in-out;
}

@media (min-width: 768px) {
  /* Desktop: no fixed mobile nav, always stick to very top */
  .discover-sticky-header {
    top: 0 !important;
  }
}

/* ── Horizontal scroll strip wrapper + right fade cue ── */
.scroll-strip-wrap {
  position: relative;
}

/* The fade div sits at the right edge, pointer-events off so it doesn't block taps */
.scroll-fade-right {
  position: absolute;
  top: 0;
  right: -1px; /* cover any subpixel gap */
  bottom: 4px; /* above the pb-2 scroll track */
  width: 52px;
  pointer-events: none;
  background: linear-gradient(to right, transparent, #f9fafb);
}

/* Dark mode: match bg-neutral-950 page background */
:global(.dark) .scroll-fade-right {
  background: linear-gradient(to right, transparent, #030712);
}

/* Snap behaviour for strips */
.snap-x { scroll-snap-type: x mandatory; }
.snap-mandatory { scroll-snap-type: x mandatory; }
.snap-start { scroll-snap-align: start; }
</style>
