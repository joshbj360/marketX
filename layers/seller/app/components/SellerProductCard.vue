<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
  >
    <!-- Image -->
    <div class="relative aspect-square bg-gray-100 dark:bg-neutral-700">
      <img
        v-if="product.media?.[0]?.url"
        :src="imgThumb(product.media[0].url)"
        :alt="product.title"
        loading="lazy"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <Icon
          name="mdi:image-off-outline"
          size="40"
          class="text-gray-300 dark:text-neutral-600"
        />
      </div>

      <!-- Status badge -->
      <span
        :class="[
          'absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold',
          product.status === 'PUBLISHED'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : product.status === 'DRAFT'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
              : 'bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-400',
        ]"
      >
        {{ product.status }}
      </span>
    </div>

    <!-- Info -->
    <div class="p-3">
      <p
        class="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100"
      >
        {{ product.title }}
      </p>
      <p class="mt-1 font-bold text-brand">
        {{ formatPrice(product.price) }}
      </p>
      <p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {{ product._count?.variants ?? product.variants?.length ?? 0 }}
        variant(s)
      </p>

      <!-- Tags -->
      <div v-if="product.tags?.length" class="mt-1.5 flex flex-wrap gap-1">
        <span
          v-for="t in product.tags.slice(0, 3)"
          :key="t.tag?.id ?? t.id"
          class="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-medium text-brand"
        >
          #{{ t.tag?.name ?? t.name }}
        </span>
        <span
          v-if="product.tags.length > 3"
          class="text-[9px] text-gray-400 dark:text-neutral-500"
        >
          +{{ product.tags.length - 3 }}
        </span>
      </div>

      <!-- Actions -->
      <div class="mt-3 flex gap-2">
        <NuxtLink
          :to="`/seller/${storeSlug}/products/${product.id}/edit`"
          class="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Edit
        </NuxtLink>
        <NuxtLink
          :to="`/seller/${storeSlug}/products/${product.id}/edit?tab=promote`"
          class="flex flex-1 items-center justify-center gap-1 rounded-lg border border-brand/40 py-1.5 text-center text-xs font-medium text-brand transition-colors hover:bg-brand/5"
        >
          <Icon name="mdi:rocket-launch-outline" size="12" />
          Promote
        </NuxtLink>
        <button
          @click="$emit('archive', product)"
          class="rounded-lg border border-red-200 px-2.5 py-1.5 text-center text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          title="Archive product"
        >
          <Icon name="mdi:archive-outline" size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { imgThumb } from '~~/layers/core/app/utils/cloudinary'
const { formatPrice } = useCurrency()

defineProps<{
  product: any
  storeSlug: string
}>()

defineEmits<{
  archive: [product: any]
}>()
</script>
