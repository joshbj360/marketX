<template>
  <NuxtLink
    :to="`/squares/${square.slug}`"
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-amber-200/60 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-amber-700/30"
  >
    <!-- Banner -->
    <div class="relative h-24 overflow-hidden">
      <img
        v-if="square.bannerUrl"
        :src="square.bannerUrl"
        :alt="square.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="h-full w-full transition-transform duration-500 group-hover:scale-105"
        :style="`background: linear-gradient(135deg, ${accent}33, ${accent}11)`"
      />

      <!-- Type badge -->
      <span
        class="absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
      >
        {{ square.type === 'GEOGRAPHIC' ? '📍' : '🏷️' }}
        {{ square.type === 'GEOGRAPHIC' ? 'Location' : 'Category' }}
      </span>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col gap-2 p-3.5">
      <div class="flex items-start gap-2.5">
        <!-- Icon -->
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-neutral-900 dark:bg-neutral-900"
          :style="`border-color: ${accent}55`"
        >
          <img
            v-if="square.iconUrl"
            :src="square.iconUrl"
            :alt="square.name"
            class="h-full w-full rounded-lg object-cover"
          />
          <span v-else class="text-sm font-black" :style="`color: ${accent}`">
            {{ square.name.slice(0, 2).toUpperCase() }}
          </span>
        </div>

        <!-- Name + location -->
        <div class="min-w-0 flex-1 pt-0.5">
          <p class="truncate text-sm font-bold text-gray-900 dark:text-white">
            {{ square.name }}
          </p>
          <p
            v-if="square.city || square.state"
            class="truncate text-[11px] text-gray-400 dark:text-neutral-500"
          >
            {{ [square.city, square.state].filter(Boolean).join(', ') }}
          </p>
        </div>
      </div>

      <!-- Description -->
      <p
        v-if="square.description"
        class="line-clamp-2 text-[12px] leading-relaxed text-gray-500 dark:text-neutral-400"
      >
        {{ square.description }}
      </p>

      <!-- Stats + follow -->
      <div class="mt-auto flex items-center justify-between pt-1">
        <div class="flex items-center gap-3 text-[11px] text-gray-400 dark:text-neutral-500">
          <span class="flex items-center gap-1">
            <Icon name="mdi:store-outline" size="13" />
            {{ square.memberCount ?? 0 }} sellers
          </span>
          <span class="flex items-center gap-1">
            <Icon name="mdi:account-multiple-outline" size="13" />
            {{ square.followerCount ?? 0 }} following
          </span>
        </div>

        <button
          class="rounded-full px-3 py-1 text-[11px] font-bold transition-all"
          :class="
            following
              ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-700/40'
              : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-400/30'
          "
          :disabled="followLoading"
          @click.prevent="$emit('toggle-follow')"
        >
          <Icon v-if="followLoading" name="mdi:loading" size="12" class="animate-spin" />
          <template v-else>{{ following ? 'Following' : 'Follow' }}</template>
        </button>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  square: {
    id: string
    name: string
    slug: string
    description?: string | null
    bannerUrl?: string | null
    iconUrl?: string | null
    accentColor?: string | null
    city?: string | null
    state?: string | null
    type: 'GEOGRAPHIC' | 'CATEGORY'
    memberCount?: number
    followerCount?: number
  }
  following?: boolean
  followLoading?: boolean
}>()

defineEmits<{
  (e: 'toggle-follow'): void
}>()

const accent = computed(() => props.square.accentColor || '#f59e0b')
</script>
