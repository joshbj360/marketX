<template>
  <HomeLayout :narrow-feed="true" :hide-right-sidebar="true">
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
          Checkout
        </h1>
      </div>

      <!-- Empty cart guard -->
      <div v-if="!items.length" class="py-24 text-center">
        <Icon
          name="mdi:cart-outline"
          size="56"
          class="mb-4 text-gray-300 dark:text-neutral-600"
        />
        <p class="font-medium text-gray-600 dark:text-neutral-400">
          Your cart is empty
        </p>
        <NuxtLink
          to="/discover"
          class="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >Browse products</NuxtLink
        >
      </div>

      <div v-else class="space-y-5">
        <!-- Currency badge — shown when not NGN -->
        <div
          v-if="activeCurrency !== 'NGN'"
          class="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300"
        >
          <Icon name="mdi:swap-horizontal" size="15" />
          <template v-if="paymentMethod === 'paypal'">
            Prices shown in <strong>{{ activeCurrency }}</strong
            >. Payment is charged in <strong>USD</strong> via PayPal.
          </template>
          <template v-else>
            Prices shown in <strong>{{ activeCurrency }}</strong
            >. Payment is charged in NGN via Paystack.
          </template>
        </div>

        <!-- Order Items -->
        <div
          class="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2
            class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400"
          >
            Order Summary
          </h2>
          <div class="space-y-3">
            <div
              v-for="item in items"
              :key="item.variantId"
              class="flex items-start gap-3"
            >
              <img
                :src="item.variant?.product?.media?.[0]?.url || ''"
                class="h-14 w-14 shrink-0 rounded-xl bg-gray-100 object-cover dark:bg-neutral-800"
              />
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-sm font-medium text-gray-900 dark:text-neutral-100"
                >
                  {{ item.variant?.product?.title }}
                </p>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  {{ item.variant?.size }} × {{ item.quantity }}
                </p>
              </div>
              <div class="shrink-0 text-right">
                <p
                  class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ fmtP(effectiveUnitPrice(item) * item.quantity) }}
                </p>
                <p
                  v-if="activeCurrency !== 'NGN'"
                  class="text-[11px] text-gray-400 dark:text-neutral-500"
                >
                  {{ fmtPNGN(effectiveUnitPrice(item) * item.quantity) }}
                </p>
                <!-- Crossed-out original if discounted -->
                <p
                  v-if="
                    (item.variant?.price ?? item.variant?.product?.price ?? 0) >
                    effectiveUnitPrice(item)
                  "
                  class="text-[10px] text-gray-400 line-through dark:text-neutral-500"
                >
                  {{
                    fmtP(
                      (item.variant?.price ??
                        item.variant?.product?.price ??
                        0) * item.quantity,
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Details -->
        <div
          class="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2
            class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400"
          >
            Delivery Details
          </h2>

          <!-- Saved address cards -->
          <div v-if="savedAddresses.length" class="mb-4 space-y-2">
            <button
              v-for="addr in savedAddresses"
              :key="addr.id"
              type="button"
              :class="
                selectedAddressId === addr.id
                  ? 'border-brand bg-brand/5 dark:bg-brand/10'
                  : 'border-gray-100 hover:border-gray-200 dark:border-neutral-800 dark:hover:border-neutral-700'
              "
              class="w-full rounded-xl border-2 p-3.5 text-left transition-all"
              @click="selectSavedAddress(addr)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div
                    class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                    :class="
                      selectedAddressId === addr.id
                        ? 'border-brand'
                        : 'border-gray-300 dark:border-neutral-600'
                    "
                  >
                    <div
                      v-if="selectedAddressId === addr.id"
                      class="h-2 w-2 rounded-full bg-brand"
                    />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <p
                        class="text-[13px] font-semibold text-gray-900 dark:text-neutral-100"
                      >
                        {{ addr.name }}
                      </p>
                      <span
                        v-if="addr.label"
                        class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-neutral-700 dark:text-neutral-400"
                        >{{ addr.label }}</span
                      >
                      <span
                        v-if="addr.isDefault"
                        class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand"
                        >Default</span
                      >
                    </div>
                    <p class="text-[12px] text-gray-500 dark:text-neutral-400">
                      {{ addr.address }}, {{ addr.county
                      }}{{ addr.state ? ', ' + addr.state : '' }},
                      {{ addr.country }}
                    </p>
                    <p
                      v-if="addr.phone"
                      class="text-[11px] text-gray-400 dark:text-neutral-500"
                    >
                      {{ addr.phone }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  @click.stop="deleteAddress(addr.id)"
                >
                  <Icon name="mdi:trash-can-outline" size="15" />
                </button>
              </div>
            </button>

            <button
              type="button"
              class="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-[13px] font-semibold text-gray-500 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700"
              @click="showNewAddressForm = !showNewAddressForm"
            >
              <Icon
                :name="showNewAddressForm ? 'mdi:minus' : 'mdi:plus'"
                size="15"
              />
              {{
                showNewAddressForm
                  ? 'Cancel new address'
                  : 'Add / use different address'
              }}
            </button>
          </div>

          <!-- Address form -->
          <div
            v-if="!savedAddresses.length || showNewAddressForm"
            class="space-y-3"
          >
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label
                  class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                  >Full Name</label
                >
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Your full name"
                  class="input-field"
                />
              </div>
              <div class="col-span-2">
                <label
                  class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                  >Delivery Address</label
                >
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="Street address"
                  class="input-field"
                />
              </div>
              <div>
                <label
                  class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                  >City / State</label
                >
                <input
                  v-model="form.county"
                  type="text"
                  placeholder="Lagos"
                  class="input-field"
                />
              </div>
              <div>
                <label
                  class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                  >Postal Code</label
                >
                <input
                  v-model="form.zipcode"
                  type="text"
                  placeholder="100001"
                  class="input-field"
                />
              </div>
              <div>
                <label
                  class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                  >Phone</label
                >
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+2348012345678"
                  class="input-field"
                />
              </div>
              <div>
                <label
                  class="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400"
                  >Country</label
                >
                <select
                  v-model="form.country"
                  class="input-field"
                  @change="onCountryChange"
                >
                  <option value="">Select country</option>
                  <option v-for="c in COUNTRIES" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Save address row -->
            <div
              v-if="form.name && form.address && form.country"
              class="flex items-center gap-2 pt-1"
            >
              <template v-if="!showSavePanel">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] font-semibold text-gray-600 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                  @click="showSavePanel = true"
                >
                  <Icon name="mdi:bookmark-plus-outline" size="14" />
                  Save address
                </button>
              </template>
              <template v-else>
                <input
                  v-model="saveLabel"
                  type="text"
                  placeholder="Label (e.g. Home, Work)"
                  maxlength="20"
                  class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[12px] text-gray-700 placeholder-gray-400 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                />
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:opacity-50"
                  :disabled="isSaving"
                  @click="handleSaveAddress"
                >
                  <Icon
                    v-if="isSaving"
                    name="eos-icons:loading"
                    size="13"
                    class="animate-spin"
                  />
                  <Icon v-else name="mdi:check" size="13" />
                  {{ isSaving ? 'Saving…' : 'Save' }}
                </button>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-gray-400 hover:text-gray-600"
                  @click="showSavePanel = false"
                >
                  <Icon name="mdi:close" size="14" />
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Shipping -->
        <div
          class="rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2
            class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400"
          >
            Shipping
          </h2>

          <!-- Loading -->
          <div
            v-if="shippingLoading || isLoadingRates"
            class="flex items-center gap-2 text-sm text-gray-400"
          >
            <Icon name="eos-icons:loading" size="16" class="animate-spin" />
            Fetching rates…
          </div>

          <!-- Live carrier rates: domestic uses local carrier, international uses global carrier -->
          <template v-if="activeCountry">
            <!-- API error + flat-rate fallback -->
            <div v-if="ratesError" class="space-y-2">
              <div
                class="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
              >
                {{ ratesError }}
              </div>
              <div
                v-if="shipping"
                class="flex items-center justify-between rounded-xl border border-gray-100 p-3 dark:border-neutral-800"
              >
                <div>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                  >
                    {{ shipping.zoneName }}
                    <span class="text-xs font-normal text-gray-400"
                      >(estimated)</span
                    >
                  </p>
                  <p class="text-xs text-gray-400 dark:text-neutral-500">
                    Est. {{ shipping.estimatedDays }}
                  </p>
                </div>
                <p
                  class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ shipping.cost === 0 ? 'Free' : fmtS(shipping.cost) }}
                </p>
              </div>
            </div>

            <!-- Live carrier rates -->
            <div v-else-if="liveRates.length" class="space-y-2">
              <button
                v-for="rate in liveRates"
                :key="rate.rateId"
                type="button"
                :class="
                  selectedRate?.rateId === rate.rateId
                    ? 'border-brand bg-brand/5 dark:bg-brand/10'
                    : 'border-gray-100 hover:border-gray-200 dark:border-neutral-800 dark:hover:border-neutral-700'
                "
                class="flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all"
                @click="selectedRate = rate"
              >
                <div
                  class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  :class="
                    selectedRate?.rateId === rate.rateId
                      ? 'border-brand'
                      : 'border-gray-300 dark:border-neutral-600'
                  "
                >
                  <div
                    v-if="selectedRate?.rateId === rate.rateId"
                    class="h-2 w-2 rounded-full bg-brand"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p
                    class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
                  >
                    {{ rate.carrier }} — {{ rate.service }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-neutral-500">
                    {{ rate.estimatedDays }}
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <p
                    class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
                  >
                    {{ fmtP(rate.amountNGN) }}
                  </p>
                  <p
                    v-if="activeCurrency !== 'NGN'"
                    class="text-[11px] text-gray-400"
                  >
                    {{ fmtPNGN(rate.amountNGN) }}
                  </p>
                </div>
              </button>
            </div>

            <!-- Flat-rate fallback (seller has no ship-from address set) -->
            <div v-else-if="shipping" class="flex items-center justify-between">
              <div>
                <p
                  class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                >
                  {{ shipping.zoneName }}
                </p>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  Est. {{ shipping.estimatedDays }}
                </p>
              </div>
              <p
                class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
              >
                {{ shipping.cost === 0 ? 'Free' : fmtS(shipping.cost) }}
              </p>
            </div>

            <div v-else class="text-sm text-gray-400 dark:text-neutral-500">
              Enter your delivery address to see shipping rates.
            </div>
          </template>

          <p v-else class="text-sm text-gray-400 dark:text-neutral-500">
            Select a country to see shipping rates.
          </p>
        </div>

        <!-- Order Total -->
        <div
          class="space-y-2 rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex justify-between text-sm text-gray-600 dark:text-neutral-400"
          >
            <span>Subtotal</span>
            <div class="text-right">
              <span>{{ fmtP(cartTotal) }}</span>
              <span
                v-if="activeCurrency !== 'NGN'"
                class="ml-1 text-xs text-gray-400"
                >({{ fmtPNGN(cartTotal) }})</span
              >
            </div>
          </div>
          <div
            class="flex justify-between text-sm text-gray-600 dark:text-neutral-400"
          >
            <span>Shipping</span>
            <div class="text-right">
              <span>{{ shippingDisplay }}</span>
              <span
                v-if="
                  activeCurrency !== 'NGN' &&
                  activeCountry === 'NG' &&
                  shipping &&
                  shipping.cost > 0
                "
                class="ml-1 text-xs text-gray-400"
                >({{ fmtNGN(shipping.cost) }})</span
              >
            </div>
          </div>
          <div
            class="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900 dark:border-neutral-800 dark:text-neutral-100"
          >
            <span>Total</span>
            <div class="text-right">
              <span>{{ fmtP(grandTotalMajor) }}</span>
              <span
                v-if="activeCurrency !== 'NGN'"
                class="ml-1 text-xs font-normal text-gray-400"
                >({{ fmtPNGN(grandTotalMajor) }})</span
              >
            </div>
          </div>
        </div>

        <!-- Payment method selector -->
        <div
          class="rounded-2xl border border-gray-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <p
            class="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
          >
            Payment Method
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              :class="
                paymentMethod === 'paystack'
                  ? 'border-brand bg-brand/5 text-brand dark:bg-brand/10'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-neutral-700 dark:text-neutral-400'
              "
              class="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all"
              @click="paymentMethod = 'paystack'"
            >
              <Icon name="mdi:credit-card-outline" size="18" />
              Card
            </button>
            <button
              type="button"
              :class="
                paymentMethod === 'paypal'
                  ? 'border-[#003087] bg-[#003087]/5 text-[#003087] dark:bg-[#003087]/10'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-neutral-700 dark:text-neutral-400'
              "
              class="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all"
              @click="paymentMethod = 'paypal'"
            >
              <Icon name="logos:paypal" size="18" />
              PayPal
            </button>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="checkoutError"
          class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {{ checkoutError }}
        </div>

        <!-- Pay button -->
        <button
          :disabled="isSubmitting || !isFormValid"
          class="flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl py-4 text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          :class="
            paymentMethod === 'paypal'
              ? 'bg-[#0070ba] hover:bg-[#005ea6]'
              : 'bg-brand hover:bg-brand/90'
          "
          @click="handleCheckout"
        >
          <Icon
            v-if="isSubmitting"
            name="eos-icons:loading"
            size="20"
            class="animate-spin"
          />
          <template v-else>
            <span class="text-base font-bold">
              <template v-if="paymentMethod === 'paypal'">
                Pay ${{
                  grandTotalUSD.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }}
                with PayPal
              </template>
              <template v-else>
                {{
                  activeCurrency === 'NGN'
                    ? `Pay ${fmtPNGN(grandTotalMajor)}`
                    : `Pay ${fmtP(grandTotalMajor)}`
                }}
              </template>
            </span>
            <span
              v-if="paymentMethod !== 'paypal' && activeCurrency !== 'NGN'"
              class="text-[11px] font-normal opacity-80"
            >
              Charged as {{ fmtPNGN(grandTotalMajor) }}
            </span>
          </template>
          <span v-if="isSubmitting" class="text-sm"
            >Redirecting to payment…</span
          >
        </button>

        <p class="text-center text-xs text-gray-400 dark:text-neutral-500">
          {{
            paymentMethod === 'paypal'
              ? 'Secured by PayPal · USD payment'
              : 'Secured by Paystack · Your payment is encrypted'
          }}
        </p>
      </div>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { useCart } from '~~/layers/commerce/app/composables/useCart'
import { useShipping } from '~~/layers/commerce/app/composables/useShipping'
import { useRuntimeConfig } from '#app'
import { useOrderApi } from '~~/layers/commerce/app/services/order.api'
import { useAffiliate } from '~~/layers/commerce/app/composables/useAffiliate'
import { useSeo } from '~~/app/composables/useSeo'
import type {
  ICartItem,
  IProduct,
} from '~~/layers/commerce/app/types/commerce.types'
import { effectiveUnitPrice } from '~~/layers/commerce/app/stores/cart.store'
import {
  useAddressApi,
  type ISavedAddress,
} from '~~/layers/commerce/app/services/address.api'
import { notify } from '@kyvg/vue3-notification'

definePageMeta({ middleware: 'auth' })

const { setCheckoutPage } = useSeo()
setCheckoutPage()
const { items, cartTotal, fetchCart } = useCart()
const {
  calculation: shippingCalculation,
  calculateShipping,
  isLoading: shippingLoading,
  liveRates,
  selectedRate,
  isLoadingRates,
  ratesError,
  fetchLiveRates,
} = useShipping()
const {
  getCurrencyForCountry,
  formatPrice: formatProduct,
  formatKobo: format,
  formatNGN,
  formatProductNGN,
} = useCurrency()
const orderApi = useOrderApi()
const addressApi = useAddressApi()
const { getStoredRef, clearStoredRef, captureAffiliateRef } = useAffiliate()
const config = useRuntimeConfig()

const isSubmitting = ref(false)
const paymentMethod = ref<'paystack' | 'paypal'>('paystack')
const checkoutError = ref('')
const isSaving = ref(false)
const showSavePanel = ref(false)
const showNewAddressForm = ref(false)
const saveLabel = ref('')
const savedAddresses = ref<ISavedAddress[]>([])
const selectedAddressId = ref<number | null>(null)

const form = reactive({
  name: '',
  address: '',
  county: '',
  state: '',
  zipcode: '',
  country: '',
  phone: '',
})

const DEFAULT_PARCEL = { weightKg: 0.5, lengthCm: 20, widthCm: 15, heightCm: 5 }

// Derived country and currency
const activeCountry = computed(() => form.country)
const activeCurrency = computed(() => getCurrencyForCountry(form.country))

// Primary seller in cart: seller with the most item quantity
const primarySellerSlug = computed(() => {
  const counts = new Map<string, number>()
  for (const item of items.value) {
    const slug = (item as ICartItem & { variant?: { product?: IProduct } })
      .variant?.product?.seller?.store_slug
    if (slug) counts.set(slug, (counts.get(slug) || 0) + (item.quantity || 1))
  }
  let max = 0
  let primary = ''
  for (const [slug, count] of counts) {
    if (count > max) {
      max = count
      primary = slug
    }
  }
  return primary || null
})

// Fetch live carrier rates for the current form address using seller's origin
const triggerLiveRates = async () => {
  if (!form.address || !form.county || !form.country) return
  await fetchLiveRates({
    storeSlug: primarySellerSlug.value || undefined,
    to: {
      name: form.name || 'Customer',
      street1: form.address,
      city: form.county,
      state: form.state || form.county,
      zip: form.zipcode || '000000',
      country: form.country,
    },
    parcel: DEFAULT_PARCEL,
  } as any)
}

// Shipping cost in major NGN:
// - live rate selected → use it (major NGN)
// - flat rate (GlobalShippingZone) → convert from kobo
const shippingCostMajor = computed((): number => {
  if (selectedRate.value) return selectedRate.value.amountNGN
  return (shippingCalculation.value?.cost ?? 0) / 100
})

// Grand total in major NGN units
const grandTotalMajor = computed(
  () => cartTotal.value + shippingCostMajor.value,
)

// Total in USD for PayPal (1600 NGN = 1 USD)
const grandTotalUSD = computed(
  () => Math.round((grandTotalMajor.value / 1600) * 100) / 100,
)

// Display string for the Order Total shipping row
const shippingDisplay = computed(() => {
  if (selectedRate.value) return fmtP(selectedRate.value.amountNGN)
  if (!shippingCalculation.value) return '—'
  return shippingCalculation.value.cost === 0
    ? 'Free'
    : fmtS(shippingCalculation.value.cost)
})

// fmtP / fmtPNGN — for product prices and cart totals (major NGN units)
const fmtP = (majorNGN: number) => formatProduct(majorNGN, activeCurrency.value)
const fmtPNGN = (majorNGN: number) => formatProductNGN(majorNGN)
// fmtS / fmtNGN — for shipping costs (kobo)
const fmtS = (kobo: number) => format(kobo, activeCurrency.value)
const fmtNGN = (kobo: number) => formatNGN(kobo)

const isFormValid = computed(
  () =>
    form.name.trim() &&
    form.address.trim() &&
    form.country &&
    // Valid when: a live rate is selected, OR flat-rate zone loaded, OR loading
    // is still in progress (prevents blocking on slow API calls)
    (!!selectedRate.value ||
      !!shippingCalculation.value ||
      isLoadingRates.value),
)

const selectSavedAddress = (addr: ISavedAddress) => {
  selectedAddressId.value = addr.id
  showNewAddressForm.value = false
  form.name = addr.name
  form.address = addr.address
  form.county = addr.county
  form.state = addr.state
  form.zipcode = addr.zipcode
  form.country = addr.country
  form.phone = addr.phone
  // Fetch flat rate as fallback, and always attempt live carrier rates
  calculateShipping(addr.country)
  triggerLiveRates()
}

const onCountryChange = () => {
  selectedAddressId.value = null
  calculateShipping(form.country)
  triggerLiveRates()
}

const handleSaveAddress = async () => {
  if (!form.name.trim() || !form.address.trim() || !form.country) return
  isSaving.value = true
  try {
    const result = await addressApi.saveAddress({
      label: saveLabel.value || undefined,
      name: form.name,
      address: form.address,
      county: form.county,
      state: form.state,
      zipcode: form.zipcode,
      country: form.country,
      phone: form.phone,
    })
    savedAddresses.value.push(result.data)
    if (savedAddresses.value.length === 1) selectSavedAddress(result.data)
    showSavePanel.value = false
    showNewAddressForm.value = false
    saveLabel.value = ''
    notify({ type: 'success', text: 'Address saved!' })
  } finally {
    isSaving.value = false
  }
}

const deleteAddress = async (id: number) => {
  try {
    await addressApi.deleteAddress(id)
    savedAddresses.value = savedAddresses.value.filter((a) => a.id !== id)
    if (selectedAddressId.value === id) {
      const next =
        savedAddresses.value.find((a) => a.isDefault) || savedAddresses.value[0]
      if (next) {
        selectSavedAddress(next)
      } else {
        selectedAddressId.value = null
        Object.assign(form, {
          name: '',
          address: '',
          county: '',
          state: '',
          zipcode: '',
          country: '',
          phone: '',
        })
      }
    }
  } catch {}
}

const handleCheckout = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  checkoutError.value = ''
  isSubmitting.value = true

  // shippingCost in kobo for the payment API
  const shippingCost = selectedRate.value
    ? Math.round(selectedRate.value.amountNGN * 100)
    : shippingCalculation.value?.cost ?? 0
  const shippingZone = selectedRate.value
    ? `${selectedRate.value.carrier} ${selectedRate.value.service}`
    : shippingCalculation.value?.zoneName
  const estimatedDays = selectedRate.value
    ? selectedRate.value.estimatedDays
    : shippingCalculation.value?.estimatedDays

  const affiliateCode = getStoredRef() || undefined

  const orderPayload = {
    items: items.value.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    })),
    name: form.name,
    address: form.address,
    county: form.county,
    zipcode: form.zipcode,
    country: form.country,
    shippingCost,
    shippingZone,
    estimatedDays,
    ...(affiliateCode ? { affiliateCode } : {}),
  }

  try {
    if (paymentMethod.value === 'paypal') {
      const result: any = await orderApi.initializePayPal(orderPayload)
      if (!result?.data?.approvalUrl)
        throw new Error('PayPal did not return an approval URL')
      clearStoredRef()
      window.location.href = result.data.approvalUrl
    } else {
      const callbackUrl = `${config.public.baseURL}/buyer/orders?payment=success`
      const result: any = await orderApi.initializePayment({
        ...orderPayload,
        currency: 'NGN', // Always charge in NGN via Paystack
        callback_url: callbackUrl,
      })
      clearStoredRef()
      window.location.href = result.data.authorizationUrl
    }
  } catch (e: any) {
    checkoutError.value =
      e.message || 'Failed to initialize payment. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  captureAffiliateRef()
  await fetchCart()
  try {
    const result = await addressApi.getAddresses()
    savedAddresses.value = result.data
    const def = result.data.find((a) => a.isDefault) || result.data[0]
    if (def) selectSavedAddress(def)
  } catch {}
})

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'CM', name: 'Cameroon' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
]
</script>

<style scoped>
.input-field {
  @apply w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500;
}
</style>
