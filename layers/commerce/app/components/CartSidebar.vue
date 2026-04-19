<template>
  <Teleport to="body">
    <Transition name="sidebar">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

        <!-- Panel -->
        <div
          class="relative flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-[400px] dark:bg-neutral-900"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2">
              <Icon
                name="mdi:shopping-outline"
                size="22"
                class="text-gray-700 dark:text-neutral-300"
              />
              <h2
                class="text-[16px] font-bold text-gray-900 dark:text-neutral-100"
              >
                Cart
              </h2>
              <span
                v-if="cartCount > 0"
                class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white"
              >
                {{ cartCount }}
              </span>
            </div>
            <button
              @click="$emit('close')"
              class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Icon
                name="mdi:close"
                size="20"
                class="text-gray-500 dark:text-neutral-400"
              />
            </button>
          </div>

          <!-- Items list -->
          <div class="flex-1 overflow-y-auto">
            <!-- Empty state -->
            <div
              v-if="showEmptyState"
              class="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"
            >
              <div
                class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <Icon
                  name="mdi:shopping-outline"
                  size="36"
                  class="text-gray-300 dark:text-neutral-600"
                />
              </div>
              <p
                class="text-[15px] font-semibold text-gray-700 dark:text-neutral-300"
              >
                Your cart is empty
              </p>
              <p class="text-[13px] text-gray-400 dark:text-neutral-500">
                Browse the shop and add items to get started
              </p>
              <button
                @click="$emit('close')"
                class="text-[13px] font-semibold text-brand transition-colors hover:text-[#d81b36]"
              >
                Continue shopping →
              </button>
            </div>

            <!-- Loading skeleton -->
            <div
              v-else-if="showInitialLoader"
              class="space-y-4 px-5 pt-4"
            >
              <div v-for="i in 3" :key="i" class="flex animate-pulse gap-3">
                <div
                  class="h-16 w-16 shrink-0 rounded-xl bg-gray-100 dark:bg-neutral-800"
                />
                <div class="flex-1 space-y-2">
                  <div
                    class="h-3 w-3/4 rounded bg-gray-100 dark:bg-neutral-800"
                  />
                  <div
                    class="h-3 w-1/2 rounded bg-gray-100 dark:bg-neutral-800"
                  />
                </div>
              </div>
            </div>

            <!-- Cart items -->
            <ul v-else class="space-y-3 px-4 pb-2 pt-4">
              <li
                v-for="item in items"
                :key="item.variantId"
                class="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50"
              >
                <!-- Thumbnail -->
                <div
                  class="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800"
                >
                  <img
                    v-if="item.variant?.product?.media?.length"
                    :src="imgThumb(item.variant.product.media[0].url)"
                    :alt="item.variant?.product?.title"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center"
                  >
                    <Icon
                      name="mdi:image-outline"
                      size="22"
                      class="text-gray-300 dark:text-neutral-600"
                    />
                  </div>
                </div>

                <!-- Info -->
                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-[13px] font-semibold leading-snug text-gray-900 dark:text-neutral-100"
                  >
                    {{ item.variant?.product?.title ?? 'Product' }}
                  </p>
                  <p
                    v-if="item.variant?.size"
                    class="mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500"
                  >
                    Size: {{ item.variant.size }}
                  </p>
                  <!-- Price row: effective price + crossed-out original -->
                  <div class="mt-0.5 flex items-baseline gap-1.5">
                    <p
                      class="text-[13px] font-bold text-gray-900 dark:text-neutral-100"
                    >
                      {{
                        formatPrice(itemEffectivePrice(item) * item.quantity)
                      }}
                    </p>
                    <p
                      v-if="itemOriginalPrice(item) > itemEffectivePrice(item)"
                      class="text-[11px] text-gray-400 line-through dark:text-neutral-500"
                    >
                      {{ formatPrice(itemOriginalPrice(item) * item.quantity) }}
                    </p>
                  </div>
                  <!-- Offer badge -->
                  <p
                    v-if="activeOffer(item)"
                    class="mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    {{
                      activeOffer(item)?.label ||
                      `Buy ${activeOffer(item)?.minQuantity}+, save ${activeOffer(item)?.discount}%`
                    }}
                  </p>

                  <!-- Qty controls -->
                  <div class="mt-1.5 flex items-center gap-2">
                    <div
                      class="flex items-center overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700"
                    >
                      <button
                        @click="handleDecrement(item)"
                        class="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                      >
                        <Icon name="mdi:minus" size="14" />
                      </button>
                      <span
                        class="w-8 text-center text-[13px] font-semibold text-gray-900 dark:text-neutral-100"
                        >{{ item.quantity }}</span
                      >
                      <button
                        @click="
                          updateQuantity(item.variantId, item.quantity + 1)
                        "
                        class="flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                      >
                        <Icon name="mdi:plus" size="14" />
                      </button>
                    </div>

                    <!-- Remove — always visible on touch, fade on desktop -->
                    <button
                      @click="removeFromCart(item.variantId)"
                      class="ml-auto rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 dark:text-neutral-500 dark:hover:bg-red-950/30"
                    >
                      <Icon name="mdi:trash-can-outline" size="16" />
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Footer -->
          <div
            v-if="items.length > 0"
            class="shrink-0 space-y-3 border-t border-gray-100 px-5 py-4 dark:border-neutral-800"
          >
            <!-- Subtotal -->
            <div class="flex items-center justify-between text-[14px]">
              <span class="text-gray-500 dark:text-neutral-400">Subtotal</span>
              <span class="font-bold text-gray-900 dark:text-neutral-100">{{
                formatPrice(cartTotal)
              }}</span>
            </div>

            <!-- Checkout CTA -->
            <NuxtLink
              to="/checkout"
              @click="$emit('close')"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#d81b36] active:scale-[0.98]"
            >
              <Icon name="mdi:lock-outline" size="16" />
              Checkout
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { effectiveUnitPrice } from '~~/layers/commerce/app/stores/cart.store'
import { imgThumb } from '~~/layers/core/app/utils/cloudinary'

const props = defineProps<{ isOpen: boolean }>()
defineEmits(['close'])

const profileStore = useProfileStore()
const {
  items,
  cartCount,
  cartTotal,
  isLoading,
  hasFetchedOnce,
  fetchCart,
  updateQuantity,
  removeFromCart,
} = useCart()

const showInitialLoader = computed(
  () =>
    props.isOpen &&
    profileStore.isLoggedIn &&
    !hasFetchedOnce.value &&
    !items.value.length,
)

const showEmptyState = computed(
  () =>
    !items.value.length &&
    (!profileStore.isLoggedIn || hasFetchedOnce.value) &&
    !isLoading.value,
)

watch(
  () => props.isOpen,
  async (open) => {
    if (open && profileStore.isLoggedIn) {
      await fetchCart()
    }
  },
)

const handleDecrement = (item: any) => {
  if (item.quantity <= 1) {
    removeFromCart(item.variantId)
  } else {
    updateQuantity(item.variantId, item.quantity - 1)
  }
}

// Base price before any discounts
const itemOriginalPrice = (item: any): number =>
  item.variant?.price ?? item.variant?.product?.price ?? 0

// Price after product.discount + offer discount
const itemEffectivePrice = (item: any): number => effectiveUnitPrice(item)

// Best active offer that applies to the current quantity
const activeOffer = (item: any) => {
  const offers: any[] = item.variant?.product?.offers ?? []
  return (
    offers
      .filter((o) => o.isActive && item.quantity >= o.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0] ?? null
  )
}

const { formatPrice } = useCurrency()
</script>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity 0.25s ease;
}
.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}
.sidebar-enter-active > div:last-child,
.sidebar-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.sidebar-enter-from > div:last-child,
.sidebar-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
