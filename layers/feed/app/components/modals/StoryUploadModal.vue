<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
      <div
        class="relative w-full max-w-md rounded-xl bg-white p-6 dark:bg-neutral-900"
      >
        <div class="mb-6 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            Create Story
          </h3>
          <button
            class="text-gray-500 hover:text-gray-700 dark:text-neutral-400"
            @click="$emit('close')"
          >
            <Icon name="mdi:close" class="h-6 w-6" />
          </button>
        </div>

        <!-- Media Preview -->
        <div
          v-if="mediaPreview"
          class="relative mb-4 flex aspect-[9/16] max-h-64 items-center justify-center overflow-hidden rounded-lg bg-black"
        >
          <video
            v-if="mediaType === 'video'"
            :src="mediaPreview"
            class="max-h-full"
            controls
          />
          <img v-else :src="mediaPreview" class="max-h-full object-contain" />
          <button
            class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            @click="clearMedia"
          >
            <Icon name="mdi:close" size="16" />
          </button>
        </div>

        <!-- Upload Area -->
        <div
          v-else
          class="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-brand dark:border-neutral-700"
          @click="fileInput?.click()"
        >
          <Icon
            name="mdi:image-plus"
            size="48"
            class="mx-auto mb-3 text-gray-400"
          />
          <p class="text-sm font-medium text-gray-700 dark:text-neutral-300">
            Tap to add photo or video
          </p>
          <p class="mt-1 text-xs text-gray-400 dark:text-neutral-500">
            JPG, PNG, MP4 up to 50MB
          </p>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Upload Progress -->
        <div v-if="isUploading" class="mb-4">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-sm text-gray-600 dark:text-neutral-400"
              >Uploading...</span
            >
            <span class="text-sm text-brand">{{ uploadProgress }}%</span>
          </div>
          <div
            class="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700"
          >
            <div
              class="h-full bg-brand transition-all"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>

        <!-- Error -->
        <p v-if="error" class="mb-4 text-sm text-red-500">{{ error }}</p>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-lg border border-gray-200 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="!selectedFile || isUploading"
            class="flex-1 rounded-lg bg-brand py-2 font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:cursor-not-allowed disabled:opacity-50"
            @click="handlePost"
          >
            {{ isUploading ? 'Uploading...' : 'Share Story' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { useStory } from '~~/layers/feed/app/composables/useStory'

const props = defineProps<{
  isOpen: boolean
  initialProductId?: number | null
}>()
const emit = defineEmits(['close', 'posted'])

const { uploadMedia, isUploading, uploadError, resetUpload } = useMediaUpload()
const { createStory } = useStory()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const mediaPreview = ref<string | null>(null)
const mediaType = ref<'image' | 'video'>('image')
const error = ref<string | null>(null)
const uploadProgress = ref<number>(0)

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  selectedFile.value = file
  mediaType.value = file.type.startsWith('video') ? 'video' : 'image'
  mediaPreview.value = URL.createObjectURL(file)
  error.value = null
}

const clearMedia = () => {
  selectedFile.value = null
  mediaPreview.value = null
  if (fileInput.value) fileInput.value.value = ''
  resetUpload()
}

const handlePost = async () => {
  if (!selectedFile.value) return
  error.value = null
  try {
    const uploaded = await uploadMedia({ file: selectedFile.value })
    await createStory({
      mediaUrl: uploaded.url,
      mediaPublicId: uploaded.public_id,
      mediaType: uploaded.type,
      productId: props.initialProductId ?? undefined,
    })
    emit('posted')
    emit('close')
    clearMedia()
  } catch (e: any) {
    error.value = e.message || uploadError.value || 'Failed to share story'
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      clearMedia()
      error.value = null
      uploadProgress.value = 0
    }
  },
)
</script>
