<template>
  <HomeLayout :narrow-feed="false" :hide-right-sidebar="false">
    <div class="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <NuxtLink
          to="/"
          class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <Icon name="mdi:arrow-left" size="22" />
        </NuxtLink>
        <h1 class="text-xl font-bold text-gray-900 dark:text-neutral-100">
          Orders
        </h1>
      </div>

      <!-- Seller: Pending Store Orders -->
      <template v-if="hasSellers && pendingSellerOrders.length">
        <div
          class="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10"
        >
          <div
            class="flex items-center justify-between border-b border-amber-200 px-5 py-3 dark:border-amber-800"
          >
            <div class="flex items-center gap-2">
              <Icon
                name="mdi:store-clock"
                size="18"
                class="text-amber-600 dark:text-amber-400"
              />
              <span
                class="text-sm font-semibold text-amber-800 dark:text-amber-300"
              >
                {{ pendingSellerOrders.length }} store
                {{ pendingSellerOrders.length === 1 ? 'order' : 'orders' }} need
                attention
              </span>
            </div>
            <NuxtLink
              v-if="sellers[0]"
              :to="`/seller/${sellers[0].store_slug}/orders`"
              class="text-xs font-semibold text-amber-700 hover:underline dark:text-amber-400"
            >
              Manage all →
            </NuxtLink>
          </div>

          <div class="divide-y divide-amber-100 dark:divide-amber-900/30">
            <div
              v-for="order in pendingSellerOrders.slice(0, 5)"
              :key="`seller-${order.id}`"
              class="flex items-center justify-between px-5 py-3"
            >
              <div class="flex items-center gap-3">
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
                <p
                  class="text-sm font-bold text-gray-900 dark:text-neutral-100"
                >
                  {{
                    formatPrice(
                      (order.totalAmount || 0) + (order.shippingCost || 0),
                    )
                  }}
                </p>
                <NuxtLink
                  :to="`/seller/${order._storeSlug}/orders`"
                  class="text-[11px] font-semibold text-amber-700 hover:underline dark:text-amber-400"
                >
                  {{ order.status }} →
                </NuxtLink>
              </div>
            </div>
          </div>

          <div
            v-if="pendingSellerOrders.length > 5"
            class="px-5 py-2 text-center text-xs text-amber-600 dark:text-amber-400"
          >
            + {{ pendingSellerOrders.length - 5 }} more pending orders
          </div>
        </div>
      </template>

      <!-- Payment success banner -->
      <div
        v-if="paymentSuccess"
        class="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
      >
        <Icon
          name="mdi:check-circle"
          size="24"
          class="shrink-0 text-green-500"
        />
        <div>
          <p class="text-sm font-semibold text-green-800 dark:text-green-300">
            Payment successful!
          </p>
          <p class="text-xs text-green-600 dark:text-green-400">
            Your order has been placed and is being processed.
          </p>
        </div>
      </div>

      <!-- My Purchases label -->
      <div class="mb-3 flex items-center gap-2">
        <Icon
          name="mdi:shopping-outline"
          size="16"
          class="text-gray-400 dark:text-neutral-500"
        />
        <h2
          class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500"
        >
          My Purchases
        </h2>
      </div>

      <!-- Status filter tabs -->
      <div class="scrollbar-hide -mx-2 mb-5 flex gap-2 overflow-x-auto px-2">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.value"
          @click="activeStatus = tab.value"
          class="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors"
          :class="
            activeStatus === tab.value
              ? 'bg-gray-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading && !filteredOrders.length" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex gap-3">
            <div class="h-16 w-16 rounded-xl bg-gray-200 dark:bg-neutral-800" />
            <div class="flex-1 space-y-2">
              <div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
              <div class="h-3 w-1/2 rounded bg-gray-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>

      <!-- Orders list -->
      <div v-else-if="filteredOrders.length" class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <NuxtLink
            :to="`/buyer/orders/${order.id}`"
            class="block p-5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50"
          >
            <!-- Order header -->
            <div class="mb-3 flex items-start justify-between">
              <div>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  Order #{{ order.id }}
                </p>
                <p class="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                  {{ formatDate(order.created_at) }}
                </p>
              </div>
              <span
                class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                :class="statusColor(order.status)"
              >
                {{ confirmedIds.has(order.id) ? 'DELIVERED' : order.status }}
              </span>
            </div>

            <!-- Items preview -->
            <div class="mb-3 flex gap-2">
              <img
                v-for="(item, i) in order.orderItem.slice(0, 3)"
                :key="i"
                :src="item.variant?.product?.media?.[0]?.url || ''"
                class="h-14 w-14 rounded-xl bg-gray-100 object-cover dark:bg-neutral-800"
              />
              <div
                v-if="order.orderItem.length > 3"
                class="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-500 dark:bg-neutral-800"
              >
                +{{ order.orderItem.length - 3 }}
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-500 dark:text-neutral-400">
                {{ order.orderItem.length }} item{{
                  order.orderItem.length !== 1 ? 's' : ''
                }}
                <span v-if="order.shippingZone">
                  · {{ order.shippingZone }}</span
                >
              </p>
              <p class="text-sm font-bold text-gray-900 dark:text-neutral-100">
                {{ formatPrice(order.totalAmount + (order.shippingCost || 0)) }}
              </p>
            </div>

            <!-- Tracking -->
            <div
              v-if="order.trackingNumber"
              class="mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-2 text-xs text-brand dark:border-neutral-800"
            >
              <Icon name="mdi:truck-outline" size="14" />
              {{ order.shipper || 'Courier' }} · {{ order.trackingNumber }}
            </div>
          </NuxtLink>

          <!-- Confirm Receipt bar — shown only for SHIPPED orders -->
          <div
            v-if="order.status === 'SHIPPED' && !confirmedIds.has(order.id)"
            class="border-t border-amber-100 bg-amber-50 px-5 py-3 dark:border-amber-900/30 dark:bg-amber-900/10"
          >
            <div class="flex items-center justify-between gap-3">
              <div
                class="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400"
              >
                <Icon
                  name="mdi:clock-alert-outline"
                  size="14"
                  class="shrink-0"
                />
                Payment auto-releases to seller in 7 days
              </div>
              <button
                @click.prevent="confirmReceipt(order.id)"
                :disabled="confirmingIds.has(order.id)"
                class="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {{
                  confirmingIds.has(order.id)
                    ? 'Confirming…'
                    : 'Confirm Receipt'
                }}
              </button>
            </div>
          </div>

          <!-- Confirmed state -->
          <div
            v-if="confirmedIds.has(order.id)"
            class="flex items-center gap-1.5 border-t border-green-100 bg-green-50 px-5 py-3 text-xs font-medium text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400"
          >
            <Icon name="mdi:check-circle" size="14" />
            Receipt confirmed — funds released to seller
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-24 text-center"
      >
        <div
          class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
        >
          <Icon
            name="mdi:package-variant-closed-outline"
            size="32"
            class="text-gray-400 dark:text-neutral-500"
          />
        </div>
        <p class="font-medium text-gray-900 dark:text-neutral-100">
          No
          {{ activeStatus !== 'ALL' ? activeStatus.toLowerCase() : '' }} orders
          yet
        </p>
        <NuxtLink
          to="/discover"
          class="mt-3 text-sm font-semibold text-brand hover:underline"
          >Start shopping</NuxtLink
        >
      </div>
    </div>

    <template #right-sidebar>
      <RightSideNavBuyerOrders />
    </template>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import RightSideNavBuyerOrders from '~~/layers/core/app/layouts/children/RightSideNavBuyerOrders.vue'
import { useOrder } from '~~/layers/commerce/app/composables/useOrder'
import { useOrderApi } from '~~/layers/commerce/app/services/order.api'
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ middleware: 'auth' })
const { setOrdersPage } = useSeo()
setOrdersPage()

const route = useRoute()
const { isLoading } = useOrder()
const orderApi = useOrderApi()
const { sellers, hasSellers, loadUserSellers } = useSellerManagement()

const pendingSellerOrders = ref<any[]>([])

const fetchPendingSellerOrders = async () => {
  if (!sellers.value.length) return
  try {
    const results = await Promise.allSettled([
      ...sellers.value.map((s: any) =>
        orderApi
          .getSellerOrders(s.store_slug, { status: 'PENDING', limit: 20 })
          .then((r: any) =>
            (r?.data?.orders ?? []).map((o: any) => ({
              ...o,
              _storeSlug: s.store_slug,
            })),
          ),
      ),
      ...sellers.value.map((s: any) =>
        orderApi
          .getSellerOrders(s.store_slug, { status: 'CONFIRMED', limit: 20 })
          .then((r: any) =>
            (r?.data?.orders ?? []).map((o: any) => ({
              ...o,
              _storeSlug: s.store_slug,
            })),
          ),
      ),
    ])
    const all: any[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') all.push(...r.value)
    }
    pendingSellerOrders.value = all.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  } catch {
    // non-critical
  }
}

const confirmingIds = ref<Set<number>>(new Set())
const confirmedIds = ref<Set<number>>(new Set())

const confirmReceipt = async (orderId: number) => {
  if (
    !confirm(
      'Confirm you have received this order? This will release payment to the seller.',
    )
  )
    return
  confirmingIds.value = new Set([...confirmingIds.value, orderId])
  try {
    await orderApi.confirmReceipt(orderId)
    confirmedIds.value = new Set([...confirmedIds.value, orderId])
    const order = orders.value.find((o) => o.id === orderId)
    if (order) order.status = 'DELIVERED'
  } catch (e: any) {
    notify({
      type: 'error',
      text: e?.data?.statusMessage || e?.message || 'Failed to confirm receipt',
    })
  } finally {
    confirmingIds.value.delete(orderId)
    confirmingIds.value = new Set(confirmingIds.value)
  }
}

const orders = ref<any[]>([])
const activeStatus = ref('ALL')
const paymentSuccess = ref(route.query.payment === 'success')

// Verify payment if redirected from Paystack or capture PayPal
onMounted(async () => {
  // Paystack redirect
  const ref = route.query.reference as string
  if (ref) {
    try {
      await orderApi.verifyPayment(ref)
    } catch {
      /* silent */
    }
  }

  // PayPal redirect — ?paypal=success&token={paypalOrderId}&orderId={internalId}
  const paypalReturn = route.query.paypal as string
  const ppToken = (route.query.token ?? route.query.paypalOrderId) as string
  const ppOrderId = route.query.orderId as string
  if (paypalReturn === 'success' && ppToken && ppOrderId) {
    try {
      await orderApi.capturePayPal({
        orderId: parseInt(ppOrderId),
        paypalOrderId: ppToken,
      })
      paymentSuccess.value = true
    } catch {
      /* silent */
    }
  }

  await loadOrders()

  // Load seller orders in parallel (non-blocking)
  if (!sellers.value.length) await loadUserSellers().catch(() => {})
  fetchPendingSellerOrders()

  if (paymentSuccess.value) {
    setTimeout(() => {
      paymentSuccess.value = false
    }, 6000)
  }
})

const loadOrders = async () => {
  try {
    const res: any = await orderApi.getOrders({ limit: 50 })
    orders.value = res?.data?.orders || []
  } catch (e: any) {
    notify({ type: 'error', text: e.message || 'Failed to load orders' })
  }
}

const filteredOrders = computed(() => {
  if (activeStatus.value === 'ALL') return orders.value
  return orders.value.filter((o) => o.status === activeStatus.value)
})

const STATUS_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const statusColor = (status: string) =>
  ({
    PENDING:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    CONFIRMED:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    SHIPPED:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    DELIVERED:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    CANCELED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  })[status] ||
  'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'

const formatPrice = (cents: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
    cents / 100,
  )

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
</style>
