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
          <h2 class="text-[15px] font-semibold text-gray-900 dark:text-neutral-100">
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
        <div class="max-h-[75vh] overflow-y-auto">
          <div class="space-y-4 p-4">

            <!-- ── Media strip ── -->
            <div v-if="hasAnyMedia">
              <p class="mb-2 text-[12px] font-medium text-gray-500 dark:text-neutral-400">
                Media
              </p>
              <div class="flex gap-2 overflow-x-auto pb-1">
                <!-- Existing media -->
                <div
                  v-for="m in keepMedia"
                  :key="m.id"
                  class="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <img
                    v-if="m.type === 'VIDEO'"
                    :src="videoThumb(m.url)"
                    class="h-full w-full object-cover"
                  />
                  <img
                    v-else
                    :src="m.url"
                    class="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    @click="removeExisting(m.id)"
                    class="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <Icon name="mdi:close" size="11" />
                  </button>
                </div>

                <!-- New (pending upload) media -->
                <div
                  v-for="(item, i) in newMedia"
                  :key="'new-' + i"
                  class="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <img :src="item.preview" class="h-full w-full object-cover" />
                  <!-- Upload progress ring -->
                  <div
                    v-if="item.uploading"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" class="-rotate-90">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" />
                      <circle
                        cx="16" cy="16" r="12" fill="none" stroke="#F43F5E" stroke-width="2.5"
                        stroke-linecap="round"
                        :stroke-dasharray="`${2 * Math.PI * 12}`"
                        :stroke-dashoffset="`${2 * Math.PI * 12 * (1 - item.progress / 100)}`"
                        style="transition: stroke-dashoffset 0.15s ease"
                      />
                    </svg>
                    <span class="text-[10px] font-bold text-white">{{ item.progress }}%</span>
                  </div>
                  <!-- Remove button (only when not uploading) -->
                  <button
                    v-else
                    type="button"
                    @click="removeNew(i)"
                    class="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <Icon name="mdi:close" size="11" />
                  </button>
                </div>

                <!-- Add button -->
                <label
                  v-if="keepMedia.length + newMedia.length < 10"
                  class="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-600"
                >
                  <Icon name="mdi:image-plus" size="20" class="text-gray-400 dark:text-neutral-500" />
                  <span class="text-[10px] text-gray-400 dark:text-neutral-500">Add</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    class="hidden"
                    @change="onFilesSelected"
                  />
                </label>
              </div>

              <!-- Upload error -->
              <p v-if="uploadError" class="mt-1.5 text-[11px] text-red-500">
                {{ uploadError }}
              </p>
            </div>

            <!-- Caption / content -->
            <textarea
              v-model="editedContent"
              placeholder="What's on your mind?"
              rows="5"
              class="w-full resize-none rounded-lg bg-gray-50 px-3 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
            />

            <!-- Visibility -->
            <div>
              <label class="mb-1.5 block text-[12px] font-medium text-gray-500 dark:text-neutral-400">
                Who can see this?
              </label>
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
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { usePost } from '../../composables/usePost'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { videoThumb } from '~~/layers/core/app/utils/cloudinary'
import { notify } from '@kyvg/vue3-notification'
import type { IFeedItem } from '~~/layers/feed/app/types/feed.types'

const props = defineProps<{ post: IFeedItem | null }>()
const emit = defineEmits<{
  close: []
  updated: [payload: { caption: string; visibility: string; media?: any[] }]
}>()

const { updatePost } = usePost()
const { uploadMedia, uploadError } = useMediaUpload()

// ── state ─────────────────────────────────────────────────────────────────────
const editedContent = ref('')
const editedVisibility = ref<'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'>('PUBLIC')
const isSaving = ref(false)

// Existing media IDs we want to keep (start with all, remove when user clicks ×)
const keepMedia = ref<Array<{ id: string; url: string; type: string }>>([])
// IDs the user removed from existing media
const removedIds = ref<string[]>([])

interface NewMediaItem {
  preview: string
  file: File
  uploading: boolean
  progress: number
  result: { url: string; public_id: string; type: string } | null
}
const newMedia = ref<NewMediaItem[]>([])

// ── helpers ───────────────────────────────────────────────────────────────────
const hasAnyMedia = computed(
  () => keepMedia.value.length > 0 || newMedia.value.length > 0 || (props.post?.mediaItems?.length ?? 0) > 0,
)

// ── populate on open ──────────────────────────────────────────────────────────
watch(
  () => props.post,
  (p) => {
    if (!p) return
    editedContent.value = p.caption || (p as any).content || ''
    editedVisibility.value = (p as any).visibility ?? 'PUBLIC'

    const items: Array<{ id: string; url: string; type: string }> = []
    if (p.mediaItems?.length) {
      p.mediaItems.forEach((m: any) => items.push({ id: m.id, url: m.url, type: m.type ?? 'IMAGE' }))
    } else if (Array.isArray((p as any).media)) {
      ;(p as any).media.forEach((m: any) => items.push({ id: m.id, url: m.url, type: m.type ?? 'IMAGE' }))
    }
    keepMedia.value = items
    removedIds.value = []
    newMedia.value = []
  },
  { immediate: true },
)

// ── dirty check ───────────────────────────────────────────────────────────────
const isDirty = computed(() => {
  if (!props.post) return false
  const origContent = props.post.caption || (props.post as any).content || ''
  const origVisibility = (props.post as any).visibility ?? 'PUBLIC'
  if (editedContent.value !== origContent) return true
  if (editedVisibility.value !== origVisibility) return true
  if (removedIds.value.length > 0) return true
  if (newMedia.value.some((m) => m.result !== null)) return true
  return false
})

const anyUploading = computed(() => newMedia.value.some((m) => m.uploading))

// ── media actions ─────────────────────────────────────────────────────────────
const removeExisting = (id: string) => {
  keepMedia.value = keepMedia.value.filter((m) => m.id !== id)
  removedIds.value.push(id)
}

const removeNew = (i: number) => {
  newMedia.value.splice(i, 1)
}

const onFilesSelected = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  ;(e.target as HTMLInputElement).value = ''

  for (const file of files) {
    if (keepMedia.value.length + newMedia.value.length >= 10) break
    const preview = URL.createObjectURL(file)
    newMedia.value.push({ preview, file, uploading: true, progress: 0, result: null })
    const idx = newMedia.value.length - 1

    try {
      const res = await uploadMedia(file, (pct) => {
        if (newMedia.value[idx]) newMedia.value[idx].progress = pct
      })
      if (newMedia.value[idx]) {
        newMedia.value[idx].result = { url: res.url, public_id: res.public_id, type: res.type }
        newMedia.value[idx].uploading = false
      }
    } catch {
      newMedia.value.splice(idx, 1)
    }
  }
}

// ── save ──────────────────────────────────────────────────────────────────────
const handleSave = async () => {
  if (!props.post || !isDirty.value || isSaving.value || anyUploading.value) return
  isSaving.value = true

  try {
    const mediaToAdd = newMedia.value
      .filter((m) => m.result)
      .map((m) => m.result!)

    await updatePost(props.post.id, {
      caption: editedContent.value,
      visibility: editedVisibility.value,
      mediaToAdd: mediaToAdd.length ? mediaToAdd : undefined,
      mediaToRemove: removedIds.value.length ? removedIds.value : undefined,
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
