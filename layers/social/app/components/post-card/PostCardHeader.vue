<template>
  <div class="flex items-center justify-between px-3 py-2.5">
    <div class="flex min-w-0 items-center gap-2">
      <NuxtLink :to="`/profile/${post.author?.username}`" class="shrink-0">
        <Avatar
          :username="post.author?.username ?? 'User'"
          :avatar="post.author?.avatar ?? ''"
          size="sm"
        />
      </NuxtLink>
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-1.5">
          <NuxtLink
            :to="`/profile/${post.author?.username}`"
            class="text-[13px] font-semibold leading-tight text-gray-900 transition-opacity hover:opacity-75 dark:text-neutral-100"
          >
            {{ post.author?.username }}
          </NuxtLink>
          <!-- Content type badge -->
          <span
            class="inline-flex select-none items-center gap-0.5 rounded-full px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-widest"
            :class="badgeClass"
          >
            <Icon :name="badgeIcon" size="9" />
            {{ contentTypeLabel }}
          </span>
          <!-- Follow button (only on others' posts) -->
          <template
            v-if="
              profileStore.userId &&
              post.author &&
              profileStore.userId !== post.author.id
            "
          >
            <span
              class="select-none text-xs text-gray-300 dark:text-neutral-600"
              >·</span
            >
            <FollowButton
              :user-id="post.author.id"
              :username="post.author?.username"
            />
          </template>
        </div>
      </div>
    </div>
    <!-- ─── Owner actions menu ──────────────────────────────── -->
    <div v-if="isOwner" class="relative ml-1 shrink-0">
      <button
        @click.stop="menuOpen = !menuOpen"
        class="rounded-full p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
      >
        <Icon name="mdi:dots-horizontal" size="20" />
      </button>
      <div
        v-if="menuOpen"
        class="absolute right-0 top-8 z-20 min-w-[140px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
        @click.stop
      >
        <button
          @click="onEdit"
          class="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-gray-700 transition-colors hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <Icon name="mdi:pencil-outline" size="16" />
          {{ $t('post.editPost') }}
        </button>
        <button
          @click="onDelete"
          class="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Icon name="mdi:delete-outline" size="16" />
          {{ $t('post.deletePost') }}
        </button>
      </div>
    </div>
    <button
      v-else
      class="ml-1 shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
    >
      <Icon name="mdi:dots-horizontal" size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FollowButton from '~~/layers/profile/app/components/FollowButton.vue'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const props = defineProps<{
  post: IFeedItem
  isOwner: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const profileStore = useProfileStore()

const menuOpen = ref(false)

const onEdit = () => {
  menuOpen.value = false
  emit('edit')
}

const onDelete = () => {
  menuOpen.value = false
  emit('delete')
}

const closeMenu = () => {
  menuOpen.value = false
}
onMounted(() => document.addEventListener('click', closeMenu))
onUnmounted(() => document.removeEventListener('click', closeMenu))

// ─── Content type system ──────────────────────────────────────────────────────
const { t } = useI18n()

const CONTENT_TYPE_MAP: Record<string, { icon: string; accent: string; badge: string }> = {
  EXPERIENCE: {
    icon: 'mdi:star-outline',
    accent: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  INSPIRATION: {
    icon: 'mdi:lightbulb-outline',
    accent: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  COMMERCE: {
    icon: 'mdi:shopping-outline',
    accent: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  EDUCATIONAL: {
    icon: 'mdi:school-outline',
    accent: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  },
  ENTERTAINMENT: {
    icon: 'mdi:music-note',
    accent: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  },
}

const contentTypeDef = computed(
  () =>
    CONTENT_TYPE_MAP[props.post.contentType] ?? {
      icon: 'mdi:tag-outline',
      accent: 'bg-gray-300 dark:bg-neutral-700',
      badge: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
    },
)

const contentTypeLabel = computed(() =>
  t(`contentType.${props.post.contentType}`, props.post.contentType),
)
const badgeIcon = computed(() => contentTypeDef.value.icon)
const badgeClass = computed(() => contentTypeDef.value.badge)
</script>
