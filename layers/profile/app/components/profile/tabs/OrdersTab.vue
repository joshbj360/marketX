<template>
  <div class="space-y-6 p-6">
    <!-- Seller: Pending Store Orders Banner -->
    <template v-if="hasSellers && pendingSellerOrders.length">
      <div
        class="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10"
      >
        <div
          class="flex items-center justify-between border-b border-amber-200 px-4 py-3 dark:border-amber-800"
        >
          <div class="flex items-center gap-2">
            <Icon
              name="mdi:store-clock"
              size="20"
              class="text-amber-600 dark:text-amber-400"
            />
            <span
              class="text-sm font-semibold text-amber-800 dark:text-amber-300"
            >
              {{ pendingSellerOrders.length }} Pending Store
              {{ pendingSellerOrders.length === 1 ? 'Order' : 'Orders' }}
            </span>
          </div>
          <NuxtLink
            v-if="sellers[0]"
            :to="`/seller/${sellers[0].store_slug}/orders`"
            class="text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
          >
            Manage →
          </NuxtLink>
        </div>

        <div class="divide-y divide-amber-100 dark:divide-amber-900/30">
          <div
            v-for="order in pendingSellerOrders.slice(0, 5)"
            :key="`seller-${order.id}`"
            class="flex items-center justify-between px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <!-- product thumbnails -->
              <div class="flex -space-x-2">
                <img
                  v-for="(item, i) in order.orderItem.slice(0, 2)"
                  :key="i"
                  :src="item.variant?.product?.media?.[0]?.url || ''"
                  class="h-9 w-9 rounded-lg border-2 border-white bg-gray-100 object-cover dark:border-neutral-800"
                />
              </div>
              <div>
                <p
                  class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                >
                  Order #{{ order.id }}
                  <span
                    v-if="order.orderItem.length > 2"
                    class="text-xs text-gray-400"
                  >
                    +{{ order.orderItem.length - 2 }} more</span
                  >
                </p>
                <p class="text-xs text-gray-500 dark:text-neutral-400">
                  {{ order.name }} · {{ formatDate(order.created_at) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900 dark:text-neutral-100">
                {{
                  formatKobo(
                    (order.totalAmount || 0) + (order.shippingCost || 0),
                  )
                }}
              </p>
              <span
                class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="pendingSellerOrders.length > 5"
          class="px-4 py-2 text-center text-xs text-amber-600 dark:text-amber-400"
        >
          + {{ pendingSellerOrders.length - 5 }} more pending orders
        </div>
      </div>
    </template>

    <!-- My Purchases header -->
    <div class="flex items-center gap-2">
      <Icon
        name="mdi:shopping-outline"
        size="18"
        class="text-gray-400 dark:text-neutral-500"
      />
      <h3
        class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400"
      >
        My Purchases
      </h3>
    </div>

    <!-- Filter Tabs -->
    <div class="scrollbar-hide flex gap-2 overflow-x-auto">
      <button
        v-for="filter in orderFilters"
        :key="filter.id"
        @click="activeFilter = filter.id"
        class="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        :class="
          activeFilter === filter.id
            ? 'bg-brand text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
        "
      >
        {{ filter.label }}
        <span v-if="filter.count > 0" class="ml-1">({{ filter.count }})</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 text-center">
      <Icon
        name="eos-icons:loading"
        size="32"
        class="animate-spin text-brand"
      />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="py-12 text-center">
      <Icon
        name="mdi:package-variant-closed"
        size="64"
        class="mx-auto mb-4 text-gray-300 dark:text-neutral-700"
      />
      <p class="mb-4 text-gray-500 dark:text-neutral-400">No orders found</p>
      <button
        @click="goToShop"
        class="rounded-lg bg-brand px-6 py-2 font-semibold text-white transition-colors hover:bg-[#d81b36]"
      >
        Start Shopping
      </button>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-4">
      <OrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @track="trackOrder"
        @cancel="handleCancelOrder"
      />

      <!-- Load More -->
      <button
        v-if="hasMore"
        @click="loadMore"
        :disabled="isLoading"
        class="w-full rounded-lg py-3 font-semibold text-brand transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-neutral-800"
      >
        Load More Orders
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import OrderCard from '../cards/OrderCard.vue'
import { useOrder } from '~~/layers/commerce/app/composables/useOrder'
import { useOrderApi } from '~~/layers/commerce/app/services/order.api'
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'
import { useCurrency } from '~~/layers/core/app/composables/useCurrency'

const router = useRouter()
const { formatKobo } = useCurrency()
const {
  orders: storeOrders,
  isLoading,
  total,
  fetchMyOrders,
  cancelOrder: cancelOrderApi,
} = useOrder()
const orderApi = useOrderApi()
const { sellers, hasSellers, loadUserSellers } = useSellerManagement()

const activeFilter = ref('all')
const limit = 20
const offset = ref(0)
const pendingSellerOrders = ref<any[]>([])

const orders = storeOrders
const hasMore = computed(() => orders.value.length < total.value)

const orderFilters = computed(() => [
  { id: 'all', label: 'All Orders', count: orders.value.length },
  {
    id: 'pending',
    label: 'Pending',
    count: orders.value.filter((o) => o.status === 'PENDING').length,
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    count: orders.value.filter((o) => o.status === 'CONFIRMED').length,
  },
  {
    id: 'shipped',
    label: 'Shipped',
    count: orders.value.filter((o) => o.status === 'SHIPPED').length,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    count: orders.value.filter((o) => o.status === 'DELIVERED').length,
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    count: orders.value.filter((o) => o.status === 'CANCELLED').length,
  },
])

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return orders.value
  return orders.value.filter(
    (o) => o.status.toLowerCase() === activeFilter.value,
  )
})

const fetchPendingSellerOrders = async () => {
  if (!sellers.value.length) return
  try {
    const results = await Promise.allSettled(
      sellers.value.map((s: any) =>
        orderApi.getSellerOrders(s.store_slug, {
          status: 'PENDING',
          limit: 20,
        }),
      ),
    )
    const all: any[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') {
        all.push(...((r.value as any)?.data?.orders ?? []))
      }
    }
    // Also fetch CONFIRMED orders
    const confirmedResults = await Promise.allSettled(
      sellers.value.map((s: any) =>
        orderApi.getSellerOrders(s.store_slug, {
          status: 'CONFIRMED',
          limit: 20,
        }),
      ),
    )
    for (const r of confirmedResults) {
      if (r.status === 'fulfilled') {
        all.push(...((r.value as any)?.data?.orders ?? []))
      }
    }
    // Sort newest first
    pendingSellerOrders.value = all.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  } catch {
    // non-critical
  }
}

onMounted(async () => {
  await fetchMyOrders(limit, 0)
  if (!sellers.value.length) await loadUserSellers().catch(() => {})
  await fetchPendingSellerOrders()
})

const goToShop = () => router.push('/discover')
const trackOrder = (orderId: number) => router.push(`/buyer/orders/${orderId}`)

const handleCancelOrder = async (orderId: number) => {
  if (confirm('Are you sure you want to cancel this order?')) {
    try {
      await cancelOrderApi(orderId)
    } catch (e: any) {
      alert(e.message || 'Failed to cancel order')
    }
  }
}

const loadMore = async () => {
  offset.value += limit
  await fetchMyOrders(limit, offset.value)
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
