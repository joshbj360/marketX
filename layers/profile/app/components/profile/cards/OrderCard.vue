<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
    >
      <div>
        <p class="text-sm text-gray-500 dark:text-neutral-400">
          Order #{{ order.id }}
        </p>
        <p class="text-xs text-gray-400 dark:text-neutral-500">
          {{ formatDate(order.created_at) }}
        </p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="statusClasses[order.status] ?? statusClasses.DEFAULT"
      >
        {{ order.status }}
      </span>
    </div>

    <!-- Items -->
    <div class="space-y-3 p-4">
      <div v-for="item in order.orderItem" :key="item.id" class="flex gap-3">
        <img
          :src="item.variant?.product?.media?.[0]?.url || ''"
          :alt="item.variant?.product?.title || 'Product'"
          class="h-16 w-16 rounded-lg bg-gray-100 object-cover dark:bg-neutral-800"
        />
        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-medium text-gray-900 dark:text-neutral-100"
          >
            {{ item.variant?.product?.title || 'Product' }}
          </p>
          <p class="text-xs text-gray-500 dark:text-neutral-400">
            <span v-if="item.variant?.size || item.variant?.label">
              {{ item.variant?.size || item.variant?.label }} ·
            </span>
            Qty: {{ item.quantity }}
            <span v-if="item.price"> × {{ formatPrice(item.price) }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Tracking -->
    <div
      v-if="order.trackingNumber"
      class="flex items-center gap-1.5 border-t border-gray-100 px-4 py-2 text-xs text-brand dark:border-neutral-800"
    >
      <Icon name="mdi:truck-outline" size="14" />
      {{ order.shipper || 'Courier' }} · {{ order.trackingNumber }}
    </div>

    <!-- Auto-release notice -->
    <div
      v-if="order.status === 'SHIPPED' && !confirmed"
      class="flex items-start gap-1.5 border-t border-gray-100 px-4 py-2 text-xs text-amber-600 dark:border-neutral-800 dark:text-amber-400"
    >
      <Icon name="mdi:clock-alert-outline" size="14" class="mt-0.5 shrink-0" />
      Payment will be automatically released to the seller in 7 days. Confirm
      receipt above to release it now.
    </div>

    <!-- Footer -->
    <div
      class="flex items-center justify-between bg-gray-50 p-4 dark:bg-neutral-800"
    >
      <div class="text-sm">
        <span class="text-gray-500 dark:text-neutral-400">Total:</span>
        <span class="ml-2 font-bold text-gray-900 dark:text-neutral-100">
          {{
            formatPrice((order.totalAmount || 0) + (order.shippingCost || 0))
          }}
        </span>
      </div>

      <div class="flex gap-2">
        <!-- Track Button (if shipped) -->
        <button
          v-if="order.status === 'SHIPPED'"
          @click="emit('track', order.id)"
          class="rounded-lg border border-brand px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/10"
        >
          Track
        </button>

        <!-- Confirm Receipt (if shipped, buyer action) -->
        <button
          v-if="order.status === 'SHIPPED' && !confirmed"
          @click="confirmReceipt"
          :disabled="confirming"
          class="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {{ confirming ? 'Confirming…' : 'Confirm Receipt' }}
        </button>
        <span
          v-if="confirmed"
          class="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
        >
          Received ✓
        </span>

        <!-- Cancel Button (if pending) -->
        <button
          v-if="order.status === 'PENDING'"
          @click="emit('cancel', order.id)"
          class="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderApi } from '~~/layers/commerce/app/services/order.api'

const props = defineProps<{
  order: any
}>()

const emit = defineEmits(['track', 'cancel'])

const orderApi = useOrderApi()
const confirming = ref(false)
const confirmed = ref(false)

const confirmReceipt = async () => {
  if (
    !confirm(
      'Confirm you have received this order? This will release payment to the seller.',
    )
  )
    return
  confirming.value = true
  try {
    await orderApi.confirmReceipt(props.order.id)
    confirmed.value = true
  } catch (e: any) {
    alert(e?.data?.statusMessage || e?.message || 'Failed to confirm receipt')
  } finally {
    confirming.value = false
  }
}

const statusClasses: Record<string, string> = {
  PENDING:
    'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  CONFIRMED: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  SHIPPED:
    'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  DELIVERED:
    'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  DEFAULT:
    'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400',
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatPrice = (kobo: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
    kobo / 100,
  )
</script>
