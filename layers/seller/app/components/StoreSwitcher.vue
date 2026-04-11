<template>
  <div class="relative" ref="container">
    <!-- Trigger button -->
    <button
      @click="isOpen = !isOpen"
      class="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
    >
      <!-- Store logo / icon -->
      <StoreAvatar
        :store-name="activeSeller?.store_name ?? ''"
        :logo="activeSeller?.store_logo ?? ''"
        size="md"
      />

      <!-- Name + slug (only visible at xl) -->
      <div class="hidden min-w-0 flex-1 flex-col xl:flex">
        <span
          class="truncate text-[13px] font-semibold leading-tight text-gray-900 dark:text-neutral-100"
        >
          {{ activeSeller?.store_name ?? 'My Stores' }}
        </span>
        <span class="truncate text-[11px] text-gray-400 dark:text-neutral-500">
          {{
            activeSeller
              ? `@${activeSeller.store_slug}`
              : `${sellers.length} store${sellers.length !== 1 ? 's' : ''}`
          }}
        </span>
      </div>

      <Icon
        name="mdi:chevron-down"
        size="16"
        class="hidden shrink-0 text-gray-400 transition-transform duration-200 xl:block dark:text-neutral-500"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute left-0 top-full z-50 mt-1 min-w-[260px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl xl:w-56 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <!-- Store list -->
        <div class="py-1">
          <button
            v-for="seller in sellers"
            :key="seller.id"
            @click="selectStore(seller.store_slug)"
            class="flex w-full items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
            :class="{
              'bg-gray-50 dark:bg-neutral-800': activeSeller?.id === seller.id,
            }"
          >
            <StoreAvatar
              :store-name="seller.store_name ?? ''"
              :logo="seller.store_logo ?? ''"
              size="sm"
            />
            <div class="flex min-w-0 flex-1 flex-col text-left">
              <span
                class="truncate text-[12px] font-semibold text-gray-900 dark:text-neutral-100"
                >{{ seller.store_name }}</span
              >
              <span class="text-[10px] text-gray-400 dark:text-neutral-500"
                >@{{ seller.store_slug }}</span
              >
            </div>
            <Icon
              v-if="activeSeller?.id === seller.id"
              name="mdi:check"
              size="14"
              class="shrink-0 text-brand"
            />
          </button>
        </div>

        <div class="border-t border-gray-100 py-1 dark:border-neutral-800">
          <NuxtLink
            to="/sellers/create"
            @click="isOpen = false"
            class="flex items-center gap-2.5 px-3 py-2 text-brand transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            <Icon name="mdi:plus" size="16" class="shrink-0" />
            <span class="text-[12px] font-semibold">Create Store</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'
import StoreAvatar from '~~/layers/profile/app/components/StoreAvatar.vue'

const route = useRoute()
const router = useRouter()

const { sellers, loadUserSellers } = useSellerManagement()

const isOpen = ref(false)
const container = ref<HTMLElement | null>(null)

const activeSeller = computed(
  () =>
    sellers.value.find((s) => s.store_slug === route.params.storeSlug) ?? null,
)

const selectStore = (slug: string) => {
  isOpen.value = false
  router.push(`/seller/${slug}/dashboard`)
}

const handleOutsideClick = (e: MouseEvent) => {
  if (container.value && !container.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick)
  if (!sellers.value.length) {
    await loadUserSellers().catch(() => {})
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
