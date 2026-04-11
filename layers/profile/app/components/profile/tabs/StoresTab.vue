<template>
  <div class="p-4">
    <!-- Skeleton -->
    <div
      v-if="isLoading && !sellers.length"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div
        v-for="i in 2"
        :key="i"
        class="animate-pulse overflow-hidden rounded-2xl bg-gray-50 dark:bg-neutral-800"
      >
        <div class="h-20 bg-gray-100 dark:bg-neutral-700" />
        <div class="space-y-2 p-3">
          <div class="h-4 w-1/2 rounded bg-gray-100 dark:bg-neutral-700" />
          <div class="h-3 w-1/3 rounded bg-gray-100 dark:bg-neutral-700" />
          <div class="h-8 rounded-xl bg-gray-100 dark:bg-neutral-700" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!isLoading && !sellers.length"
      class="flex flex-col items-center justify-center gap-3 py-16"
    >
      <Icon
        name="mdi:store-outline"
        size="48"
        class="text-gray-300 dark:text-neutral-600"
      />
      <p class="text-[14px] text-gray-500 dark:text-neutral-400">
        No stores yet
      </p>
      <NuxtLink
        to="/sellers/create"
        class="rounded-xl bg-gradient-to-r from-[#f02c56] to-purple-600 px-5 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
      >
        Create a Store
      </NuxtLink>
    </div>

    <!-- Store cards -->
    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="seller in sellers"
        :key="seller.id"
        class="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        <!-- Banner -->
        <div
          class="relative h-20 bg-gradient-to-r from-[#f02c56] to-purple-600"
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
          <!-- Status badge -->
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
        <div class="px-3 pb-3 pt-0">
          <div class="-mt-6 mb-2 flex items-end gap-2">
            <div
              class="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-700"
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
                  size="20"
                  class="text-gray-400 dark:text-neutral-400"
                />
              </div>
            </div>
            <div class="min-w-0 pb-0.5">
              <h3
                class="truncate text-[13px] font-bold leading-tight text-gray-900 dark:text-neutral-100"
              >
                {{ seller.store_name || 'Unnamed Store' }}
              </h3>
              <div class="mt-0.5 flex items-center gap-1">
                <p
                  class="truncate text-[11px] text-gray-400 dark:text-neutral-500"
                >
                  @{{ seller.store_slug }}
                </p>
                <span
                  class="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-neutral-700 dark:text-neutral-400"
                >
                  {{ seller.default_currency ?? 'NGN' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div
            class="mb-2.5 flex items-center gap-3 text-[11px] text-gray-400 dark:text-neutral-500"
          >
            <span
              ><strong class="text-gray-700 dark:text-neutral-300">{{
                seller.followers_count
              }}</strong>
              Followers</span
            >
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <NuxtLink
              :to="`/sellers/profile/${seller.store_slug}`"
              class="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              View
            </NuxtLink>
            <NuxtLink
              :to="`/seller/${seller.store_slug}/dashboard`"
              class="flex-1 rounded-lg bg-gradient-to-r from-[#f02c56] to-purple-600 py-1.5 text-center text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Manage
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Create new store card (if under limit) -->
      <NuxtLink
        v-if="sellers.length < MAX_STORES"
        to="/sellers/create"
        class="group flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-brand"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-brand/10 dark:bg-neutral-700"
        >
          <Icon
            name="mdi:plus"
            size="22"
            class="text-gray-400 transition-colors group-hover:text-brand dark:text-neutral-500"
          />
        </div>
        <p
          class="text-[12px] font-semibold text-gray-400 transition-colors group-hover:text-brand dark:text-neutral-500"
        >
          Create Store
        </p>
        <p class="text-[10px] text-gray-300 dark:text-neutral-600">
          {{ sellers.length }}/{{ MAX_STORES }} stores
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'

const MAX_STORES = 5

const { sellers, isLoading, loadUserSellers } = useSellerManagement()

onMounted(async () => {
  if (!sellers.value.length) {
    await loadUserSellers()
  }
})
</script>
