<template>
  <div
    class="flex h-full flex-col border-l border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- ─── HEADER ────────────────────────────────────────────────────────── -->
    <div
      class="flex shrink-0 items-center justify-between border-b border-gray-100 p-4 dark:border-neutral-800"
    >
      <div>
        <h2
          class="flex items-center gap-2 font-bold text-gray-900 dark:text-neutral-100"
        >
          <Icon
            name="mdi:chart-timeline-variant"
            size="20"
            class="text-brand"
          />
          Store Analytics
        </h2>
        <p class="mt-0.5 text-[11px] text-gray-500 dark:text-neutral-400">
          Real-time performance overview
        </p>
      </div>
      <NuxtLink
        v-if="storeSlug"
        :to="`/seller/${storeSlug}/orders`"
        class="rounded-lg bg-gray-50 p-1.5 text-gray-500 transition-colors hover:text-gray-900 dark:bg-neutral-800 dark:hover:text-white"
        title="View all orders"
      >
        <Icon name="mdi:storefront-outline" size="18" />
      </NuxtLink>
    </div>

    <!-- ─── SCROLLABLE CONTENT AREA ───────────────────────────────────────── -->
    <div class="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
      <!-- Loading skeleton -->
      <template v-if="isLoading">
        <div class="space-y-3">
          <div
            class="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
          />
          <div
            class="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800"
          />
          <div
            v-for="i in 3"
            :key="i"
            class="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800"
          />
        </div>
      </template>

      <!-- No store state -->
      <div
        v-else-if="!storeSlug"
        class="flex flex-col items-center justify-center gap-3 py-12 text-center"
      >
        <Icon
          name="mdi:store-off-outline"
          size="36"
          class="text-gray-300 dark:text-neutral-600"
        />
        <p
          class="text-[13px] font-semibold text-gray-500 dark:text-neutral-400"
        >
          No store found
        </p>
        <NuxtLink
          to="/sellers/create"
          class="text-[12px] font-bold text-brand hover:text-[#d81b36]"
        >
          Open a store →
        </NuxtLink>
      </div>

      <template v-else>
        <!-- 1. Revenue Summary Card -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-brand/10 bg-gradient-to-br from-brand/5 to-purple-500/5 p-5 shadow-sm dark:from-brand/10 dark:to-purple-500/10"
        >
          <div
            class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand/10 blur-2xl transition-colors group-hover:bg-brand/20"
          ></div>

          <p
            class="relative z-10 mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
          >
            Revenue (This Week)
          </p>
          <h3
            class="relative z-10 text-3xl font-black tracking-tight text-gray-900 dark:text-white"
          >
            {{ formatKobo(revenueThisWeek) }}
          </h3>

          <div
            class="relative z-10 mt-3 flex w-max items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            <Icon name="mdi:receipt-text-outline" size="14" />
            <span
              >{{ ordersThisWeek }} order{{
                ordersThisWeek !== 1 ? 's' : ''
              }}
              this week</span
            >
          </div>
        </div>

        <!-- 2. Fulfillment Status Breakdown -->
        <div v-if="orders.length">
          <h4
            class="mb-4 text-sm font-bold text-gray-900 dark:text-neutral-100"
          >
            Fulfillment Status
          </h4>
          <div class="space-y-4">
            <!-- Pending -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <span
                  class="flex items-center gap-1.5 font-medium text-gray-600 dark:text-neutral-400"
                >
                  <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                  Pending
                </span>
                <span class="font-bold text-gray-900 dark:text-white">{{
                  pendingCount
                }}</span>
              </div>
              <div
                class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <div
                  class="h-1.5 rounded-full bg-amber-500 transition-all"
                  :style="{ width: barWidth(pendingCount) }"
                ></div>
              </div>
            </div>

            <!-- Shipped -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <span
                  class="flex items-center gap-1.5 font-medium text-gray-600 dark:text-neutral-400"
                >
                  <span class="h-2 w-2 rounded-full bg-blue-500"></span> Shipped
                </span>
                <span class="font-bold text-gray-900 dark:text-white">{{
                  shippedCount
                }}</span>
              </div>
              <div
                class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <div
                  class="h-1.5 rounded-full bg-blue-500 transition-all"
                  :style="{ width: barWidth(shippedCount) }"
                ></div>
              </div>
            </div>

            <!-- Completed -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-sm">
                <span
                  class="flex items-center gap-1.5 font-medium text-gray-600 dark:text-neutral-400"
                >
                  <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Completed
                </span>
                <span class="font-bold text-gray-900 dark:text-white">{{
                  completedCount
                }}</span>
              </div>
              <div
                class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <div
                  class="h-1.5 rounded-full bg-emerald-500 transition-all"
                  :style="{ width: barWidth(completedCount) }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Recent Orders Feed -->
        <div>
          <div
            class="mb-3 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-neutral-800"
          >
            <h4 class="text-sm font-bold text-gray-900 dark:text-neutral-100">
              Recent Orders
            </h4>
            <NuxtLink
              :to="`/seller/${storeSlug}/orders`"
              class="text-[11px] font-bold text-brand transition-colors hover:text-[#d81b36]"
              >View All →</NuxtLink
            >
          </div>

          <!-- Empty state -->
          <div
            v-if="!recentOrders.length"
            class="py-6 text-center text-[13px] text-gray-400 dark:text-neutral-500"
          >
            No orders yet. Share your store!
          </div>

          <div v-else class="space-y-1">
            <NuxtLink
              v-for="order in recentOrders"
              :key="order.id"
              :to="`/seller/${storeSlug}/orders`"
              class="group -mx-2 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-gray-200 hover:bg-gray-50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
                :class="statusConfig(order.status).bgClass"
              >
                <Icon
                  :name="statusConfig(order.status).icon"
                  size="18"
                  :class="statusConfig(order.status).iconClass"
                />
              </div>

              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-[13px] font-bold text-gray-900 dark:text-neutral-100"
                >
                  {{ order.user?.username ?? order.name ?? 'Customer' }}
                </p>
                <p
                  class="truncate text-[11px] text-gray-500 dark:text-neutral-400"
                >
                  {{ firstItemTitle(order) }}
                </p>
              </div>

              <div class="shrink-0 text-right">
                <p class="text-[13px] font-bold text-gray-900 dark:text-white">
                  {{ formatKobo(order.totalAmount) }}
                </p>
                <!-- Affiliate breakdown pill -->
                <p
                  v-if="order.sellerBreakdown?.affiliateCut > 0"
                  class="mt-0.5 text-[10px] text-purple-500"
                >
                  net {{ fmtNGN(order.sellerBreakdown.net) }}
                </p>
                <p
                  class="mt-0.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="statusConfig(order.status).iconClass"
                >
                  {{ order.status }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </template>
    </div>

    <!-- ─── STICKY BOTTOM CTA ──────────────────────────────────────────────── -->
    <div
      class="sticky bottom-0 flex-shrink-0 border-t border-gray-100 bg-white px-4 pb-5 pt-3 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <NuxtLink
        v-if="storeSlug"
        :to="`/seller/${storeSlug}/orders`"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-[13px] font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-gray-900"
      >
        <Icon name="mdi:storefront-outline" size="18" />
        Manage Orders
      </NuxtLink>
      <NuxtLink
        v-else
        to="/sellers/create"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[13px] font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
      >
        <Icon name="mdi:store-plus-outline" size="18" />
        Open a Store
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useOrderApi } from '~~/layers/commerce/app/services/order.api'

const sellerStore = useSellerStore()
const orderApi = useOrderApi()
const { formatKobo } = useCurrency()
const fmtNGN = (major: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(major)

const orders = ref<any[]>([])
const isLoading = ref(false)

const storeSlug = computed<string | null>(
  () => sellerStore.sellers[0]?.store_slug ?? null,
)

onMounted(async () => {
  if (!storeSlug.value) return
  try {
    isLoading.value = true
    const res = await orderApi.getSellerOrders(storeSlug.value, { limit: 20 })
    orders.value = res?.data?.orders ?? []
  } catch {
    // fail silently
  } finally {
    isLoading.value = false
  }
})

// ── Computed ────────────────────────────────────────────────────────────────

const revenueThisWeek = computed(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return orders.value
    .filter(
      (o) =>
        new Date(o.created_at).getTime() >= cutoff &&
        o.paymentStatus === 'PAID',
    )
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0)
})

const ordersThisWeek = computed(() => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  return orders.value.filter((o) => new Date(o.created_at).getTime() >= cutoff)
    .length
})

const pendingCount = computed(
  () =>
    orders.value.filter((o) => ['PENDING', 'CONFIRMED'].includes(o.status))
      .length,
)
const shippedCount = computed(
  () => orders.value.filter((o) => o.status === 'SHIPPED').length,
)
const completedCount = computed(
  () => orders.value.filter((o) => o.status === 'DELIVERED').length,
)

const totalOrders = computed(() => orders.value.length || 1)

const barWidth = (count: number) =>
  `${Math.round((count / totalOrders.value) * 100)}%`

const recentOrders = computed(() => orders.value.slice(0, 4))

// ── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig = (status: string) => {
  if (['PENDING', 'CONFIRMED'].includes(status))
    return {
      icon: 'mdi:package-variant',
      iconClass: 'text-amber-600 dark:text-amber-500',
      bgClass: 'bg-amber-50 dark:bg-amber-500/10',
    }
  if (status === 'SHIPPED')
    return {
      icon: 'mdi:truck-fast-outline',
      iconClass: 'text-blue-600 dark:text-blue-500',
      bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    }
  if (status === 'DELIVERED')
    return {
      icon: 'mdi:check-decagram-outline',
      iconClass: 'text-emerald-600 dark:text-emerald-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    }
  return {
    icon: 'mdi:close-circle-outline',
    iconClass: 'text-gray-400 dark:text-neutral-500',
    bgClass: 'bg-gray-100 dark:bg-neutral-800',
  }
}

const firstItemTitle = (order: any): string => {
  const title = order.orderItem?.[0]?.variant?.product?.title ?? 'Product'
  const extra = (order.orderItem?.length ?? 1) - 1
  return extra > 0 ? `${title} +${extra} more` : title
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #404040;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #525252;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
:global(.dark) .custom-scrollbar {
  scrollbar-color: #404040 transparent;
}
</style>
