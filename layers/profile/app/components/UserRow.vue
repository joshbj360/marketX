<template>
  <button
    class="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
    :disabled="isCreating"
    @click="$emit('select')"
  >
    <Avatar
      :username="user.username ?? 'User'"
      :avatar="user.avatar ?? ''"
      size="lg"
    />
    <div class="min-w-0 flex-1">
      <p
        class="truncate text-sm font-semibold text-gray-900 dark:text-neutral-100"
      >
        {{ user.full_name || user.name || user.username }}
      </p>
      <p class="text-xs text-gray-500 dark:text-neutral-400">
        @{{ user.username }}
      </p>
    </div>
    <Icon
      v-if="isCreating"
      name="eos-icons:loading"
      size="18"
      class="shrink-0 text-brand"
    />
    <Icon
      v-else
      name="mdi:message-outline"
      size="18"
      class="shrink-0 text-gray-300 dark:text-neutral-600"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{ user: any; isCreating?: boolean }>()
defineEmits(['select'])
</script>
