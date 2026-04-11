<template>
  <Teleport to="body">
    <div
      v-if="post"
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div
        class="relative w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-xl dark:bg-neutral-900"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-neutral-800"
        >
          <button
            @click="$emit('close')"
            class="rounded-full p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-neutral-200"
          >
            <Icon name="mdi:close" size="20" />
          </button>
          <h2
            class="text-[15px] font-semibold text-gray-900 dark:text-neutral-100"
          >
            Edit Post
          </h2>
          <button
            @click="handleSave"
            :disabled="isSaving || !isDirty"
            class="text-[14px] font-semibold text-brand transition-opacity disabled:opacity-40"
          >
            {{ isSaving ? 'Saving…' : 'Save' }}
          </button>
        </div>

        <!-- Body -->
        <div class="space-y-4 p-4">
          <!-- Caption / content -->
          <textarea
            v-model="editedContent"
            placeholder="What's on your mind?"
            rows="5"
            class="w-full resize-none rounded-lg bg-gray-50 px-3 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
          />

          <!-- Visibility -->
          <div>
            <label
              class="mb-1.5 block text-[12px] font-medium text-gray-500 dark:text-neutral-400"
              >Who can see this?</label
            >
            <select
              v-model="editedVisibility"
              class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="PUBLIC">Everyone</option>
              <option value="FOLLOWERS">Followers only</option>
              <option value="PRIVATE">Only me</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePost } from '../../composables/usePost'
import { notify } from '@kyvg/vue3-notification'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const props = defineProps<{ post: IFeedItem | null }>()
const emit = defineEmits(['close', 'updated'])

const { updatePost } = usePost()

const editedContent = ref('')
const editedVisibility = ref<'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'>('PUBLIC')
const isSaving = ref(false)

// Populate fields when post changes
watch(
  () => props.post,
  (p) => {
    if (p) {
      editedContent.value = p.caption || p.content || ''
      editedVisibility.value = (p as any).visibility ?? 'PUBLIC'
    }
  },
  { immediate: true },
)

const isDirty = computed(() => {
  if (!props.post) return false
  const original = props.post.caption || props.post.content || ''
  const originalVisibility = (props.post as any).visibility ?? 'PUBLIC'
  return (
    editedContent.value !== original ||
    editedVisibility.value !== originalVisibility
  )
})

const handleSave = async () => {
  if (!props.post || !isDirty.value || isSaving.value) return
  isSaving.value = true
  try {
    await updatePost(props.post.id, {
      caption: editedContent.value,
      visibility: editedVisibility.value,
    })
    notify({ type: 'success', text: 'Post updated' })
    emit('updated', {
      caption: editedContent.value,
      visibility: editedVisibility.value,
    })
    emit('close')
  } catch {
    notify({ type: 'error', text: 'Failed to update post' })
  } finally {
    isSaving.value = false
  }
}
</script>
