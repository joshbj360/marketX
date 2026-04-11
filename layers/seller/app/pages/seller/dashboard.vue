<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
          My Stores
        </h1>
        <p class="mt-0.5 text-[13px] text-gray-400 dark:text-neutral-500">
          Manage and monitor your seller profiles
        </p>
      </div>
      <NuxtLink
        to="/sellers/create"
        class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f02c56] to-purple-600 px-4 py-2 text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
      >
        <Icon name="mdi:plus" size="16" />
        Create Store
      </NuxtLink>
    </div>

    <!-- Error / Message -->
    <div
      v-if="message"
      class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
    >
      {{ message }}
    </div>
    <div
      v-if="error"
      class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
    >
      {{ error }}
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="isLoading && !hasSellers"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="h-28 bg-gray-100 dark:bg-neutral-800" />
        <div class="space-y-3 p-4">
          <div class="h-4 w-2/3 rounded bg-gray-100 dark:bg-neutral-800" />
          <div class="h-3 w-1/2 rounded bg-gray-100 dark:bg-neutral-800" />
          <div class="h-8 rounded-xl bg-gray-100 dark:bg-neutral-800" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!isLoading && !hasSellers"
      class="flex flex-col items-center justify-center gap-4 py-24"
    >
      <div
        class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
      >
        <Icon
          name="mdi:store-outline"
          size="40"
          class="text-gray-300 dark:text-neutral-600"
        />
      </div>
      <div class="text-center">
        <p class="text-[17px] font-bold text-gray-700 dark:text-neutral-300">
          No stores yet
        </p>
        <p class="mt-1 text-[13px] text-gray-400 dark:text-neutral-500">
          Create your first seller profile to start selling
        </p>
      </div>
      <NuxtLink
        to="/sellers/create"
        class="rounded-xl bg-gradient-to-r from-[#f02c56] to-purple-600 px-6 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
      >
        Create Your First Store
      </NuxtLink>
    </div>

    <!-- Store cards grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="seller in sellers"
        :key="seller.id"
        class="cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        @click="router.push(`/seller/${seller.store_slug}/dashboard`)"
      >
        <!-- Banner -->
        <div
          class="relative h-28 bg-gradient-to-r from-[#f02c56] to-purple-600"
          :style="
            seller.store_banner
              ? {
                  backgroundImage: `url(${seller.store_banner})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          "
        >
          <div class="absolute right-2 top-2 flex gap-1">
            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-bold"
              :class="
                seller.is_active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-500/80 text-white'
              "
            >
              {{ seller.is_active ? 'Active' : 'Inactive' }}
            </span>
            <span
              v-if="seller.is_verified"
              class="flex items-center gap-0.5 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white"
            >
              <Icon name="mdi:check-circle" size="10" />
              Verified
            </span>
          </div>
        </div>

        <!-- Logo + Info -->
        <div class="px-4 pb-4 pt-0">
          <div class="-mt-7 mb-3 flex items-end gap-3">
            <div
              class="h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-neutral-900 dark:bg-neutral-800"
            >
              <img
                v-if="seller.store_logo"
                :src="seller.store_logo"
                :alt="seller.store_name"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <Icon
                  name="mdi:store"
                  size="24"
                  class="text-gray-400 dark:text-neutral-500"
                />
              </div>
            </div>
            <div class="min-w-0 pb-1">
              <h3
                class="truncate text-[14px] font-bold leading-tight text-gray-900 dark:text-neutral-100"
              >
                {{ seller.store_name || 'Unnamed Store' }}
              </h3>
              <div class="mt-0.5 flex items-center gap-1.5">
                <p
                  class="truncate text-[12px] text-gray-400 dark:text-neutral-500"
                >
                  @{{ seller.store_slug }}
                </p>
                <span
                  class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {{ (seller as any).default_currency ?? 'NGN' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div
            class="mb-3 grid grid-cols-3 gap-2 border-b border-t border-gray-100 py-3 dark:border-neutral-800"
          >
            <div class="text-center">
              <p
                class="text-[18px] font-bold text-gray-900 dark:text-neutral-100"
              >
                {{ productCounts[seller.store_slug] ?? '–' }}
              </p>
              <p class="text-[10px] text-gray-400 dark:text-neutral-500">
                Products
              </p>
            </div>
            <div class="text-center">
              <p
                class="text-[18px] font-bold text-gray-900 dark:text-neutral-100"
              >
                {{ seller.followers_count }}
              </p>
              <p class="text-[10px] text-gray-400 dark:text-neutral-500">
                Followers
              </p>
            </div>
            <div class="text-center">
              <p
                class="text-[18px] font-bold text-gray-900 dark:text-neutral-100"
              >
                0
              </p>
              <p class="text-[10px] text-gray-400 dark:text-neutral-500">
                Orders
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2" @click.stop>
            <NuxtLink
              :to="`/seller/${seller.store_slug}/dashboard`"
              class="flex-1 rounded-xl bg-gradient-to-r from-[#f02c56] to-purple-600 py-2 text-center text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Manage
            </NuxtLink>
            <NuxtLink
              :to="`/sellers/profile/${seller.store_slug}`"
              class="flex-1 rounded-xl border border-gray-200 py-2 text-center text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              View
            </NuxtLink>
            <button
              @click="toggleStatus(seller)"
              :disabled="isLoading"
              class="flex-1 rounded-xl border py-2 text-center text-[12px] font-semibold transition-colors"
              :class="
                seller.is_active
                  ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30'
                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/30'
              "
            >
              {{ seller.is_active ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'

definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const router = useRouter()
const {
  sellers,
  isLoading,
  error,
  message,
  hasSellers,
  loadUserSellers,
  activateSeller,
  deactivateSeller,
} = useSellerManagement()
const { fetchSellerProducts } = useProduct()

const productCounts = ref<Record<string, number>>({})

onMounted(async () => {
  await loadUserSellers()
  for (const seller of sellers.value) {
    try {
      const res = (await fetchSellerProducts(seller.store_slug, {
        limit: 1,
      })) as any
      productCounts.value[seller.store_slug] =
        res?.total ?? res?.meta?.total ?? 0
    } catch {
      productCounts.value[seller.store_slug] = 0
    }
  }
})

const toggleStatus = async (seller: any) => {
  if (seller.is_active) {
    await deactivateSeller(seller.id)
  } else {
    await activateSeller(seller.id)
  }
}
</script>
