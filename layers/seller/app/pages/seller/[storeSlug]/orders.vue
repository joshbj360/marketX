<template>
  <div class="p-4 sm:p-6">
    <!-- Header -->
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
          Orders
        </h1>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">
          {{ total }} total orders
        </p>
      </div>
    </div>

    <!-- Status tabs -->
    <div
      class="scrollbar-hide -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6"
    >
      <button
        v-for="tab in STATUS_TABS"
        :key="tab.value"
        @click="activeStatus = tab.value; loadOrders()"
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
    <div v-if="isLoading && !orders.length" class="space-y-4">
      <div
        v-for="i in 4"
        :key="i"
        class="h-24 animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      />
    </div>

    <!-- Orders table -->
    <div v-else-if="orders.length" class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <!-- Order header -->
        <div
          class="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-neutral-800"
        >
          <div>
            <p
              class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
            >
              Order #{{ order.id }}
            </p>
            <p class="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
              {{ formatDate(order.created_at) }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <!-- Payment badge for POD -->
            <span
              v-if="order.paymentMethod === 'pay_on_delivery'"
              class="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              POD
            </span>
            <span
              class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              :class="statusColor(order.status)"
            >
              {{ order.status }}
            </span>

            <!-- POD: Confirm Cash Received (only when SHIPPED) -->
            <button
              v-if="order.paymentMethod === 'pay_on_delivery' && order.status === 'SHIPPED'"
              @click="confirmCash(order.id)"
              class="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              Cash Received
            </button>

            <!-- POD: Refuse Delivery (CONFIRMED or SHIPPED) -->
            <button
              v-if="order.paymentMethod === 'pay_on_delivery' && ['CONFIRMED', 'SHIPPED'].includes(order.status)"
              @click="refuseDelivery(order.id)"
              class="rounded-lg border border-red-200 px-3 py-1 text-xs font-bold text-red-500 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              Refused
            </button>

            <!-- Regular orders: status update dropdown (skip CONFIRMED for paid orders) -->
            <select
              v-if="order.paymentMethod !== 'pay_on_delivery' && order.status === 'CONFIRMED'"
              @change="(e) => updateStatus(order.id, (e.target as HTMLSelectElement).value)"
              class="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <option value="" disabled selected>Update status</option>
              <option value="SHIPPED">Mark Shipped</option>
              <option value="CANCELLED">Cancel</option>
            </select>

            <!-- POD confirmed: ship it -->
            <select
              v-if="order.paymentMethod === 'pay_on_delivery' && order.status === 'CONFIRMED'"
              @change="(e) => updateStatus(order.id, (e.target as HTMLSelectElement).value)"
              class="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              <option value="" disabled selected>Ship it</option>
              <option value="SHIPPED">Mark Shipped</option>
            </select>
          </div>
        </div>

        <!-- Customer info -->
        <div
          class="flex items-center gap-3 border-b border-gray-100 px-5 py-3 dark:border-neutral-800"
        >
          <img
            :src="order.user?.avatar || ''"
            class="h-8 w-8 shrink-0 rounded-full bg-gray-100 object-cover dark:bg-neutral-800"
          />
          <div class="min-w-0">
            <p
              class="truncate text-sm font-medium text-gray-900 dark:text-neutral-100"
            >
              {{ order.name }}
            </p>
            <p class="text-xs text-gray-400 dark:text-neutral-500">
              {{ order.country }}
              <span v-if="order.shippingZone"> · {{ order.shippingZone }}</span>
            </p>
          </div>
        </div>

        <!-- Items -->
        <div class="flex gap-2 overflow-x-auto p-4">
          <div
            v-for="item in order.orderItem"
            :key="item.id"
            class="flex shrink-0 items-start gap-2"
          >
            <img
              :src="item.variant?.product?.media?.[0]?.url || ''"
              class="h-12 w-12 rounded-lg bg-gray-100 object-cover dark:bg-neutral-800"
            />
            <div class="min-w-0">
              <p
                class="w-28 truncate text-xs font-medium text-gray-800 dark:text-neutral-200"
              >
                {{ item.variant?.product?.title }}
              </p>
              <p class="text-[10px] text-gray-400">
                {{ item.variant?.size || item.variant?.label }} ×
                {{ item.quantity }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between bg-gray-50 px-5 py-3 dark:bg-neutral-800/50"
        >
          <div
            v-if="order.trackingNumber"
            class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400"
          >
            <Icon name="mdi:truck-outline" size="14" />
            {{ order.shipper }} · {{ order.trackingNumber }}
          </div>
          <button
            v-else-if="order.status === 'SHIPPED'"
            @click="addTracking(order)"
            class="text-xs font-medium text-brand hover:underline"
          >
            + Add tracking
          </button>
          <div v-else />
          <p class="text-sm font-bold text-gray-900 dark:text-neutral-100">
            {{ formatPrice(order.totalAmount + (order.shippingCost || 0)) }}
          </p>
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
        No orders yet
      </p>
      <p class="mt-1 text-sm text-gray-500 dark:text-neutral-400">
        Orders for your store will appear here
      </p>
    </div>

    <!-- Tracking modal -->
    <div
      v-if="trackingModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 dark:bg-neutral-900"
      >
        <h3 class="text-base font-semibold text-gray-900 dark:text-neutral-100">
          Add Tracking Info
        </h3>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-500"
            >Courier / Shipper</label
          >
          <input
            v-model="trackingForm.shipper"
            placeholder="DHL, FedEx, etc."
            class="input-field"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-500"
            >Tracking Number</label
          >
          <input
            v-model="trackingForm.trackingNumber"
            placeholder="1Z999AA10123456784"
            class="input-field"
          />
        </div>
        <div class="flex gap-3">
          <button
            @click="trackingModal = null"
            class="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium dark:border-neutral-700"
          >
            Cancel
          </button>
          <button
            @click="saveTracking"
            class="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderApi } from '~~/layers/commerce/app/services/order.api'
import { useNotificationStore } from '~~/layers/profile/app/stores/notification.store'
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const route = useRoute()
const orderApi = useOrderApi()

const storeSlug = computed(() => route.params.storeSlug as string)
const orders = ref<any[]>([])
const total = ref(0)
const isLoading = ref(true)
const activeStatus = ref('')
const trackingModal = ref<any>(null)
const trackingForm = reactive({ shipper: '', trackingNumber: '' })

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
]

const loadOrders = async () => {
  isLoading.value = true
  try {
    const params: any = { storeSlug: storeSlug.value, limit: 50 }
    if (activeStatus.value) params.status = activeStatus.value
    const res: any = await orderApi.getSellerOrders(storeSlug.value, params)
    orders.value = res?.data?.orders || []
    total.value = res?.data?.total || 0
  } catch {
    // BaseApiClient handles the error toast
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (orderId: number, status: string) => {
  if (!status) return
  try {
    await orderApi.updateOrderStatus(orderId, { status })
    const o = orders.value.find((o) => o.id === orderId)
    if (o) o.status = status
    notify({ type: 'success', text: `Order #${orderId} marked as ${status}` })
  } catch {
    // BaseApiClient handles the error toast
  }
}

const addTracking = (order: any) => {
  trackingModal.value = order
  trackingForm.shipper = ''
  trackingForm.trackingNumber = ''
}

const confirmCash = async (orderId: number) => {
  try {
    await orderApi.confirmCash(orderId)
    const o = orders.value.find((o) => o.id === orderId)
    if (o) { o.status = 'DELIVERED'; o.paymentStatus = 'PAID' }
    notify({ type: 'success', text: `Cash confirmed for order #${orderId}. Wallet credited.` })
  } catch {
    // BaseApiClient handles the error toast
  }
}

const refuseDelivery = async (orderId: number) => {
  if (!confirm(`Mark order #${orderId} as delivery refused? The shipping fee will not be refunded to the buyer.`)) return
  try {
    await orderApi.refuseDelivery(orderId)
    const o = orders.value.find((o) => o.id === orderId)
    if (o) o.status = 'RETURNED'
    notify({ type: 'success', text: `Order #${orderId} marked as delivery refused.` })
  } catch {
    // BaseApiClient handles the error toast
  }
}

const saveTracking = async () => {
  if (!trackingModal.value || !trackingForm.trackingNumber) return
  try {
    await orderApi.updateOrderStatus(trackingModal.value.id, {
      status: 'SHIPPED',
      ...trackingForm,
    })
    const o = orders.value.find((o) => o.id === trackingModal.value.id)
    if (o) Object.assign(o, { ...trackingForm, status: 'SHIPPED' })
    trackingModal.value = null
    notify({ type: 'success', text: 'Tracking info saved' })
  } catch {
    // BaseApiClient handles the error toast
  }
}

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
    RETURNED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
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

onMounted(loadOrders)

// Reload orders when an ORDER notification arrives via SSE
const notificationStore = useNotificationStore()
watch(
  () => notificationStore.notifications[0],
  (n) => {
    if (n?.type === 'ORDER') loadOrders()
  },
)
</script>

<style scoped>
.input-field {
  @apply w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100;
}
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
