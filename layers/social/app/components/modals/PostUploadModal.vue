<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        @click.self="handleClose()"
      >
        <div
          class="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl dark:bg-neutral-900"
        >
          <!-- ── Header ── -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-neutral-800"
          >
            <button
              @click="handleClose()"
              class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Icon
                name="mdi:arrow-left"
                size="22"
                class="text-gray-900 dark:text-neutral-100"
              />
            </button>
            <h2
              class="text-[15px] font-bold tracking-tight text-gray-900 dark:text-neutral-100"
            >
              {{ $t('upload.newPost') }}
            </h2>
            <button
              @click="handlePost"
              :disabled="!canPost || isPosting"
              class="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white transition-all hover:bg-[#c51230] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {{ isPosting ? $t('upload.sharing') : $t('upload.share') }}
            </button>
          </div>

          <!-- ── Scrollable body ── -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="isDragging ? 'ring-2 ring-inset ring-brand/40' : ''"
          >
            <!-- Author row -->
            <div class="flex items-center gap-3 px-4 pb-1 pt-3">
              <Avatar
                :username="profileStore?.me?.username ?? 'User'"
                :avatar="profileStore?.me?.avatar ?? ''"
                size="md"
              />
              <div>
                <p
                  class="text-[14px] font-semibold leading-tight text-gray-900 dark:text-neutral-100"
                >
                  {{ profileStore?.me?.username }}
                </p>
                <button
                  @click="showContentTypeSelector = true"
                  class="mt-0.5 flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-500 transition-colors hover:border-brand hover:text-brand dark:border-neutral-700 dark:text-neutral-400"
                >
                  <Icon name="mdi:label-outline" size="12" />
                  {{ contentTypeLabel }}
                  <Icon name="mdi:chevron-down" size="12" />
                </button>
              </div>
            </div>

            <!-- Caption textarea -->
            <div class="px-4 pb-2 pt-1">
              <textarea
                v-model="content"
                :placeholder="$t('upload.whatOnMind')"
                class="caption-input w-full resize-none bg-transparent p-0 text-[16px] leading-relaxed text-gray-900 placeholder-gray-400 focus:outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
                @input="extractHashtags"
              />
              <div
                v-if="hashtags.length > 0"
                class="mt-1 flex flex-wrap gap-1.5"
              >
                <span
                  v-for="tag in hashtags"
                  :key="tag"
                  class="text-[13px] font-medium text-brand"
                  >#{{ tag }}</span
                >
              </div>
            </div>

            <!-- ── Media previews (only when files are selected) ── -->
            <div v-if="mediaFiles.length > 0" class="px-4 pb-3">
              <div
                class="grid gap-1.5"
                :class="gridClass"
              >
                <div
                  v-for="(item, idx) in mediaFiles"
                  :key="idx"
                  class="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-800"
                >
                  <img
                    v-if="item.type === 'image'"
                    :src="item.preview"
                    class="h-full w-full object-cover"
                  />
                  <video
                    v-else-if="item.type === 'video'"
                    :src="item.preview"
                    class="h-full w-full object-cover"
                    muted
                    playsinline
                  />
                  <!-- Video indicator -->
                  <div
                    v-if="item.type === 'video'"
                    class="absolute left-1 top-1 rounded-full bg-black/50 p-1"
                  >
                    <Icon name="mdi:play-circle" size="14" class="text-white" />
                  </div>
                  <!-- Remove -->
                  <button
                    @click="removeMediaItem(idx)"
                    class="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Icon name="mdi:close" size="14" class="text-white" />
                  </button>
                  <!-- Upload progress -->
                  <div
                    v-if="item.uploading"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55"
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36" class="-rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" />
                      <circle
                        cx="18" cy="18" r="14" fill="none" stroke="#F43F5E" stroke-width="2.5"
                        stroke-linecap="round"
                        :stroke-dasharray="`${2 * Math.PI * 14}`"
                        :stroke-dashoffset="`${2 * Math.PI * 14 * (1 - (item.progress ?? 0) / 100)}`"
                        style="transition: stroke-dashoffset 0.15s ease"
                      />
                    </svg>
                    <span class="text-[10px] font-bold text-white">{{ item.progress ?? 0 }}%</span>
                  </div>
                  <!-- Upload error + retry -->
                  <div
                    v-else-if="item.uploadError"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60"
                  >
                    <Icon name="mdi:alert-circle" size="22" class="text-red-400" />
                    <button
                      @click.stop="retryUpload(item)"
                      class="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-white/30"
                    >
                      Retry
                    </button>
                  </div>
                  <!-- Upload done checkmark (fades out) -->
                  <Transition name="fade-check">
                    <div
                      v-if="item.uploaded && !item.uploading"
                      class="upload-done absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500/90"
                    >
                      <Icon name="mdi:check" size="12" class="text-white" />
                    </div>
                  </Transition>
                  <!-- Order number -->
                  <div
                    class="absolute bottom-1 left-1 flex h-5 w-5 select-none items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-white"
                  >
                    {{ idx + 1 }}
                  </div>
                </div>

                <!-- Add more slot -->
                <button
                  v-if="mediaFiles.length < 10"
                  @click="triggerFileInput"
                  class="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition-colors hover:border-brand hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <Icon
                    name="mdi:plus"
                    size="22"
                    class="text-gray-400 dark:text-neutral-500"
                  />
                  <span class="mt-0.5 text-[10px] text-gray-400">{{
                    $t('common.add')
                  }}</span>
                </button>
              </div>
            </div>

            <!-- ── Music chip (when selected) ── -->
            <div v-if="selectedMusic" class="px-4 pb-3">
              <div
                class="flex items-center gap-3 rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-2.5 dark:border-pink-900/30 dark:from-pink-950/20 dark:to-purple-950/20"
              >
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-purple-500"
                >
                  <Icon name="mdi:music-note" size="16" class="text-white" />
                </div>
                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-[12px] font-semibold text-gray-900 dark:text-neutral-100"
                  >
                    {{ musicFileName }}
                  </p>
                  <p class="text-[11px] text-pink-400 dark:text-pink-500">
                    {{ $t('music.backgroundMusic') }}
                  </p>
                </div>
                <button
                  @click="removeMusic"
                  class="rounded-full p-1 transition-colors hover:bg-pink-100 dark:hover:bg-pink-900/30"
                >
                  <Icon
                    name="mdi:close"
                    size="16"
                    class="text-gray-500 dark:text-neutral-400"
                  />
                </button>
              </div>
            </div>

            <!-- ── Tagged products chips ── -->
            <div v-if="taggedProducts.length > 0" class="px-4 pb-3">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="product in taggedProducts"
                  :key="product.id"
                  class="flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[12px]"
                >
                  <Icon name="mdi:tag-outline" size="12" class="text-brand" />
                  <span class="font-medium text-brand">{{ product.name }}</span>
                  <button @click="removeProduct(product.id)">
                    <Icon
                      name="mdi:close-circle"
                      size="14"
                      class="text-brand/60"
                    />
                  </button>
                </div>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/*,video/*"
              multiple
              class="hidden"
              @change="handleFileSelect"
            />
          </div>

          <!-- ── Bottom Toolbar ── -->
          <div class="shrink-0 border-t border-gray-100 dark:border-neutral-800">
            <!-- Advanced options panel -->
            <Transition name="expand">
              <div v-if="showAdvancedOptions" class="space-y-3 px-4 pb-3 pt-3">
                <div>
                  <label
                    class="mb-1.5 block text-[12px] font-medium text-gray-600 dark:text-neutral-400"
                    >{{ $t('upload.whoCanSee') }}</label
                  >
                  <select
                    v-model="visibility"
                    class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    <option value="PUBLIC">
                      {{ $t('upload.everyone') }}
                    </option>
                    <option value="FOLLOWERS">
                      {{ $t('upload.followersOnly') }}
                    </option>
                    <option value="PRIVATE">{{ $t('upload.onlyMe') }}</option>
                  </select>
                </div>
                <label
                  class="flex cursor-pointer items-center justify-between border-t border-gray-100 pt-3 dark:border-neutral-800"
                >
                  <span
                    class="text-[13px] text-gray-700 dark:text-neutral-300"
                    >{{ $t('upload.allowComments') }}</span
                  >
                  <input
                    v-model="allowComments"
                    type="checkbox"
                    class="h-5 w-5 rounded text-brand focus:ring-brand"
                  />
                </label>
              </div>
            </Transition>

            <!-- Toolbar row -->
            <div class="flex items-center gap-0.5 px-2 py-2">
              <!-- Photo / Video -->
              <button
                @click="triggerFileInput"
                class="toolbar-action group flex items-center gap-1.5 rounded-xl px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                :title="$t('upload.addPhotosVideos')"
              >
                <Icon name="mdi:image-outline" size="22" class="text-green-500" />
                <span class="text-[13px] font-medium text-gray-600 dark:text-neutral-400">Photo</span>
              </button>

              <!-- Music -->
              <button
                @click="showMusicPicker = true"
                class="toolbar-action rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                :class="selectedMusic ? 'text-pink-500' : ''"
                :title="$t('upload.addMusic')"
              >
                <Icon
                  name="mdi:music-note-outline"
                  size="22"
                  :class="selectedMusic ? 'text-pink-500' : 'text-gray-500 dark:text-neutral-400'"
                />
              </button>

              <!-- Tag Products -->
              <button
                v-if="showProductTagging"
                @click="showProductSelector = true"
                class="toolbar-action rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                :title="$t('upload.tagProducts')"
              >
                <Icon
                  name="mdi:tag-outline"
                  size="22"
                  :class="taggedProducts.length > 0 ? 'text-brand' : 'text-gray-500 dark:text-neutral-400'"
                />
              </button>

              <!-- Advanced options toggle -->
              <button
                @click="showAdvancedOptions = !showAdvancedOptions"
                class="toolbar-action ml-auto rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                :title="$t('upload.advancedOptions')"
              >
                <Icon
                  name="mdi:dots-horizontal"
                  size="22"
                  :class="showAdvancedOptions ? 'text-brand' : 'text-gray-500 dark:text-neutral-400'"
                />
              </button>
            </div>
          </div>
        </div>

        <ContentTypeSelector
          v-if="showContentTypeSelector"
          :current="contentType"
          @select="handleContentTypeSelect"
          @close="showContentTypeSelector = false"
        />
        <ProductSelector
          v-if="showProductSelector"
          :selected="taggedProducts"
          @select="handleProductSelect"
          @close="showProductSelector = false"
        />
        <MusicPicker
          :is-open="showMusicPicker"
          @close="showMusicPicker = false"
          @select="onMusicSelected"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MusicPicker from '~~/layers/core/app/components/MusicPicker.vue'
import type { MusicSelection } from '~~/layers/core/app/components/MusicPicker.vue'
const { t } = useI18n()
import { usePost } from '../../composables/usePost'
import ContentTypeSelector from './ContentTypeSelector.vue'
import ProductSelector from './ProductSelector.vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import Avatar from '~~/layers/profile/app/components/Avatar.vue'
import type { ICloudinaryUploadResult } from '~~/layers/core/app/types/media.types'

const props = defineProps<{
  isOpen: boolean
  initialTaggedProduct?: { id: number; name: string } | null
}>()
const emit = defineEmits(['close', 'posted'])

const profileStore = useProfileStore()
const { createPost } = usePost()
const { uploadMedia } = useMediaUpload()

// ── Form state ──────────────────────────────────────────────────────────────
const content = ref('')
const contentType = ref<
  'EXPERIENCE' | 'INSPIRATION' | 'EDUCATIONAL' | 'ENTERTAINMENT'
>('EXPERIENCE')
const visibility = ref<'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'>('PUBLIC')
const allowComments = ref(true)
const hashtags = ref<string[]>([])
const taggedProducts = ref<any[]>(
  props.initialTaggedProduct ? [props.initialTaggedProduct] : [],
)

// Keep in sync if the modal is reused with a different product
watch(
  () => props.initialTaggedProduct,
  (p) => {
    if (p && !taggedProducts.value.find((t) => t.id === p.id)) {
      taggedProducts.value = [p, ...taggedProducts.value]
    }
  },
)

// ── Media items ──────────────────────────────────────────────────────────────
interface MediaItem {
  file: File
  type: 'image' | 'video'
  preview: string
  uploading?: boolean
  progress?: number
  uploaded?: ICloudinaryUploadResult
  uploadError?: boolean
}
const mediaFiles = ref<MediaItem[]>([])

// ── Music ─────────────────────────────────────────────────────────────────────
const showMusicPicker = ref(false)
const selectedMusic = ref<MusicSelection | null>(null)
const musicFileName = computed(() => selectedMusic.value?.name ?? '')
// Legacy compat — handlePost still uses musicFile if it's an upload
const musicFile = computed(() =>
  selectedMusic.value?.source === 'upload' ? selectedMusic.value.file ?? null : null,
)

const onMusicSelected = (music: MusicSelection) => {
  selectedMusic.value = music
}

const removeMusic = () => {
  selectedMusic.value = null
}

// ── UI ────────────────────────────────────────────────────────────────────────
const isPosting = ref(false)
const isDragging = ref(false)
const showAdvancedOptions = ref(false)
const showContentTypeSelector = ref(false)
const showProductSelector = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const hasUploadError = computed(() => mediaFiles.value.some((m) => m.uploadError))
const canPost = computed(
  () =>
    (content.value.trim().length > 0 || mediaFiles.value.length > 0) &&
    !isPosting.value &&
    !hasUploadError.value,
)

const contentTypeLabel = computed(() =>
  t(`contentTypeLabel.${contentType.value}`, contentType.value),
)

const showProductTagging = computed(() =>
  ['EXPERIENCE', 'INSPIRATION', 'EDUCATIONAL'].includes(contentType.value),
)

// Grid: 1 → full-width, 2 → 2-col, 3+ → 3-col
const gridClass = computed(() => {
  const n = mediaFiles.value.length
  return n === 1 ? 'grid-cols-1' : n === 2 ? 'grid-cols-2' : 'grid-cols-3'
})

// ── File handling ─────────────────────────────────────────────────────────────
const triggerFileInput = () => fileInput.value?.click()

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) addFiles(Array.from(files))
  ;(event.target as HTMLInputElement).value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) addFiles(Array.from(files))
}

const addFiles = (files: File[]) => {
  for (const file of files) {
    if (mediaFiles.value.length >= 10) break
    if (file.size > 50 * 1024 * 1024) {
      alert(`${file.name} exceeds 50MB`)
      continue
    }
    const type = file.type.startsWith('image/')
      ? ('image' as const)
      : file.type.startsWith('video/')
        ? ('video' as const)
        : null
    if (!type) continue

    mediaFiles.value.push({ file, type, preview: URL.createObjectURL(file), uploading: true, progress: 0 })
    const idx = mediaFiles.value.length - 1

    // Eager upload — start immediately so it's done by the time user hits Share
    uploadMedia(file, (pct) => {
      if (mediaFiles.value[idx]) mediaFiles.value[idx].progress = pct
    }).then((result) => {
      if (mediaFiles.value[idx]) {
        mediaFiles.value[idx].uploaded = result
        mediaFiles.value[idx].uploading = false
      }
    }).catch(() => {
      if (mediaFiles.value[idx]) {
        mediaFiles.value[idx].uploadError = true
        mediaFiles.value[idx].uploading = false
      }
    })
  }
}

const removeMediaItem = (idx: number) => {
  URL.revokeObjectURL(mediaFiles.value[idx]!.preview)
  mediaFiles.value.splice(idx, 1)
}

const retryUpload = (item: MediaItem) => {
  item.uploadError = false
  item.uploading = true
  uploadMedia(item.file).then((result) => {
    item.uploaded = result
    item.uploading = false
  }).catch(() => {
    item.uploadError = true
    item.uploading = false
  })
}


const extractHashtags = () => {
  hashtags.value = (content.value.match(/#[\w]+/g) ?? []).map((t) => t.slice(1))
}

const handleContentTypeSelect = (type: string) => {
  contentType.value = type as any
  showContentTypeSelector.value = false
}

const handleProductSelect = (products: any[]) => {
  taggedProducts.value = products
  showProductSelector.value = false
}

const removeProduct = (id: string) => {
  taggedProducts.value = taggedProducts.value.filter((p) => p.id !== id)
}

// Pre-populate tagged product when opened from ProductDetailModal
watch(
  () => props.isOpen,
  (open) => {
    if (open && props.initialTaggedProduct) {
      const p = props.initialTaggedProduct
      if (!taggedProducts.value.find((x: any) => x.id === p.id)) {
        taggedProducts.value = [{ id: p.id, name: p.name }]
      }
    }
  },
)

// ── Post submission ───────────────────────────────────────────────────────────
const handlePost = async () => {
  if (!canPost.value) return
  isPosting.value = true

  try {
    // Use eagerly-uploaded results; only upload items that haven't completed yet
    const uploadedMedia = await Promise.all(
      mediaFiles.value.map(async (item) => {
        if (item.uploaded) return item.uploaded
        if (item.uploadError) throw new Error(`Upload failed for ${item.file.name}`)
        // Still in progress — wait for it
        item.uploading = true
        const result = await uploadMedia(item.file)
        item.uploading = false
        item.uploaded = result
        return result
      }),
    )

    // Upload music if present
    let musicData: any = null
    if (selectedMusic.value) {
      if (selectedMusic.value.source === 'upload' && selectedMusic.value.file) {
        // Local file — crop already done by MusicPicker, just upload to Cloudinary
        const uploaded = await uploadMedia(selectedMusic.value.file)
        musicData = { ...uploaded, name: selectedMusic.value.name }
      } else if (selectedMusic.value.source === 'jamendo' && selectedMusic.value.url) {
        // External URL — store directly, no upload needed
        musicData = {
          url: selectedMusic.value.url,
          public_id: `jamendo-${Date.now()}`,
          type: 'AUDIO',
          name: `${selectedMusic.value.name}${selectedMusic.value.artist ? ` · ${selectedMusic.value.artist}` : ''}`,
        }
      }
    }

    await createPost({
      content: content.value,
      contentType: contentType.value,
      mediaData: uploadedMedia.length > 0 ? uploadedMedia : undefined,
      musicData: musicData ?? undefined,
      visibility: visibility.value,
      allowComments: allowComments.value,
      taggedProducts: taggedProducts.value.map((p) => p.id),
    })

    emit('posted')
    resetForm()
    emit('close')
  } catch (error) {
    console.error('Failed to create post:', error)
    alert(t('errors.failedPost'))
  } finally {
    isPosting.value = false
  }
}

const resetForm = () => {
  content.value = ''
  contentType.value = 'EXPERIENCE'
  mediaFiles.value.forEach((m) => URL.revokeObjectURL(m.preview))
  mediaFiles.value = []
  removeMusic()
  hashtags.value = []
  taggedProducts.value = []
  visibility.value = 'PUBLIC'
  allowComments.value = true
  showAdvancedOptions.value = false
}

const handleClose = () => {
  if (isPosting.value) return
  if (content.value.trim() || mediaFiles.value.length > 0) {
    if (!confirm(t('upload.confirmDiscard'))) return
  }
  resetForm()
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(40px) scale(0.97);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 400px;
  opacity: 1;
}

/* Auto-grow textarea — caption fills available space */
.caption-input {
  min-height: 120px;
  field-sizing: content; /* Chrome 123+ progressive enhancement */
}

/* Green checkmark fades out after 2s */
.upload-done {
  animation: fade-check-out 0.4s ease 2s forwards;
}
@keyframes fade-check-out {
  to { opacity: 0; }
}

.fade-check-leave-active {
  transition: opacity 0.3s ease;
}
.fade-check-leave-to {
  opacity: 0;
}
</style>
