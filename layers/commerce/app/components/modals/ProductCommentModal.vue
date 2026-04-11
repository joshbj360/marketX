<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div
        class="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white sm:rounded-xl dark:bg-neutral-900"
      >
        <!-- Header -->
        <div
          class="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-neutral-800"
        >
          <h3 class="text-[15px] font-bold text-gray-900 dark:text-neutral-100">
            Comments
          </h3>
          <button
            @click="$emit('close')"
            class="rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <Icon
              name="mdi:close"
              size="20"
              class="text-gray-500 dark:text-neutral-400"
            />
          </button>
        </div>

        <!-- Comment list -->
        <div class="flex-1 space-y-4 overflow-y-auto px-5 py-3">
          <div
            v-if="isLoading && !comments.length"
            class="flex justify-center py-8"
          >
            <Icon
              name="eos-icons:loading"
              size="28"
              class="animate-spin text-brand"
            />
          </div>

          <div
            v-else-if="!comments.length"
            class="flex flex-col items-center justify-center gap-2 py-10 text-gray-400 dark:text-neutral-500"
          >
            <Icon name="mdi:comment-outline" size="36" />
            <p class="text-sm">No comments yet. Be the first!</p>
          </div>

          <template v-else>
            <div v-for="c in comments" :key="c.id" class="flex gap-3">
              <img
                v-if="c.author?.avatar"
                :src="c.author.avatar"
                class="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
              />
              <div
                v-else
                class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <Icon name="mdi:account" size="16" class="text-gray-400" />
              </div>
              <div class="min-w-0 flex-1">
                <div
                  class="rounded-2xl bg-gray-50 px-3 py-2 dark:bg-neutral-800"
                >
                  <span
                    class="mr-1.5 text-[12px] font-bold text-gray-900 dark:text-neutral-100"
                    >{{ c.author?.username }}</span
                  >
                  <span
                    class="text-[13px] leading-relaxed text-gray-700 dark:text-neutral-300"
                    >{{ c.text }}</span
                  >
                </div>
                <div class="mt-1 flex items-center gap-3 pl-1">
                  <span
                    class="text-[11px] text-gray-400 dark:text-neutral-500"
                    >{{ timeAgo(c.created_at) }}</span
                  >
                  <span class="text-[11px] text-gray-400 dark:text-neutral-500"
                    >{{ c._count?.likes ?? 0 }} likes</span
                  >
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Input -->
        <ClientOnly>
          <div
            v-if="profileStore.isLoggedIn"
            class="shrink-0 border-t border-gray-100 px-4 py-3 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2">
              <input
                v-model="newComment"
                type="text"
                placeholder="Add a comment…"
                maxlength="500"
                @keydown.enter.prevent="submitComment"
                class="flex-1 rounded-full bg-gray-100 px-4 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmitting"
                class="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition-all hover:bg-[#d81b36] disabled:opacity-40"
              >
                <Icon
                  v-if="isSubmitting"
                  name="eos-icons:loading"
                  size="16"
                  class="animate-spin"
                />
                <Icon v-else name="mdi:send" size="16" />
              </button>
            </div>
          </div>
          <div
            v-else
            class="shrink-0 border-t border-gray-100 px-5 py-3 text-center dark:border-neutral-800"
          >
            <NuxtLink
              to="/login"
              @click="$emit('close')"
              class="text-[13px] font-semibold text-brand hover:underline"
            >
              Sign in to comment
            </NuxtLink>
          </div>
        </ClientOnly>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useProductApi } from '~~/layers/commerce/app/services/product.api'

const props = defineProps<{ isOpen: boolean; product: any }>()
defineEmits(['close'])

const profileStore = useProfileStore()
const api = useProductApi()
const comments = ref<any[]>([])
const newComment = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)

const loadComments = async () => {
  if (!props.product?.id) return
  isLoading.value = true
  try {
    const res: any = await api.getProductComments(props.product.id)
    comments.value = res?.data || []
  } finally {
    isLoading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || isSubmitting.value || !props.product?.id)
    return
  isSubmitting.value = true
  try {
    const res: any = await api.createProductComment(
      props.product.id,
      newComment.value.trim(),
    )
    if (res?.data) {
      comments.value.unshift(res.data)
      newComment.value = ''
    }
  } catch {
    // silent fail
  } finally {
    isSubmitting.value = false
  }
}

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

watch(
  () => [props.isOpen, props.product?.id],
  ([open]) => {
    if (open) loadComments()
    else comments.value = []
  },
)
</script>
