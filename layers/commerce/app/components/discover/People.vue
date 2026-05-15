<template>
  <div class="mt-5">
    <div v-if="!props.searchInput" class="py-16 text-center">
      <Icon
        name="mdi:account-search-outline"
        size="56"
        class="mx-auto mb-3 text-gray-300 dark:text-neutral-600"
      />
      <p class="text-sm font-medium text-gray-500 dark:text-neutral-400">
        Search by username or name
      </p>
      <p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        Type something in the search bar above
      </p>
    </div>

    <div v-else-if="peopleLoading" class="space-y-3 pt-2">
      <div
        v-for="n in 5"
        :key="n"
        class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-neutral-900"
      >
        <div
          class="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-700"
        />
        <div class="flex-1 space-y-1.5">
          <div
            class="h-3.5 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-neutral-700"
          />
          <div
            class="h-3 w-20 animate-pulse rounded-md bg-gray-100 dark:bg-neutral-800"
          />
        </div>
      </div>
    </div>

    <div
      v-else-if="props.searchInput && !people.length"
      class="py-16 text-center"
    >
      <p class="text-sm text-gray-500 dark:text-neutral-400">
        No users found for "{{ props.searchInput }}"
      </p>
    </div>

    <div v-else-if="people.length" class="space-y-1 pt-1">
      <NuxtLink
        v-for="user in people"
        :key="user.id"
        :to="`/profile/${user.username}`"
        class="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900"
      >
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
        >
          <img
            v-if="user.avatar"
            :src="user.avatar"
            :alt="user.username"
            class="h-full w-full object-cover"
          />
          <Icon
            v-else
            name="mdi:account"
            size="22"
            class="text-gray-400 dark:text-neutral-500"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100"
          >
            {{ user.full_name || user.username }}
          </p>
          <p class="truncate text-xs text-gray-500 dark:text-neutral-400">
            @{{ user.username }}
          </p>
        </div>
        <Icon
          name="mdi:chevron-right"
          size="18"
          class="shrink-0 text-gray-300 dark:text-neutral-600"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  searchInput: string
}>()

const people = ref<any[]>([])
const peopleLoading = ref(false)

const searchPeople = async (q: string) => {
  if (!q || q.trim().length < 1) {
    people.value = []
    return
  }
  peopleLoading.value = true
  try {
    const res = await $fetch<any>('/api/search', {
      params: { q: q.replace(/^@/, '').trim(), type: 'users', limit: 20 },
    })
    people.value = res?.data?.users ?? []
  } catch {
    people.value = []
  } finally {
    peopleLoading.value = false
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.searchInput,
  (val) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => searchPeople(val), 350)
  },
)

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
