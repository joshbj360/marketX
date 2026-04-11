<template>
  <Teleport to="body">
    <Transition name="slide-left">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/20 md:hidden"
          @click="$emit('close')"
        />

        <!-- Panel -->
        <div
          ref="panelEl"
          class="relative ml-auto flex h-full w-full flex-col border-l border-gray-200 bg-white md:w-96 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3.5 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2">
              <button
                class="-ml-1.5 rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                @click="$emit('close')"
              >
                <Icon name="mdi:arrow-left" size="22" />
              </button>
              <h2
                class="text-base font-semibold text-gray-900 dark:text-neutral-100"
              >
                Notifications
              </h2>
              <span
                v-if="unreadCount > 0"
                class="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                >{{ unreadCount }}</span
              >
            </div>
            <button
              v-if="unreadCount > 0"
              class="text-sm font-semibold text-brand transition-opacity hover:opacity-75"
              @click="handleMarkAllRead"
            >
              Mark all read
            </button>
          </div>

          <!-- List -->
          <div class="flex-1 overflow-y-auto">
            <!-- Skeleton -->
            <div
              v-if="isLoading && !notifications.length"
              class="space-y-4 p-4"
            >
              <div v-for="i in 6" :key="i" class="flex animate-pulse gap-3">
                <div
                  class="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-neutral-800"
                />
                <div class="flex-1 space-y-2 pt-1">
                  <div
                    class="h-3 w-4/5 rounded bg-gray-200 dark:bg-neutral-800"
                  />
                  <div
                    class="h-2.5 w-1/3 rounded bg-gray-200 dark:bg-neutral-800"
                  />
                </div>
              </div>
            </div>

            <!-- Items -->
            <template v-else-if="notifications.length > 0">
              <button
                v-for="notif in notifications"
                :key="notif.id"
                class="flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:border-neutral-800/50 dark:hover:bg-neutral-900"
                :class="{ 'bg-brand/5 dark:bg-brand/10': !notif.read }"
                @click="handleNotifClick(notif)"
              >
                <!-- Avatar -->
                <div class="relative shrink-0">
                  <img
                    v-if="notif.actor?.avatar"
                    :src="imgAvatar(notif.actor.avatar)"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-brand"
                  >
                    <Icon
                      :name="typeIcon(notif.type)"
                      size="18"
                      class="text-white"
                    />
                  </div>
                  <span
                    class="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 dark:bg-neutral-950 dark:ring-neutral-800"
                  >
                    <Icon
                      :name="typeIcon(notif.type)"
                      size="11"
                      class="text-brand"
                    />
                  </span>
                </div>

                <!-- Text -->
                <div class="min-w-0 flex-1">
                  <p
                    class="text-sm leading-snug text-gray-900 dark:text-neutral-100"
                    :class="{ 'font-semibold': !notif.read }"
                  >
                    {{ notif.message }}
                  </p>
                  <p
                    class="mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500"
                  >
                    {{ timeAgo(notif.created_at) }}
                  </p>
                </div>

                <!-- Unread dot -->
                <span
                  v-if="!notif.read"
                  class="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand"
                />
              </button>

              <!-- Load more -->
              <div v-if="hasMore" class="p-4 text-center">
                <button
                  :disabled="isLoading"
                  class="text-sm font-medium text-brand hover:underline disabled:opacity-50"
                  @click="loadMore"
                >
                  {{ isLoading ? 'Loading…' : 'Load more' }}
                </button>
              </div>
            </template>

            <!-- Empty -->
            <div
              v-else
              class="flex h-full flex-col items-center justify-center px-6 py-20 text-center"
            >
              <div
                class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <Icon
                  name="mdi:bell-outline"
                  size="32"
                  class="text-gray-400 dark:text-neutral-500"
                />
              </div>
              <p class="font-medium text-gray-900 dark:text-neutral-100">
                All caught up!
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                New activity will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '~~/layers/profile/app/stores/notification.store'
import { useNotificationApi } from '~~/layers/profile/app/services/notification.api'
import { imgAvatar } from '~~/layers/core/app/utils/cloudinary'
import type { INotification } from '~~/layers/profile/app/types/profile.types'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const panelEl = ref<HTMLElement | null>(null)
const router = useRouter()

onClickOutside(panelEl, () => {
  if (props.isOpen) emit('close')
})

const api = useNotificationApi()
const store = useNotificationStore()

const isLoading = ref(false)
const offset = ref(0)
const total = ref(0)
const LIMIT = 20

const notifications = computed(() => store.notifications)
const unreadCount = computed(() => store.unreadCount)
const hasMore = computed(() => notifications.value.length < total.value)

const load = async (reset = false) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    if (reset) {
      store.clearNotifications()
      offset.value = 0
    }
    // Server returns { success, data: { notifications: [], total } }
    const res = (await api.getNotifications(
      LIMIT,
      offset.value,
    )) as unknown as {
      data: { notifications: INotification[]; total: number }
    }
    const items = res?.data?.notifications ?? []
    total.value = res?.data?.total ?? 0
    if (reset) {
      store.setNotifications(items)
    } else {
      items.forEach((n) => store.addNotification(n))
    }
    offset.value += items.length
  } catch {
    /* non-fatal */
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => load(false)

/** Map notification type → destination URL, or null if no navigation */
const getRoute = (notif: INotification): string | null => {
  switch (notif.type) {
    case 'NEW_FOLLOWER':
      return notif.actor?.username ? `/profile/${notif.actor.username}` : null

    // Post interactions — navigate to the actor's profile since there's no /post/[id] page yet
    case 'POST_LIKE':
    case 'NEW_COMMENT':
    case 'REPLY':
    case 'COMMENT_LIKE':
    case 'NEW_POST':
      return notif.actor?.username ? `/profile/${notif.actor.username}` : null

    // Message notifications (MESSAGE type maps to GENERAL in DB)
    case 'GENERAL':
      return notif.conversation?.id
        ? `/messages/${notif.conversation.id}`
        : '/messages'

    case 'ORDER':
      return notif.orderId ? `/buyer/orders/${notif.orderId}` : null

    case 'PRODUCT':
    case 'PRODUCT_SHARE':
    case 'REVIEW':
      return notif.product?.slug ? `/product/${notif.product.slug}` : null

    default:
      // Fallback: go to actor profile if we have one
      return notif.actor?.username ? `/profile/${notif.actor.username}` : null
  }
}

const handleNotifClick = async (notif: INotification) => {
  // Mark as read
  if (!notif.read) {
    try {
      await api.markAsRead(notif.id)
      store.markAsRead(notif.id)
    } catch {
      /* silent */
    }
  }

  // Navigate
  const route = getRoute(notif)
  if (route) {
    emit('close')
    router.push(route)
  }
}

const handleMarkAllRead = async () => {
  try {
    await api.markAllAsRead()
    store.setNotifications(
      notifications.value.map((n) => ({ ...n, read: true })),
    )
  } catch {
    /* silent */
  }
}

const typeIcon = (type: string) =>
  ({
    POST_LIKE: 'mdi:heart',
    NEW_COMMENT: 'mdi:comment-outline',
    REPLY: 'mdi:comment-text-outline',
    NEW_FOLLOWER: 'mdi:account-plus-outline',
    COMMENT_LIKE: 'mdi:heart-outline',
    ORDER: 'mdi:package-variant-closed',
    GENERAL: 'mdi:bell-outline',
    NEW_POST: 'mdi:image-outline',
    PRODUCT_SHARE: 'mdi:share-outline',
    REVIEW: 'mdi:star-outline',
    PRODUCT: 'mdi:tag-outline',
  })[type] ?? 'mdi:bell-outline'

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'Just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(dateStr).toLocaleDateString()
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) load(true)
  },
)
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: opacity 0.2s ease;
}
.slide-left-enter-active > div:last-child,
.slide-left-leave-active > div:last-child {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from > div:last-child,
.slide-left-leave-to > div:last-child {
  transform: translateX(100%);
}
.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
}
</style>
