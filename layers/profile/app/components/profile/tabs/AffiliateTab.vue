<template>
  <div class="space-y-6 p-6">
    <!-- Loading -->
    <div v-if="isLoading && !loaded" class="py-12 text-center">
      <Icon
        name="eos-icons:loading"
        size="32"
        class="animate-spin text-brand"
      />
    </div>

    <template v-else>
      <!-- Not enrolled CTA -->
      <div
        v-if="!isEnrolled"
        class="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-center text-white"
      >
        <Icon name="mdi:cash-multiple" size="64" class="mx-auto mb-4" />
        <h2 class="mb-2 text-2xl font-bold">{{ $t('affiliate.joinTitle') }}</h2>
        <p class="mb-6 text-white/90">
          {{ $t('affiliate.joinSubtitle') }}
        </p>
        <button
          @click="handleEnroll"
          :disabled="isLoading"
          class="rounded-lg bg-white px-8 py-3 font-bold text-purple-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {{ $t('affiliate.enrollNow') }}
        </button>
        <p v-if="enrollMessage" class="mt-3 text-sm text-white/80">
          {{ enrollMessage }}
        </p>
      </div>

      <!-- Enrolled Dashboard -->
      <template v-else>
        <!-- Overview stats -->
        <div class="grid grid-cols-3 gap-4">
          <div
            class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon name="mdi:cash-check" size="24" class="mb-2 text-green-500" />
            <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ formatPrice(stats.totalEarnings ?? 0) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              {{ $t('affiliate.totalEarned') }}
            </p>
          </div>
          <div
            class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon
              name="mdi:clock-outline"
              size="24"
              class="mb-2 text-amber-500"
            />
            <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ formatPrice(stats.pendingEarnings ?? 0) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              {{ $t('affiliate.pending') }}
            </p>
          </div>
          <div
            class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon name="mdi:cart-check" size="24" class="mb-2 text-brand" />
            <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ stats.totalConversions ?? 0 }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              {{ $t('affiliate.sales') }}
            </p>
          </div>
        </div>

        <!-- Affiliate Link -->
        <div
          v-if="affiliateCode"
          class="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h3 class="mb-4 font-semibold text-gray-900 dark:text-neutral-100">
            {{ $t('affiliate.yourLink') }}
          </h3>
          <div class="flex gap-2">
            <input
              :value="affiliateLink"
              readonly
              class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-mono text-sm text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <button
              @click="copyLink"
              class="rounded-lg bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-[#d81b36]"
            >
              <Icon name="mdi:content-copy" size="20" />
            </button>
          </div>
        </div>

        <!-- ────────────────────────────────────────────────────────── -->
        <!-- SECTION: My Products Being Affiliated                      -->
        <!-- ────────────────────────────────────────────────────────── -->
        <div
          v-if="hasSellers"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-3">
              <Icon name="mdi:store-check" size="22" class="text-brand" />
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
                  {{ $t('affiliate.myProducts') }}
                </h3>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  {{ $t('affiliate.myProductsHint') }}
                </p>
              </div>
            </div>
            <div v-if="sellerProductStats.products.length" class="text-right">
              <p class="text-xs text-gray-400 dark:text-neutral-500">
                {{ $t('affiliate.totalRevenue') }}
              </p>
              <p class="text-sm font-bold text-gray-900 dark:text-neutral-100">
                {{ formatKobo(sellerProductStats.totalRevenue) }}
              </p>
            </div>
          </div>

          <!-- Loading products -->
          <div v-if="loadingSellerProducts" class="py-8 text-center">
            <Icon
              name="eos-icons:loading"
              size="24"
              class="animate-spin text-gray-300"
            />
          </div>

          <div
            v-else-if="!sellerProductStats.products.length"
            class="p-8 text-center text-gray-400 dark:text-neutral-500"
          >
            <Icon name="mdi:tag-off-outline" size="40" class="mx-auto mb-2" />
            <p class="text-sm">{{ $t('affiliate.noProducts') }}</p>
            <p class="mt-1 text-xs">
              {{ $t('affiliate.noProductsHint') }}
            </p>
          </div>

          <div v-else class="divide-y divide-gray-100 dark:divide-neutral-800">
            <!-- Summary row -->
            <div
              class="grid grid-cols-3 gap-0 border-b border-gray-100 dark:border-neutral-800"
            >
              <div class="p-3 text-center">
                <p
                  class="text-lg font-bold text-gray-900 dark:text-neutral-100"
                >
                  {{ sellerProductStats.products.length }}
                </p>
                <p class="text-[10px] text-gray-400 dark:text-neutral-500">
                  {{ $t('affiliate.products') }}
                </p>
              </div>
              <div
                class="border-x border-gray-100 p-3 text-center dark:border-neutral-800"
              >
                <p
                  class="text-lg font-bold text-gray-900 dark:text-neutral-100"
                >
                  {{ sellerProductStats.totalUnitsSold }}
                </p>
                <p class="text-[10px] text-gray-400 dark:text-neutral-500">
                  {{ $t('affiliate.unitsSold') }}
                </p>
              </div>
              <div class="p-3 text-center">
                <p class="text-lg font-bold text-green-600">
                  {{ formatKobo(sellerProductStats.totalCommission) }}
                </p>
                <p class="text-[10px] text-gray-400 dark:text-neutral-500">
                  {{ $t('affiliate.commissionOut') }}
                </p>
              </div>
            </div>

            <!-- Product rows -->
            <div
              v-for="product in sellerProductStats.products"
              :key="product.id"
              class="flex items-center justify-between p-4"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="product.imageUrl || ''"
                  class="h-12 w-12 rounded-lg bg-gray-100 object-cover dark:bg-neutral-800"
                />
                <div>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                  >
                    {{ product.title }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-neutral-500">
                    {{ product.storeName }} ·
                    <span class="text-purple-600 dark:text-purple-400">
                      {{
                        $t('affiliate.commission', {
                          rate: product.affiliateCommission,
                        })
                      }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p
                  class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ formatKobo(product.revenue) }}
                </p>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  {{ product.unitsSold }} sold
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ────────────────────────────────────────────────────────── -->
        <!-- SECTION: Other users promoting my products (sellers only)  -->
        <!-- ────────────────────────────────────────────────────────── -->
        <div
          v-if="hasSellers"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <Icon
              name="mdi:account-group-outline"
              size="22"
              class="text-brand"
            />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
                {{ $t('affiliate.promoters') }}
              </h3>
              <p class="text-xs text-gray-400 dark:text-neutral-500">
                {{ $t('affiliate.promotersHint') }}
              </p>
            </div>
          </div>
          <div class="p-8 text-center text-gray-400 dark:text-neutral-500">
            <Icon
              name="mdi:account-group-outline"
              size="40"
              class="mx-auto mb-2"
            />
            <p class="text-sm">{{ $t('affiliate.noPromoters') }}</p>
            <p class="mt-1 text-xs">
              {{ $t('affiliate.noPromotersHint') }}
            </p>
          </div>
        </div>

        <!-- ────────────────────────────────────────────────────────── -->
        <!-- SECTION: Products available to promote                      -->
        <!-- ────────────────────────────────────────────────────────── -->
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-3">
              <Icon
                name="mdi:tag-heart-outline"
                size="22"
                class="text-purple-500"
              />
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
                  {{ $t('affiliate.availableTitle') }}
                </h3>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  {{ $t('affiliate.availableHint') }}
                </p>
              </div>
            </div>
            <span
              v-if="availableProducts.length"
              class="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            >
              {{ availableMeta.total ?? availableProducts.length }}
            </span>
          </div>

          <div v-if="loadingAvailable" class="py-8 text-center">
            <Icon
              name="eos-icons:loading"
              size="24"
              class="animate-spin text-gray-300"
            />
          </div>

          <div
            v-else-if="!availableProducts.length"
            class="p-8 text-center text-gray-400 dark:text-neutral-500"
          >
            <Icon
              name="mdi:tag-multiple-outline"
              size="40"
              class="mx-auto mb-2"
            />
            <p class="text-sm">{{ $t('affiliate.noAvailable') }}</p>
            <p class="mt-1 text-xs">
              {{ $t('affiliate.noAvailableHint') }}
            </p>
          </div>

          <div v-else>
            <div class="divide-y divide-gray-100 dark:divide-neutral-800">
              <div
                v-for="product in availableProducts"
                :key="product.id"
                class="flex items-center gap-3 p-4"
              >
                <img
                  :src="product.media?.[0]?.url || ''"
                  class="h-12 w-12 shrink-0 rounded-xl bg-gray-100 object-cover dark:bg-neutral-800"
                />
                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100"
                  >
                    {{ product.title }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-neutral-500">
                    {{ product.seller?.store_name }}
                  </p>
                  <!-- "Make ₦X" earnings pill -->
                  <span
                    class="mt-0.5 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <Icon name="mdi:cash" size="11" />
                    {{
                      $t('affiliate.makePerSale', {
                        amount: formatPrice(productCommission(product)),
                      })
                    }}
                  </span>
                </div>
                <button
                  @click="copyAffiliateProductLink(product)"
                  class="shrink-0 rounded-xl bg-purple-600/10 px-3 py-1.5 text-[11px] font-bold text-purple-700 transition-colors hover:bg-purple-600/20 dark:text-purple-400"
                >
                  {{ $t('affiliate.copyLink') }}
                </button>
              </div>
            </div>

            <div
              v-if="availableMeta.hasMore"
              class="border-t border-gray-100 p-3 text-center dark:border-neutral-800"
            >
              <button
                @click="loadMoreAvailable"
                :disabled="loadingAvailable"
                class="text-[12px] font-semibold text-brand hover:underline disabled:opacity-50"
              >
                {{ $t('affiliate.loadMore') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~~/layers/core/app/composables/useToast'
import { useAffiliate } from '~~/layers/commerce/app/composables/useAffiliate'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useCurrency } from '~~/layers/core/app/composables/useCurrency'
import { useAffiliateApi } from '~~/layers/commerce/app/services/affiliate.api'
import { computed, onMounted, ref } from 'vue'

const toast = useToast()
const sellerStore = useSellerStore()
const { formatPrice, formatKobo } = useCurrency()
const {
  isLoading,
  isEnrolled,
  affiliateCode,
  stats,
  fetchAffiliateStatus,
  enroll,
  fetchReferrals,
} = useAffiliate()

const enrollMessage = ref('')
const loaded = ref(false)
const loadingSellerProducts = ref(false)
const hasSellers = computed(() => sellerStore.hasSellers)

const sellerProductStats = ref<{
  products: any[]
  totalRevenue: number
  totalUnitsSold: number
  totalCommission: number
}>({ products: [], totalRevenue: 0, totalUnitsSold: 0, totalCommission: 0 })

const affiliateLink = computed(() =>
  affiliateCode.value
    ? `${window?.location?.origin ?? 'https://stylex.indicestech.com'}/ref/${affiliateCode.value}`
    : '',
)

const fetchSellerProductStats = async () => {
  if (!hasSellers.value) return
  loadingSellerProducts.value = true
  try {
    const api = useAffiliateApi()
    const res: any = await api.getSellerProducts()
    if (res?.data) {
      sellerProductStats.value = res.data
    }
  } catch {
    // non-critical
  } finally {
    loadingSellerProducts.value = false
  }
}

// ── Available products to promote ─────────────────────────────────────────
const availableProducts = ref<any[]>([])
const loadingAvailable = ref(false)
const availableMeta = ref<{
  total?: number
  hasMore?: boolean
  offset?: number
}>({})
const AVAIL_LIMIT = 10

const fetchAvailableProducts = async (reset = false) => {
  if (reset) {
    availableProducts.value = []
    availableMeta.value = {}
  }
  loadingAvailable.value = true
  try {
    const api = useAffiliateApi()
    const res: any = await api.getAvailableProducts({
      limit: AVAIL_LIMIT,
      offset: availableProducts.value.length,
    })
    availableProducts.value.push(...(res?.data ?? []))
    availableMeta.value = res?.meta ?? {}
  } catch {
    /* non-critical */
  } finally {
    loadingAvailable.value = false
  }
}

const loadMoreAvailable = () => fetchAvailableProducts()

const copyAffiliateProductLink = (product: any) => {
  const base = window?.location?.origin ?? ''
  const slug = product.seller?.store_slug ?? ''
  const link = `${base}/sellers/profile/${slug}?ref=${affiliateCode.value}&pid=${product.id}`
  navigator.clipboard.writeText(link)
  toast.showToast('Affiliate link copied!', 'success')
}

onMounted(async () => {
  try {
    await fetchAffiliateStatus()
    if (isEnrolled.value) {
      await Promise.allSettled([
        fetchReferrals(),
        fetchSellerProductStats(),
        fetchAvailableProducts(),
      ])
    }
  } catch {
    // Handled gracefully
  } finally {
    loaded.value = true
  }
})

const handleEnroll = async () => {
  try {
    await enroll()
    toast.showToast(
      "You're now an affiliate! Start sharing links to earn.",
      'success',
    )
    await fetchAvailableProducts(true)
  } catch (e: any) {
    toast.showToast(e.message || 'Failed to enroll', 'error')
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(affiliateLink.value)
  toast.showToast('Affiliate link copied!', 'success')
}

/** How much the affiliate earns per sale of this product (in major NGN) */
const productCommission = (product: any): number => {
  const commission = product.affiliateCommission ?? 0
  return commission
}
</script>
