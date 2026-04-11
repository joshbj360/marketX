<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen && product"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
        @click.self="$emit('close')"
      >
        <div
          @click.stop
          class="w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl dark:bg-neutral-900"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2">
              <Icon name="mdi:bullhorn-outline" size="20" class="text-brand" />
              <h2
                class="text-base font-semibold text-gray-900 dark:text-neutral-100"
              >
                Market This Product
              </h2>
            </div>
            <button
              @click="$emit('close')"
              class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Icon
                name="mdi:close"
                size="18"
                class="text-gray-500 dark:text-neutral-400"
              />
            </button>
          </div>

          <!-- Body -->
          <div class="space-y-5 px-5 py-5">
            <!-- Product preview -->
            <div class="flex items-center gap-3">
              <div
                class="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800"
              >
                <img
                  v-if="coverImage"
                  :src="coverImage"
                  :alt="product.title"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center"
                >
                  <Icon
                    name="mdi:image-outline"
                    size="24"
                    class="text-gray-300 dark:text-neutral-600"
                  />
                </div>
              </div>
              <div class="min-w-0">
                <p
                  class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-neutral-100"
                >
                  {{ product.title }}
                </p>
                <p class="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                  {{ formatPrice(product.price) }}
                </p>
              </div>
            </div>

            <!-- Earn pill -->
            <div
              class="rounded-2xl bg-gradient-to-br from-brand to-[#8a0f2b] p-5 text-center text-white shadow-lg shadow-brand/20 dark:shadow-none"
            >
              <p
                class="mb-1 text-xs font-medium uppercase tracking-wider opacity-80"
              >
                You earn
              </p>
              <p class="text-4xl font-extrabold tracking-tight">
                {{ formatPrice(product.affiliateCommission ?? 0) }}
              </p>
              <p class="mt-1 text-sm opacity-80">for every sale you drive</p>
            </div>

            <!-- How it works -->
            <div class="space-y-2.5">
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400"
              >
                How it works
              </p>
              <div class="flex items-start gap-2.5">
                <div
                  class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 dark:bg-brand/20"
                >
                  <span class="text-[10px] font-bold text-brand">1</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-neutral-300">
                  Copy your unique referral link below
                </p>
              </div>
              <div class="flex items-start gap-2.5">
                <div
                  class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 dark:bg-brand/20"
                >
                  <span class="text-[10px] font-bold text-brand">2</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-neutral-300">
                  Share it on your socials, stories, or DMs
                </p>
              </div>
              <div class="flex items-start gap-2.5">
                <div
                  class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 dark:bg-brand/20"
                >
                  <span class="text-[10px] font-bold text-brand">3</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-neutral-300">
                  Earn
                  <strong>{{
                    formatPrice(product.affiliateCommission ?? 0)
                  }}</strong>
                  when someone buys through your link
                </p>
              </div>
            </div>

            <!-- Referral link -->
            <div>
              <p
                class="mb-1.5 text-xs font-semibold text-gray-500 dark:text-neutral-400"
              >
                Your referral link
              </p>
              <div
                class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <p
                  class="flex-1 truncate font-mono text-xs text-gray-500 dark:text-neutral-400"
                >
                  {{ referralUrl }}
                </p>
                <button
                  @click="copyLink"
                  class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
                  :class="
                    copied
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-brand/10 text-brand hover:bg-brand/20'
                  "
                >
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 px-5 pb-5">
            <button
              @click="shareLink"
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d81b36]"
            >
              <Icon name="mdi:share-variant-outline" size="18" />
              Share Now
            </button>
            <button
              @click="$emit('close')"
              class="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { IProduct } from '~~/layers/commerce/app/types/commerce.types'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'

const props = defineProps<{
  isOpen: boolean
  product: IProduct | null
}>()

defineEmits(['close'])

const profileStore = useProfileStore()
const coverImage = computed(() => {
  if (!props.product) return null
  return props.product.media?.find((m) => !m.isBgMusic)?.url ?? null
})

const currency = computed(
  () => props.product?.seller?.default_currency ?? 'NGN',
)

import { formatProductPrice } from '~~/shared/utils/currency'
const formatPrice = (amount: number) =>
  formatProductPrice(amount, currency.value as any)

// Build referral URL — includes ?ref=userId so the server can attribute the sale
const referralUrl = computed(() => {
  if (!props.product || typeof window === 'undefined') return ''
  const base = `${window.location.origin}/product/${props.product.slug}`
  const userId = profileStore.me?.username
  return userId ? `${base}?ref=${userId}` : base
})

const copied = ref(false)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(referralUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {}
}

const shareLink = async () => {
  if (!props.product) return
  const data = {
    title: props.product.title,
    text: `I earn ${formatPrice(props.product.affiliateCommission!)} when you buy this 👇`,
    url: referralUrl.value,
  }
  if (navigator.share) {
    try {
      await navigator.share(data)
    } catch {}
  } else {
    await copyLink()
  }
}

// Reset copied state when modal closes
watch(
  () => props.isOpen,
  (open) => {
    if (!open) copied.value = false
  },
)
</script>
