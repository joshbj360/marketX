<!-- Market home — rendered inside HomeLayout by the auth-aware index.vue -->
<template>
  <div class="w-full space-y-10 px-1 sm:px-2">
    <!-- ─── 1. DEALS ──────────────────────────────────────────────────────── -->
    <section>
      <div class="mb-4 flex items-end justify-between">
        <div>
          <p
            class="text-[11px] font-semibold uppercase tracking-widest text-brand"
          >
            On sale now
          </p>
          <h2
            class="text-xl font-extrabold leading-tight text-gray-900 dark:text-white"
          >
            Today's deals
          </h2>
        </div>
        <NuxtLink
          to="/discover?tab=deals"
          class="mb-0.5 text-xs font-semibold text-gray-400 hover:text-brand dark:text-neutral-500"
        >
          See all →
        </NuxtLink>
      </div>

      <div
        v-if="dealsLoading && !deals.length"
        class="h-52 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        style="contain: strict"
      />
      <FeedProductShelf
        v-else-if="deals.length"
        :products="deals"
        :priority="true"
        label="Today's deals"
        @open-product="openProduct"
      />
      <p
        v-else-if="!dealsLoading"
        class="py-6 text-center text-sm text-gray-400 dark:text-neutral-500"
      >
        No deals right now — check back soon
      </p>
    </section>

    <!-- ─── 2. MARKETS (Squares) ──────────────────────────────────────────── -->
    <section>
      <div class="mb-4 flex items-end justify-between">
        <h2 class="text-base font-bold text-gray-900 dark:text-white">
          Browse by market
        </h2>
        <NuxtLink
          to="/squares"
          class="text-xs font-semibold text-gray-400 hover:text-brand dark:text-neutral-500"
        >
          All markets →
        </NuxtLink>
      </div>

      <div
        v-if="squaresLoading && !squares.length"
        class="scrollbar-hide flex gap-3 overflow-x-auto pb-1"
        style="height: 116px; contain: strict"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="h-[108px] w-36 shrink-0 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        />
      </div>

      <!-- Empty / error state — API failed or no squares seeded -->
      <p
        v-else-if="!squaresLoading && !squares.length"
        class="text-xs text-gray-400 dark:text-neutral-500"
      >
        No squares yet
      </p>

      <div
        v-else-if="squares.length"
        class="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1 pb-1"
      >
        <NuxtLink
          v-for="sq in squares"
          :key="sq.id"
          :to="`/squares/${sq.slug}`"
          class="group w-36 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="relative h-14 overflow-hidden"
            :style="
              sq.bannerUrl
                ? ''
                : `background: linear-gradient(135deg, ${sq.accentColor || '#f59e0b'}33, ${sq.accentColor || '#f59e0b'}08)`
            "
          >
            <img
              v-if="sq.bannerUrl"
              :src="sqBanner(sq.bannerUrl)"
              :alt="sq.name"
              width="144"
              height="56"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div
              class="absolute -bottom-4 left-2.5 flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow dark:border-neutral-900 dark:bg-neutral-900"
            >
              <img
                v-if="sq.iconUrl"
                :src="sqIcon(sq.iconUrl)"
                :alt="sq.name"
                width="32"
                height="32"
                class="h-full w-full rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
              <span
                v-else
                class="text-[10px] font-black"
                :style="`color: ${sq.accentColor || '#f59e0b'}`"
              >
                {{ sq.name.slice(0, 2).toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="pb-3 pl-2.5 pr-2 pt-6">
            <p
              class="truncate text-[12px] font-bold text-gray-900 dark:text-white"
            >
              {{ sq.name }}
            </p>
            <p class="mt-0.5 text-[10px] text-gray-400 dark:text-neutral-500">
              {{ sq.memberCount ?? 0 }} sellers
            </p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/squares"
          class="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-gray-200 text-gray-400 transition hover:border-brand/40 hover:text-brand dark:border-neutral-700"
        >
          <Icon name="mdi:plus" size="20" />
          <span class="text-[10px] font-semibold">More</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ─── 3. SELLERS ONLINE ─────────────────────────────────────────────── -->
    <section ref="section3Ref">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">
            Selling now
          </h2>
          <span
            class="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400"
          >
            <span class="block h-1.5 w-1.5 rounded-full bg-green-500" />
            Live
          </span>
        </div>
        <NuxtLink
          to="/map"
          class="text-xs font-semibold text-gray-400 hover:text-brand dark:text-neutral-500"
        >
          Map →
        </NuxtLink>
      </div>

      <div
        v-if="sellersLoading && !onlineSellers.length"
        class="scrollbar-hide flex gap-4 overflow-x-auto pb-1"
        style="height: 88px; contain: strict"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="flex shrink-0 flex-col items-center gap-2"
        >
          <div
            class="h-[56px] w-[56px] animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800"
          />
          <div
            class="h-2 w-10 animate-pulse rounded bg-gray-200 dark:bg-neutral-800"
          />
        </div>
      </div>

      <div
        v-else-if="onlineSellers.length"
        class="scrollbar-hide flex gap-4 overflow-x-auto pb-1"
      >
        <NuxtLink
          v-for="store in onlineSellers"
          :key="store.store_slug"
          :to="`/sellers/profile/${store.store_slug}`"
          class="group flex shrink-0 flex-col items-center gap-1.5"
        >
          <div class="relative">
            <div
              class="h-[56px] w-[56px] overflow-hidden rounded-full bg-gray-100 ring-2 ring-green-400 ring-offset-1 dark:bg-neutral-800 dark:ring-offset-neutral-950"
            >
              <img
                v-if="store.store_logo"
                :src="sellerAvatar(store.store_logo)"
                :alt="store.store_name ?? ''"
                width="56"
                height="56"
                class="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-sm font-black text-brand"
              >
                {{
                  (store.store_name ?? store.store_slug ?? '?')
                    .slice(0, 2)
                    .toUpperCase()
                }}
              </div>
            </div>
            <span
              class="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-neutral-950"
            />
            <span
              v-if="store.hasActiveDeal"
              class="absolute -right-0.5 -top-0.5 rounded-full bg-brand px-1 py-px text-[8px] font-black leading-tight text-white"
            >
              DEAL
            </span>
          </div>
          <p
            class="w-[60px] truncate text-center text-[11px] font-medium text-gray-600 group-hover:text-brand dark:text-neutral-400"
          >
            {{ store.store_name || store.store_slug }}
          </p>
        </NuxtLink>
      </div>

      <button
        v-else-if="section3Loaded && !sellersLoading"
        class="flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-left hover:border-brand/30 dark:border-neutral-700 dark:bg-neutral-800/40"
        :disabled="sellersRequesting"
        @click="requestSellerLocation"
      >
        <Icon
          v-if="sellersRequesting"
          name="mdi:loading"
          size="18"
          class="animate-spin text-brand"
        />
        <Icon
          v-else
          name="mdi:crosshairs-gps"
          size="18"
          class="text-gray-400"
        />
        <span class="text-[13px] text-gray-500 dark:text-neutral-400">
          {{
            sellersRequesting
              ? 'Finding sellers near you…'
              : "See who's selling near you"
          }}
        </span>
      </button>
    </section>

    <!-- ─── 4. FRESH STOCK ────────────────────────────────────────────────── -->
    <section ref="section4Ref">
      <div class="mb-4 flex items-end justify-between">
        <div>
          <h2 class="text-base font-bold text-gray-900 dark:text-white">
            Just in
          </h2>
          <p class="text-[11px] text-gray-400 dark:text-neutral-500">
            New listings from the past week
          </p>
        </div>
        <NuxtLink
          to="/discover?tab=fresh"
          class="mb-0.5 text-xs font-semibold text-gray-400 hover:text-brand dark:text-neutral-500"
        >
          See all →
        </NuxtLink>
      </div>

      <div
        v-if="freshLoading && !freshItems.length"
        class="h-52 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
        style="contain: strict"
      />
      <FeedProductShelf
        v-else-if="freshItems.length"
        :products="freshItems"
        label="Just in"
        @open-product="openProduct"
      />
    </section>

    <!-- ─── 5. FROM THE MARKET ────────────────────────────────────────────── -->
    <section ref="section5Ref">
      <div class="mb-4 flex items-end justify-between">
        <h2 class="text-base font-bold text-gray-900 dark:text-white">
          What people are saying
        </h2>
        <NuxtLink
          to="/"
          class="mb-0.5 text-xs font-semibold text-gray-400 hover:text-brand dark:text-neutral-500"
          @click.prevent="$emit('sign-in')"
        >
          Sign in for more →
        </NuxtLink>
      </div>

      <div v-if="postsLoading && !marketPosts.length" class="space-y-4">
        <div
          v-for="i in 2"
          :key="i"
          class="h-44 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
          style="contain: strict"
        />
      </div>

      <div v-else-if="marketPosts.length" class="space-y-4">
        <PostCard
          v-for="post in marketPosts"
          :key="post.id"
          :post="post"
          @open-comments="commentPost = $event"
          @open-details="selectedPost = $event"
          @open-product="openProduct"
        />
      </div>
    </section>

    <!-- ─── 6. MAP CTA ────────────────────────────────────────────────────── -->
    <section class="pb-4">
      <NuxtLink
        to="/map"
        class="flex items-center gap-4 rounded-2xl bg-gray-900 px-5 py-4 transition hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <Icon
          name="mdi:map-search-outline"
          size="28"
          class="shrink-0 text-white/60"
        />
        <div class="min-w-0 flex-1">
          <p class="font-bold text-white">Explore the market map</p>
          <p class="text-[12px] text-white/50">
            Stores, pop-ups and deals near you
          </p>
        </div>
        <Icon name="mdi:arrow-right" size="20" class="shrink-0 text-white/40" />
      </NuxtLink>
    </section>

    <!-- Modals — teleported to body, position in DOM doesn't matter -->
    <ProductDetailModal
      v-if="selectedProduct"
      :product="selectedProduct"
      :loading="productDetailLoading"
      @close="selectedProduct = null"
      @open-comments="
        (p) => {
          commentProduct = p
          selectedProduct = null
        }
      "
    />
    <ProductCommentModal
      :is-open="!!commentProduct"
      :product="commentProduct"
      @close="commentProduct = null"
    />
    <PostCommentModal
      :is-open="!!commentPost"
      :post="commentPost"
      @close="commentPost = null"
    />
    <PostDetailModal
      v-if="selectedPost"
      :post="selectedPost"
      @close="selectedPost = null"
    />
  </div>
</template>

<script setup lang="ts">
import FeedProductShelf from '~~/layers/feed/app/components/FeedProductShelf.vue'
import PostCard from '~~/layers/social/app/components/PostCard.vue'
import ProductDetailModal from '~~/layers/commerce/app/components/modals/ProductDetailModal.vue'
import PostDetailModal from '~~/layers/social/app/components/modals/PostDetailModal.vue'
import ProductCommentModal from '~~/layers/commerce/app/components/modals/ProductCommentModal.vue'
import PostCommentModal from '~~/layers/social/app/components/modals/PostCommentModal.vue'

import { ref } from 'vue'
import { imgThumb } from '~~/layers/core/app/utils/cloudinary'
import { useProductDetail } from '~~/layers/commerce/app/composables/useProductDetail'
import { useMarketHome } from '../composables/useMarketHome'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'
import type { IProduct } from '~~/layers/social/app/types/post.types'

defineEmits<{ 'sign-in': [] }>()

const {
  selectedProduct,
  detailLoading: productDetailLoading,
  openProduct,
} = useProductDetail()
const commentProduct = ref<IProduct | null>(null)
const commentPost = ref<IFeedItem | null>(null)
const selectedPost = ref<IFeedItem | null>(null)

const sqBanner = (url: string) => imgThumb(url, 144, 56)
const sqIcon = (url: string) => imgThumb(url, 64, 64)
const sellerAvatar = (url: string) => imgThumb(url, 112, 112)

const {
  deals,
  dealsLoading,
  squares,
  squaresLoading,
  section3Ref,
  section3Loaded,
  onlineSellers,
  sellersLoading,
  sellersRequesting,
  requestSellerLocation,
  section4Ref,
  freshItems,
  freshLoading,
  section5Ref,
  marketPosts,
  postsLoading,
} = useMarketHome()
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
