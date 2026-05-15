<template>
  <div class="mt-5">
    <div
      v-if="squaresLoading && !squares.length"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
      />
    </div>

    <div
      v-else-if="!squaresLoading && !squares.length"
      class="py-24 text-center"
    >
      <Icon
        name="mdi:store-marker-outline"
        size="48"
        class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
      />
      <p class="text-sm text-gray-500 dark:text-neutral-400">
        No squares found{{ props.searchInput ? ` for "${props.searchInput}"` : '' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="sq in squares"
        :key="sq.id"
        :to="`/squares/${sq.slug}`"
        class="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-amber-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-amber-500/30"
      >
        <div class="relative h-24 overflow-hidden">
          <img
            v-if="sq.bannerUrl"
            :src="sq.bannerUrl"
            :alt="sq.name"
            class="h-full w-full object-cover opacity-80"
          />
          <div
            v-else
            class="h-full w-full"
            :style="`background: linear-gradient(135deg, ${sq.accentColor || '#f59e0b'}33, ${sq.accentColor || '#f59e0b'}11)`"
          />
          <span
            class="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm"
          >
            {{ sq.type === 'GEOGRAPHIC' ? '📍 Location' : '🏷️ Category' }}
          </span>
        </div>

        <div class="relative -mt-5 px-4 pb-4">
          <div
            class="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-neutral-900 dark:bg-neutral-900"
            :style="`border-color: ${sq.accentColor || '#f59e0b'}44`"
          >
            <img
              v-if="sq.iconUrl"
              :src="sq.iconUrl"
              :alt="sq.name"
              class="h-full w-full rounded-xl object-cover"
            />
            <span
              v-else
              class="text-sm font-black"
              :style="`color: ${sq.accentColor || '#f59e0b'}`"
            >
              {{ sq.name.slice(0, 2).toUpperCase() }}
            </span>
          </div>

          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p
                class="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-amber-600 dark:text-neutral-100 dark:group-hover:text-amber-400"
              >
                {{ sq.name }}
              </p>
              <p
                v-if="sq.city || sq.state"
                class="mt-0.5 truncate text-[11px] text-gray-400 dark:text-neutral-500"
              >
                📍 {{ [sq.city, sq.state].filter(Boolean).join(', ') }}
              </p>
              <div
                class="mt-1 flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400"
              >
                <span>{{ formatNum(sq.memberCount || 0) }} sellers</span>
                <span class="text-gray-300 dark:text-neutral-600">·</span>
                <span>{{ formatNum(sq.followerCount || 0) }} followers</span>
              </div>
            </div>

            <button
              class="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-all"
              :class="
                squareFollowing.has(sq.id)
                  ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-700/50'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              "
              :disabled="squareFollowLoading.has(sq.id)"
              @click.prevent="toggleFollow(sq)"
            >
              <Icon
                v-if="squareFollowLoading.has(sq.id)"
                name="eos-icons:loading"
                size="12"
                class="inline"
              />
              <span v-else>{{
                squareFollowing.has(sq.id) ? 'Following' : 'Follow'
              }}</span>
            </button>
          </div>

          <p
            v-if="sq.description"
            class="mt-2 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400"
          >
            {{ sq.description }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <div ref="squareTrigger" class="mt-6 h-10" />
    <div
      v-if="squaresLoading && squares.length"
      class="flex justify-center py-8"
    >
      <Icon name="eos-icons:loading" size="24" class="text-amber-500" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDiscoverFilters } from '~~/layers/commerce/app/composables/useDiscoverFilters'

const props = defineProps<{
  searchInput: string
}>()

const { filters: discoverFilters } = useDiscoverFilters()

const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const squares = ref<any[]>([])
const squaresTotal = ref(0)
const squaresLoading = ref(false)
const squareTrigger = ref<HTMLElement | null>(null)
const squareFollowing = ref<Set<string>>(new Set())
const squareFollowLoading = ref<Set<string>>(new Set())
let squaresGen = 0

const squaresHasMore = computed(() => squares.value.length < squaresTotal.value)

const loadData = async (reset = false) => {
  if (reset) {
    squares.value = []
    squaresTotal.value = 0
    squaresGen++
    squaresLoading.value = false
  }
  if (squaresLoading.value) return
  squaresLoading.value = true
  const gen = squaresGen
  try {
    const res = await $fetch<any>('/api/squares', {
      params: {
        limit: 20,
        offset: squares.value.length,
        search: props.searchInput.trim() || undefined,
        minMembers: discoverFilters.squares.minMembers ?? undefined,
      },
    })
    if (gen !== squaresGen) return
    squares.value.push(...(res?.data ?? []))
    squaresTotal.value = res?.meta?.total ?? squares.value.length
  } catch {
    //
  } finally {
    if (gen === squaresGen) squaresLoading.value = false
  }
}

const toggleFollow = async (square: any) => {
  if (squareFollowLoading.value.has(square.id)) return
  squareFollowLoading.value = new Set([...squareFollowLoading.value, square.id])
  const isFollowing = squareFollowing.value.has(square.id)
  try {
    if (isFollowing) {
      await $fetch(`/api/squares/${square.slug}/follow`, { method: 'DELETE' })
      const next = new Set(squareFollowing.value)
      next.delete(square.id)
      squareFollowing.value = next
      square.followerCount = Math.max(0, (square.followerCount ?? 0) - 1)
    } else {
      await $fetch(`/api/squares/${square.slug}/follow`, { method: 'POST' })
      squareFollowing.value = new Set([...squareFollowing.value, square.id])
      square.followerCount = (square.followerCount ?? 0) + 1
    }
  } catch {
    //
  } finally {
    const next = new Set(squareFollowLoading.value)
    next.delete(square.id)
    squareFollowLoading.value = next
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.searchInput,
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => loadData(true), 350)
  },
)

watch(
  () => discoverFilters.squares.minMembers,
  () => loadData(true),
)

onMounted(() => {
  loadData()

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && squaresHasMore.value) loadData()
    },
    { rootMargin: '400px' },
  )

  watch(
    squareTrigger,
    (el) => {
      if (el) observer.observe(el)
    },
    { immediate: true },
  )

  onUnmounted(() => observer.disconnect())
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
