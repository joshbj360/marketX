<template>
  <HomeLayout :narrow-feed="true" :hide-right-sidebar="true">
    <div class="mx-auto max-w-md py-8">

      <!-- Loading -->
      <div v-if="pending" class="space-y-4 animate-pulse">
        <div class="h-28 rounded-2xl bg-gray-100 dark:bg-neutral-800" />
        <div class="h-5 w-48 rounded bg-gray-100 dark:bg-neutral-800" />
        <div class="h-4 w-32 rounded bg-gray-100 dark:bg-neutral-800" />
      </div>

      <!-- Square not found -->
      <div v-else-if="!square" class="py-24 text-center">
        <Icon name="mdi:store-off-outline" size="52" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
        <p class="font-semibold text-gray-500 dark:text-neutral-400">Square not found</p>
        <NuxtLink to="/squares" class="mt-4 inline-block text-sm text-brand hover:underline">Browse squares</NuxtLink>
      </div>

      <template v-else>
        <!-- Square header card -->
        <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <!-- Banner -->
          <div class="relative h-28">
            <img
              v-if="square.bannerUrl"
              :src="square.bannerUrl"
              :alt="square.name"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="h-full w-full"
              :style="`background: linear-gradient(135deg, ${accent}44, ${accent}11)`"
            />
          </div>

          <div class="relative px-4 pb-4">
            <!-- Icon -->
            <div
              class="-mt-6 mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow dark:border-neutral-900 dark:bg-neutral-900"
              :style="`border-color: ${accent}55`"
            >
              <img v-if="square.iconUrl" :src="square.iconUrl" :alt="square.name" class="h-full w-full rounded-lg object-cover" />
              <span v-else class="text-base font-black" :style="`color: ${accent}`">
                {{ square.name.slice(0, 2).toUpperCase() }}
              </span>
            </div>

            <h1 class="text-lg font-black text-gray-900 dark:text-white">{{ square.name }}</h1>
            <p v-if="square.city || square.state" class="text-sm text-gray-400 dark:text-neutral-500">
              📍 {{ [square.city, square.state].filter(Boolean).join(', ') }}
            </p>
            <p v-if="square.description" class="mt-2 text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
              {{ square.description }}
            </p>

            <!-- Stats -->
            <div class="mt-3 flex items-center gap-4 text-[12px] text-gray-400 dark:text-neutral-500">
              <span><strong class="text-gray-700 dark:text-neutral-300">{{ square.memberCount ?? 0 }}</strong> sellers</span>
              <span><strong class="text-gray-700 dark:text-neutral-300">{{ square.followerCount ?? 0 }}</strong> followers</span>
              <span class="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase dark:bg-neutral-800">
                {{ square.type === 'GEOGRAPHIC' ? '📍 Location' : '🏷️ Category' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Rules card -->
        <div class="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <p class="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Membership rules</p>
          <ul class="space-y-1.5 text-sm text-amber-800 dark:text-amber-300">
            <li class="flex items-start gap-2">
              <Icon name="mdi:information-outline" size="15" class="mt-0.5 shrink-0" />
              <span>Your application is reviewed by the Square's officers before activation.</span>
            </li>
            <li v-if="square.type === 'GEOGRAPHIC'" class="flex items-start gap-2">
              <Icon name="mdi:map-marker-outline" size="15" class="mt-0.5 shrink-0" />
              <span>Geographic squares count as your <strong>primary</strong> square — you can only have one.</span>
            </li>
            <li v-else class="flex items-start gap-2">
              <Icon name="mdi:tag-outline" size="15" class="mt-0.5 shrink-0" />
              <span>Category squares are secondary — you can join up to 2 alongside your primary.</span>
            </li>
            <li class="flex items-start gap-2">
              <Icon name="mdi:store-outline" size="15" class="mt-0.5 shrink-0" />
              <span>Your products and posts will appear in this square's feed once approved.</span>
            </li>
          </ul>
        </div>

        <!-- Not a seller -->
        <div
          v-if="!hasSeller"
          class="mt-4 rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Icon name="mdi:store-plus-outline" size="40" class="mx-auto mb-3 text-gray-300 dark:text-neutral-600" />
          <p class="font-semibold text-gray-700 dark:text-neutral-300">You need a seller account to join</p>
          <p class="mt-1 text-sm text-gray-400 dark:text-neutral-500">Create a store first, then come back to apply.</p>
          <NuxtLink
            to="/sellers/create"
            class="mt-4 inline-block rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand/90"
          >
            Create a store
          </NuxtLink>
        </div>

        <!-- Apply form -->
        <div v-else class="mt-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <!-- Success state -->
          <div v-if="applied" class="py-6 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <Icon name="mdi:check-circle-outline" size="36" class="text-green-500" />
            </div>
            <h2 class="text-base font-black text-gray-900 dark:text-white">Application submitted!</h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              The officers of <strong>{{ square.name }}</strong> will review your application and notify you.
            </p>
            <NuxtLink
              :to="`/squares/${square.slug}`"
              class="mt-5 inline-block rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-600"
            >
              Back to Square
            </NuxtLink>
          </div>

          <!-- Error state -->
          <div v-else-if="apiError" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {{ apiError }}
          </div>

          <template v-if="!applied">
            <h2 class="mb-1 text-base font-black text-gray-900 dark:text-white">Apply to join {{ square.name }}</h2>
            <p class="mb-4 text-sm text-gray-500 dark:text-neutral-400">
              Your store will be listed in this square's directory and your products will appear in the community feed after approval.
            </p>

            <button
              class="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
              :class="joining ? 'bg-amber-400 cursor-wait' : 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/25'"
              :disabled="joining"
              @click="applyToJoin"
            >
              <Icon v-if="joining" name="mdi:loading" size="16" class="mr-1.5 inline animate-spin" />
              {{ joining ? 'Submitting…' : 'Apply to join' }}
            </button>

            <p class="mt-3 text-center text-xs text-gray-400 dark:text-neutral-500">
              By applying you agree to abide by this square's community standards.
            </p>
          </template>
        </div>
      </template>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const profileStore = useProfileStore()
const sellerStore = useSellerStore()

// Redirect unauthenticated users
if (!profileStore.isLoggedIn) {
  await navigateTo(`/user-login?redirect=/squares/${slug.value}/join`)
}

// Fetch square
const { data: squareData, pending } = await useFetch(() => `/api/squares/${slug.value}`)
const square = computed(() => (squareData.value as any)?.data)
const accent = computed(() => square.value?.accentColor || '#f59e0b')

useSeoMeta({
  title: computed(() => square.value ? `Join ${square.value.name} | MarketX` : 'Join Square | MarketX'),
})

const hasSeller = computed(() => sellerStore.hasSellers)

// Apply state
const joining = ref(false)
const applied = ref(false)
const apiError = ref<string | null>(null)

const applyToJoin = async () => {
  if (joining.value || !square.value) return
  joining.value = true
  apiError.value = null
  try {
    await $fetch(`/api/squares/${square.value.slug}/join`, { method: 'POST' })
    applied.value = true
  } catch (e: any) {
    apiError.value = e?.data?.statusMessage ?? e?.message ?? 'Something went wrong. Please try again.'
  } finally {
    joining.value = false
  }
}
</script>
