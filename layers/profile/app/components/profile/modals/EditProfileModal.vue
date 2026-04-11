<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <button
              @click="handleClose"
              class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Icon
                name="mdi:close"
                size="24"
                class="text-gray-900 dark:text-neutral-100"
              />
            </button>
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-neutral-100"
            >
              Edit Profile
            </h2>
            <button
              @click="saveChanges"
              :disabled="isSaving"
              class="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>

          <!-- Content -->
          <div class="max-h-[calc(90vh-80px)] space-y-6 overflow-y-auto p-6">
            <!-- Avatar -->
            <div class="flex items-center gap-6">
              <img
                :src="
                  formData.avatar ||
                  `https://avatar.iran.liara.run/public/boy?username=${profile.username}`
                "
                class="h-24 w-24 rounded-full object-cover"
                alt="Profile avatar"
              />
              <div>
                <button
                  @click="triggerAvatarUpload"
                  class="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                >
                  Change Photo
                </button>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
              </div>
            </div>

            <!-- Username (Read-only) -->
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Username
              </label>
              <input
                :value="profile.username"
                readonly
                class="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-gray-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
              />
            </div>

            <!-- Bio -->
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Bio
              </label>
              <textarea
                v-model="formData.bio"
                placeholder="Tell us about yourself..."
                rows="4"
                maxlength="150"
                class="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                {{ formData.bio?.length || 0 }}/150
              </p>
            </div>

            <!-- Website -->
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Website
              </label>
              <input
                v-model="formData.websiteUrl"
                type="url"
                placeholder="https://example.com"
                class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>

            <!-- Location -->
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Location
              </label>
              <input
                v-model="formData.location"
                type="text"
                placeholder="New York, USA"
                class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { IProfile } from '~~/layers/profile/app/types/profile.types'
import { useProfile } from '~~/layers/profile/app/composables/useProfile'

const props = defineProps<{
  profile: IProfile
}>()

const emit = defineEmits(['close', 'updated'])

const { updateMyProfile } = useProfile()
const { uploadMedia, isUploading: isUploadingAvatar } = useMediaUpload()

const isOpen = ref(true)
const isSaving = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const pendingAvatarFile = ref<File | null>(null)

// Extract the website URL from the links JSON array for the simple URL input
const extractWebsite = (links: any) => {
  if (!links || !Array.isArray(links)) return ''
  return links.find((l: any) => l.type === 'website')?.url ?? ''
}

const formData = reactive({
  avatar: props.profile.avatar,
  bio: props.profile.bio || '',
  websiteUrl:
    extractWebsite(props.profile.links) ||
    (props.profile.profileUrl as string) ||
    '',
  location: props.profile.location || props.profile.stateOfResidence || '',
})

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    pendingAvatarFile.value = file
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const saveChanges = async () => {
  isSaving.value = true

  try {
    let avatarUrl = formData.avatar

    // Upload new avatar to Cloudinary if a new file was selected
    if (pendingAvatarFile.value) {
      const uploaded = await uploadMedia(pendingAvatarFile.value)
      avatarUrl = uploaded.url
    }

    // Build links array from the simple website URL input
    const links = formData.websiteUrl
      ? [{ type: 'website', url: formData.websiteUrl }]
      : []

    await updateMyProfile({
      bio: formData.bio,
      links,
      location: formData.location,
      avatar: avatarUrl,
    })

    emit('updated')
  } catch (error) {
    console.error('Failed to update profile:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  if (isSaving.value) return

  // Check if there are unsaved changes
  const hasChanges =
    formData.bio !== (props.profile.bio || '') ||
    formData.websiteUrl !== extractWebsite(props.profile.links) ||
    formData.location !==
      (props.profile.location || props.profile.stateOfResidence || '') ||
    formData.avatar !== props.profile.avatar

  if (hasChanges) {
    if (confirm('Discard changes?')) {
      emit('close')
    }
  } else {
    emit('close')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>
