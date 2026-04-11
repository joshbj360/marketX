<template>
  <div class="max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
    <!-- Loading skeleton -->
    <div v-if="isPageLoading" class="animate-pulse space-y-6">
      <div class="h-8 w-1/3 rounded bg-gray-200 dark:bg-neutral-800" />
      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="i in 3"
          :key="i"
          class="h-24 rounded-xl bg-gray-200 dark:bg-neutral-800"
        />
      </div>
      <div class="h-64 rounded-xl bg-gray-200 dark:bg-neutral-800" />
    </div>

    <template v-else>
      <!-- Welcome celebration (first product created via onboarding) -->
      <Transition name="welcome-fade">
        <div
          v-if="showWelcome"
          class="mb-6 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-brand/5 p-5 dark:border-emerald-800/30 dark:from-emerald-950/30 dark:to-brand/10"
        >
          <div class="text-3xl">🎉</div>
          <div class="min-w-0 flex-1">
            <p class="font-bold text-gray-900 dark:text-white">Your store is live!</p>
            <p class="mt-0.5 text-sm text-gray-600 dark:text-neutral-400">
              Your first product is published. Share your store link to start getting orders.
            </p>
            <NuxtLink
              :to="`/sellers/profile/${storeSlug}`"
              class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand/80"
            >
              View your store <Icon name="mdi:arrow-right" size="14" />
            </NuxtLink>
          </div>
          <button class="shrink-0 text-gray-400 hover:text-gray-600 dark:text-neutral-500" @click="showWelcome = false">
            <Icon name="mdi:close" size="18" />
          </button>
        </div>
      </Transition>

      <!-- Header -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ seller?.store_name ?? storeSlug }}
            </h1>
            <span
              v-if="seller?.is_verified"
              class="flex items-center gap-0.5 rounded-full bg-blue-500 px-2 py-0.5 text-[11px] font-bold text-white"
            >
              <Icon name="mdi:check-circle" size="11" /> Verified
            </span>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="
                seller?.is_active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-400 text-white'
              "
            >
              {{ seller?.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p class="text-[13px] text-gray-400 dark:text-neutral-500">
            @{{ storeSlug }}
          </p>
        </div>

        <div class="flex shrink-0 gap-2">
          <NuxtLink
            :to="`/sellers/profile/${storeSlug}`"
            target="_blank"
            class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Icon name="mdi:open-in-new" size="16" />
            <span class="hidden sm:inline">View Profile</span>
          </NuxtLink>
          <NuxtLink
            :to="`/seller/${storeSlug}/products/create`"
            class="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#f02c56] to-purple-600 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Icon name="mdi:plus" size="16" />
            <span class="hidden sm:inline">Add Product</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Store completeness score -->
      <div
        v-if="completeness < 100"
        class="mb-6 rounded-xl border border-brand/20 bg-gradient-to-r from-brand/5 to-purple-600/5 p-4 dark:from-brand/10 dark:to-purple-600/10"
      >
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="mdi:star-circle-outline" size="20" class="text-brand" />
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Store completeness — {{ completeness }}%</p>
          </div>
          <span class="text-xs text-gray-500 dark:text-neutral-400">{{ missingItems.length }} item{{ missingItems.length !== 1 ? 's' : '' }} missing</span>
        </div>
        <!-- Bar -->
        <div class="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
          <div
            class="h-full rounded-full bg-gradient-to-r from-brand to-purple-600 transition-all duration-500"
            :style="{ width: `${completeness}%` }"
          />
        </div>
        <!-- Checklist -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="item in completenessItems"
            :key="item.label"
            class="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
            :class="item.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-neutral-400'"
          >
            <Icon :name="item.done ? 'mdi:check-circle' : 'mdi:circle-outline'" size="12" />
            {{ item.label }}
          </span>
        </div>
      </div>

      <!-- Wallet balance card -->
      <div
        class="mb-6 rounded-xl bg-gradient-to-br from-brand to-[#d81b36] p-5 text-white"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-white/70">Available Balance</p>
            <p class="text-3xl font-bold">
              {{ formatKobo(storeWallet.balance) }}
            </p>
            <p class="mt-1 text-xs text-white/70">
              <span class="font-semibold text-white/90">{{
                formatKobo(storeWallet.pendingBalance)
              }}</span>
              pending (releases on delivery)
            </p>
          </div>
          <Icon name="mdi:wallet" size="40" class="text-white/20" />
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
          <div>
            <p class="text-[11px] text-white/60">Total Earned</p>
            <p class="text-sm font-bold">
              {{ formatKobo(storeWallet.totalEarned) }}
            </p>
          </div>
          <div>
            <p class="text-[11px] text-white/60">Total Paid Out</p>
            <p class="text-sm font-bold">
              {{ formatKobo(storeWallet.totalSpent) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mb-6 grid grid-cols-3 gap-4">
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p
            class="text-xl font-bold text-gray-900 sm:text-2xl dark:text-neutral-100"
          >
            {{ productCount }}
          </p>
          <p class="mt-0.5 text-[12px] text-gray-500 dark:text-neutral-400">
            Products
          </p>
        </div>
        <div
          class="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p
            class="text-xl font-bold text-gray-900 sm:text-2xl dark:text-neutral-100"
          >
            {{ seller?.followers_count ?? 0 }}
          </p>
          <p class="mt-0.5 text-[12px] text-gray-500 dark:text-neutral-400">
            Followers
          </p>
        </div>
        <NuxtLink
          :to="`/seller/${storeSlug}/orders`"
          class="rounded-xl border border-gray-200 bg-white p-4 text-center transition-colors hover:border-brand/30 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p
            class="text-xl font-bold text-gray-900 sm:text-2xl dark:text-neutral-100"
          >
            {{ orderCount }}
          </p>
          <p class="mt-0.5 text-[12px] text-gray-500 dark:text-neutral-400">
            Orders
          </p>
          <div v-if="pendingOrderCount > 0" class="mt-1">
            <span
              class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {{ pendingOrderCount }} pending
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- Recent Orders -->
      <div
        v-if="recentOrders.length"
        class="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
            Recent Orders
          </h2>
          <NuxtLink
            :to="`/seller/${storeSlug}/orders`"
            class="text-[13px] font-medium text-brand hover:underline"
          >
            View all
          </NuxtLink>
        </div>
        <div class="space-y-3">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 dark:border-neutral-800"
          >
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-[13px] font-semibold text-gray-900 dark:text-neutral-100"
              >
                {{ order.user?.username ?? order.name ?? 'Customer' }}
              </p>
              <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                {{ itemsLabel(order) }} · #{{ order.id }}
              </p>
            </div>
            <div class="ml-3 shrink-0 text-right">
              <p class="text-[13px] font-bold text-gray-900 dark:text-white">
                {{ formatKobo(order.totalAmount) }}
              </p>
              <span
                class="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase"
                :class="orderStatusClass(order.status)"
              >
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Products -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
            Recent Products
          </h2>
          <NuxtLink
            :to="`/seller/${storeSlug}/products`"
            class="text-[13px] font-medium text-brand hover:underline"
          >
            View all
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div
          v-if="productsLoading"
          class="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="aspect-square animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800"
          />
        </div>

        <!-- Empty -->
        <div v-else-if="!recentProducts.length" class="py-10 text-center">
          <Icon
            name="mdi:package-variant-closed-remove"
            size="40"
            class="mb-2 text-gray-300 dark:text-neutral-600"
          />
          <p class="text-[13px] text-gray-500 dark:text-neutral-400">
            No products yet
          </p>
          <NuxtLink
            :to="`/seller/${storeSlug}/products/create`"
            class="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline"
          >
            <Icon name="mdi:plus" size="14" /> Add your first product
          </NuxtLink>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NuxtLink
            v-for="product in recentProducts"
            :key="product.id"
            :to="`/seller/${storeSlug}/products/${product.id}/edit`"
            class="group overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-md dark:border-neutral-700"
          >
            <div class="relative aspect-square bg-gray-100 dark:bg-neutral-800">
              <img
                v-if="product.media?.[0]?.url"
                :src="product.media[0].url"
                :alt="product.title"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Icon
                  name="mdi:image-off-outline"
                  size="28"
                  class="text-gray-300 dark:text-neutral-600"
                />
              </div>
              <span
                :class="[
                  'absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  product.status === 'PUBLISHED'
                    ? 'bg-emerald-500 text-white'
                    : product.status === 'DRAFT'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-400 text-white',
                ]"
                >{{ product.status }}</span
              >
            </div>
            <div class="p-2">
              <p
                class="truncate text-[12px] font-semibold text-gray-900 dark:text-neutral-100"
              >
                {{ product.title }}
              </p>
              <p class="text-[11px] font-bold text-brand">
                ₦{{ Number(product.price).toLocaleString() }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'
import { useSellerApi } from '~~/layers/seller/app/services/seller.services'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useOrderApi } from '~~/layers/commerce/app/services/order.api'
import { useWalletApi } from '~~/layers/commerce/app/services/wallet.api'

definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const route = useRoute()
const storeSlug = computed(() => route.params.storeSlug as string)

const { loadPublicSeller, loadUserSellers, sellers, currentSeller } =
  useSellerManagement()
const seller = computed(
  () =>
    currentSeller.value ??
    sellers.value.find((s) => s.store_slug === storeSlug.value) ??
    null,
)
const { fetchSellerProducts } = useProduct()
const sellerApi = useSellerApi()
const orderApi = useOrderApi()
const walletApi = useWalletApi()
const { formatNGN: formatKobo } = useCurrency()

const isPageLoading = ref(true)
const productsLoading = ref(false)
const showWelcome = ref(route.query.welcome === '1')

// Store completeness score
const completenessItems = computed(() => {
  const s = seller.value
  return [
    { label: 'Store logo', done: !!s?.store_logo },
    { label: 'Store banner', done: !!s?.store_banner },
    { label: 'Description', done: !!s?.store_description },
    { label: 'Location set', done: !!(s?.store_location || s?.locationLabel) },
    { label: 'Phone number', done: !!s?.store_phone },
    { label: 'First product', done: productCount.value > 0 },
    { label: 'GPS location', done: !!(s?.latitude && s?.longitude) },
  ]
})

const completeness = computed(() => {
  const done = completenessItems.value.filter((i) => i.done).length
  return Math.round((done / completenessItems.value.length) * 100)
})

const missingItems = computed(() => completenessItems.value.filter((i) => !i.done))
const recentProducts = ref<Record<string, unknown>[]>([])
const productCount = ref(0)
const orderCount = ref(0)
const pendingOrderCount = ref(0)
const recentOrders = ref<Record<string, unknown>[]>([])
const storeWallet = ref({
  balance: 0,
  pendingBalance: 0,
  totalEarned: 0,
  totalSpent: 0,
})

const orderStatusClass = (status: string) => {
  const map: Record<string, string> = {
    PENDING:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    CONFIRMED:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    PAID: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    SHIPPED:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    DELIVERED:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    CANCELED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    map[status] ??
    'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400'
  )
}

const itemsLabel = (order: Record<string, unknown>) => {
  const count = (order.orderItem as unknown[])?.length ?? 0
  return `${count} item${count !== 1 ? 's' : ''}`
}

const loadData = async (slug: string) => {
  await Promise.allSettled([loadPublicSeller(slug), loadUserSellers()])

  productsLoading.value = true

  const results = await Promise.allSettled([
    fetchSellerProducts(slug, { limit: 4 }),
    walletApi.getStoreWallet(slug),
    orderApi.getSellerOrders(slug, { limit: 5 }),
  ])

  const [productsRes, walletRes, ordersRes] = results

  // Products
  if (productsRes.status === 'fulfilled') {
    const val = productsRes.value as Record<string, unknown>
    recentProducts.value = (val?.products as Record<string, unknown>[]) ?? []
    productCount.value =
      (val?.meta as Record<string, number>)?.total ??
      recentProducts.value.length
  }
  productsLoading.value = false

  // Wallet
  if (walletRes.status === 'fulfilled') {
    const w = (walletRes.value as Record<string, unknown>)?.data as Record<
      string,
      number
    >
    if (w) {
      storeWallet.value = {
        balance: w.balance ?? 0,
        pendingBalance: w.pendingBalance ?? 0,
        totalEarned: w.totalEarned ?? 0,
        totalSpent: w.totalSpent ?? 0,
      }
    }
  }

  // Orders
  if (ordersRes.status === 'fulfilled') {
    const ordersData = (ordersRes.value as Record<string, unknown>)
      ?.data as Record<string, unknown>
    recentOrders.value = (ordersData?.orders as Record<string, unknown>[]) ?? []
    orderCount.value = (ordersData?.total as number) ?? 0
    pendingOrderCount.value = recentOrders.value.filter(
      (o) => o.status === 'PENDING' || o.status === 'CONFIRMED',
    ).length
  }
}

onMounted(() => {
  // Mark seller as online on the map
  sellerApi.ping().catch(() => {})

  loadData(storeSlug.value)
    .catch((e) => {
      console.error('[dashboard] loadData error:', e)
    })
    .finally(() => {
      isPageLoading.value = false
    })
})

watch(storeSlug, (slug) => {
  isPageLoading.value = true
  loadData(slug).finally(() => {
    isPageLoading.value = false
  })
})
</script>


<style scoped>
.welcome-fade-enter-active { transition: all 0.4s ease; }
.welcome-fade-leave-active { transition: all 0.3s ease; }
.welcome-fade-enter-from, .welcome-fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
