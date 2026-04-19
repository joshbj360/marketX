<template>
  <div class="px-3 py-4 sm:px-6">
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink
        :to="`/seller/${storeSlug}/products`"
        class="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <Icon name="mdi:arrow-left" size="20" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
        New Product
      </h1>
    </div>

    <!-- Onboarding welcome banner -->
    <div
      v-if="isOnboarding"
      class="mb-6 max-w-3xl rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/10 to-purple-600/10 p-5 dark:from-brand/20 dark:to-purple-600/20"
    >
      <div class="flex items-start gap-4">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand shadow-lg shadow-brand/25"
        >
          <span class="text-sm font-black italic text-white">MX</span>
        </div>
        <div>
          <h2 class="font-bold text-gray-900 dark:text-white">
            One last step — add your first product!
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            Your store is live. Add a product now so buyers can find you. You
            can add more any time from your dashboard.
          </p>
        </div>
      </div>
    </div>

    <!-- Save status overlay -->
    <SaveStatusOverlay
      :saving="isLoading"
      :success="saveSuccess"
      :error="error"
      saving-text="Creating product…"
      success-text="Product created!"
    />

    <div class="max-w-3xl">
      <form class="space-y-6" @submit.prevent="handleSubmit">

        <!-- Media Upload -->
        <div
          class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
            Product Images
          </h2>
          <p class="text-xs text-gray-500 dark:text-neutral-400">
            Upload up to 5 images. First image becomes the cover.
          </p>

          <!-- Image previews grid -->
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
            <div
              v-for="(img, i) in mediaItems"
              :key="i"
              class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <img :src="img.preview" class="h-full w-full object-cover" />
              <div
                v-if="img.uploading"
                class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55"
              >
                <svg width="36" height="36" viewBox="0 0 36 36" class="-rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none" stroke="#F43F5E" stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="`${2 * Math.PI * 14}`"
                    :stroke-dashoffset="`${2 * Math.PI * 14 * (1 - img.progress / 100)}`"
                    style="transition: stroke-dashoffset 0.15s ease"
                  />
                </svg>
                <span class="text-[11px] font-bold text-white">{{ img.progress }}%</span>
              </div>
              <div
                v-if="i === 0"
                class="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white"
              >
                Cover
              </div>
              <button
                type="button"
                class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                @click="removeMediaItem(i)"
              >
                <Icon name="mdi:close" size="12" />
              </button>
            </div>

            <!-- Add image button -->
            <label
              v-if="mediaItems.length < 5"
              class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-600"
            >
              <Icon
                name="mdi:image-plus"
                size="24"
                class="mb-1 text-gray-400 dark:text-neutral-500"
              />
              <span class="text-xs text-gray-400 dark:text-neutral-500"
                >Add</span
              >
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                class="hidden"
                @change="onImagesSelected"
              />
            </label>
          </div>

          <!-- Video size warning -->
          <div
            v-if="videoSizeWarning"
            class="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-400"
          >
            <Icon name="mdi:wifi-alert" size="15" class="shrink-0" />
            {{ videoSizeWarning }}
          </div>

          <!-- ✨ AI Magic Lister Banner (Shows after image upload) -->
          <div
            v-if="mediaItems.length > 0"
            class="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-brand/20 bg-gradient-to-r from-brand/10 to-purple-600/10 p-5 shadow-sm sm:flex-row sm:items-center dark:from-brand/20 dark:to-purple-600/20"
          >
            <div>
              <h3
                class="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"
              >
                <Icon name="mdi:magic-staff" class="text-brand" size="18" />
                AI Magic Lister
              </h3>
              <p class="mt-1 max-w-sm text-xs text-gray-600 dark:text-gray-300">
                Save time! Let our AI analyze your cover image to auto-write
                your title, description, price, and social media captions.
              </p>
            </div>
            <button
              type="button"
              :disabled="isGeneratingAI || mediaItems[0]?.uploading"
              class="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 sm:w-auto dark:bg-white dark:text-gray-900"
              @click="autoFillWithAI"
            >
              <Icon
                v-if="isGeneratingAI"
                name="eos-icons:loading"
                class="animate-spin"
                size="18"
              />
              <Icon v-else name="mdi:creation" size="18" />
              {{ isGeneratingAI ? 'Generating...' : 'Auto-Fill Form' }}
            </button>
          </div>

          <!-- Background Music -->
          <div
            class="mt-4 border-t border-gray-100 pt-4 dark:border-neutral-700"
          >
            <h3
              class="mb-2 text-sm font-medium text-gray-700 dark:text-neutral-300"
            >
              Background Music
              <span class="font-normal text-gray-400">(optional)</span>
            </h3>

            <!-- Selected music chip -->
            <div
              v-if="selectedMusic"
              class="flex items-center gap-3 rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-2.5 dark:border-pink-900/30 dark:from-pink-950/20 dark:to-purple-950/20"
            >
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-purple-500"
              >
                <Icon name="mdi:music-note" size="16" class="text-white" />
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-[13px] font-semibold text-gray-900 dark:text-neutral-100"
                >
                  {{ selectedMusic.name }}
                </p>
                <p class="text-[11px] text-pink-400">
                  {{
                    selectedMusic.source === 'jamendo'
                      ? selectedMusic.artist
                      : 'Local file'
                  }}
                </p>
              </div>
              <div
                v-if="bgMusicUploading"
                class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand border-t-transparent"
              />
              <button
                v-else
                type="button"
                class="shrink-0 rounded-full p-1 transition-colors hover:bg-pink-100 dark:hover:bg-pink-900/30"
                @click="removeBgMusic"
              >
                <Icon name="mdi:close" size="16" class="text-gray-500" />
              </button>
            </div>

            <!-- Add button -->
            <button
              v-else
              type="button"
              class="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-600 dark:text-neutral-400"
              @click="showMusicPicker = true"
            >
              <Icon
                name="mdi:music-note-plus"
                size="18"
                class="text-gray-400 dark:text-neutral-500"
              />
              Add background music
            </button>
          </div>
        </div>

        <!-- Basic Info -->
        <ProductBasicInfo :form="form" />

        <!-- ✨ AI Generated Social Posts (Only shows if AI was used) -->
        <ProductSocialCaptions :captions="form.socialCaptions" />

        <!-- Variants -->
        <ProductVariantsSection :variants="form.variants" />

        <!-- Volume Offers -->
        <VolumeOffersSection :offers="form.offers" />

        <!-- Categories -->
        <ProductCategoriesSection
          :categories="categories"
          :categories-loading="categoriesLoading"
          :category-ids="form.categoryIds"
        />

        <!-- Tags -->
        <ProductTagsSection :tag-names="form.tagNames" />

        <!-- Distribution -->
        <ProductDistributionSection
          :form="form"
          :is-premium-seller="isPremiumSeller"
          :has-video="hasVideo"
          :conditions="CONDITIONS"
          :min-deal-date="minDealDate"
        />


        <!-- Flags -->
        <ProductFlagsSection :form="form" />

        <!-- Submit -->
        <div class="flex flex-col gap-3 sm:flex-row">
          <NuxtLink
            :to="`/seller/${storeSlug}/products`"
            class="flex-1 rounded-xl border border-gray-200 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="isLoading || isAnyUploading || isGeneratingAI"
            class="flex-1 rounded-xl bg-brand py-3 font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:opacity-50"
          >
            {{
              isAnyUploading
                ? 'Uploading Media...'
                : isGeneratingAI
                  ? 'AI Processing...'
                  : isLoading
                    ? 'Creating...'
                    : 'Create Product'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <MusicPicker
    :is-open="showMusicPicker"
    @close="showMusicPicker = false"
    @select="onMusicSelected"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { useAiApi } from '~~/layers/core/app/services/ai.api'
import { notify } from '@kyvg/vue3-notification'
import MusicPicker from '~~/layers/core/app/components/MusicPicker.vue'
import type { MusicSelection } from '~~/layers/core/app/components/MusicPicker.vue'


import SaveStatusOverlay from '~~/layers/core/app/components/SaveStatusOverlay.vue'
import ProductBasicInfo from '~~/layers/seller/app/components/product-form/ProductBasicInfo.vue'
import ProductVariantsSection from '~~/layers/seller/app/components/product-form/ProductVariantsSection.vue'
import VolumeOffersSection from '~~/layers/seller/app/components/product-form/VolumeOffersSection.vue'
import ProductCategoriesSection from '~~/layers/seller/app/components/product-form/ProductCategoriesSection.vue'
import ProductTagsSection from '~~/layers/seller/app/components/product-form/ProductTagsSection.vue'
import ProductDistributionSection from '~~/layers/seller/app/components/product-form/ProductDistributionSection.vue'
import ProductFlagsSection from '~~/layers/seller/app/components/product-form/ProductFlagsSection.vue'
import ProductSocialCaptions from '~~/layers/seller/app/components/product-form/ProductSocialCaptions.vue'


definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const route = useRoute()
const router = useRouter()
const storeSlug = computed(
  () =>
    (route.params.storeSlug as string) || (route.params.store_slug as string),
)
const isOnboarding = computed(() => route.query.onboarding === '1')

const isPremiumSeller = ref(false)
onMounted(async () => {
  try {
    const res: any = await $fetch(`/api/seller/by-slug/${storeSlug.value}`)
    isPremiumSeller.value = res?.data?.isPremium ?? false
  } catch {
    // non-critical — defaults to false
  }
})

const { createProduct, fetchCategories, isLoading, error } = useProduct()
const saveSuccess = ref(false)
const { uploadMedia, videoSizeWarning } = useMediaUpload()
const aiApi = useAiApi()

// ── Media state ──────────────────────────────────────────────────────────────
interface MediaItem {
  preview: string
  file: File
  uploading: boolean
  progress: number
  result: { url: string; public_id: string; type: string } | null
}

const mediaItems = ref<MediaItem[]>([])
const showMusicPicker = ref(false)
const selectedMusic = ref<MusicSelection | null>(null)
const bgMusicResult = ref<{
  url: string
  public_id: string
  name?: string
} | null>(null)
const bgMusicUploading = ref(false)

const isAnyUploading = computed(
  () => mediaItems.value.some((m) => m.uploading) || bgMusicUploading.value,
)

const onImagesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || []).slice(
    0,
    5 - mediaItems.value.length,
  )
  input.value = ''

  for (const file of files) {
    const item: MediaItem = {
      preview: URL.createObjectURL(file),
      file,
      uploading: true,
      progress: 0,
      result: null,
    }
    mediaItems.value.push(item)
    const idx = mediaItems.value.length - 1

    try {
      const res = await uploadMedia({ file }, (pct) => {
        if (mediaItems.value[idx]) mediaItems.value[idx].progress = pct
      })
      if (mediaItems.value[idx]) {
        mediaItems.value[idx].result = res
        mediaItems.value[idx].uploading = false
      }
    } catch {
      mediaItems.value.splice(idx, 1)
    }
  }
}

const removeMediaItem = (i: number) => {
  const item = mediaItems.value[i]
  if (item?.preview) URL.revokeObjectURL(item.preview)
  mediaItems.value.splice(i, 1)
}

const onMusicSelected = async (music: MusicSelection) => {
  selectedMusic.value = music
  bgMusicUploading.value = true
  try {
    if (music.source === 'upload' && music.file) {
      const res = await uploadMedia(music.file)
      bgMusicResult.value = {
        url: res.url,
        public_id: res.public_id,
        name: music.name,
      }
    } else if (music.source === 'jamendo' && music.url) {
      bgMusicResult.value = {
        url: music.url,
        public_id: `jamendo-${Date.now()}`,
        name: `${music.name}${music.artist ? ` · ${music.artist}` : ''}`,
      }
    }
  } catch {
    selectedMusic.value = null
    bgMusicResult.value = null
  } finally {
    bgMusicUploading.value = false
  }
}

const removeBgMusic = () => {
  selectedMusic.value = null
  bgMusicResult.value = null
}

// ── Form state ───────────────────────────────────────────────────────────────
const form = reactive({
  title: '',
  description: '',
  price: null as number | null,
  discount: 0,
  affiliateCommission: null as number | null,
  SKU: '',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  isFeatured: false,
  isAccessory: false,
  variants: [] as Array<{ size: string; price: number | null; stock: number }>,
  offers: [] as Array<{
    minQuantity: number | null
    discount: number | null
    label: string
  }>,
  categoryIds: [] as number[],
  tagNames: [] as string[],
  // Added social captions to hold AI outputs
  socialCaptions: {
    instagram: '',
    facebook: '',
    pinterest: '',
    feedCaption: '',
  },
  // Distribution
  showInFeed: false,
  showInReels: false,
  // Pre-loved
  isThrift: false,
  condition: '' as string,
  // Deal
  isDeal: false,
  dealEndsAt: '' as string,
})

const CONDITIONS = [
  { value: 'NEW_WITH_TAGS', label: 'New with tags' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
]

const hasVideo = computed(() =>
  mediaItems.value.some(
    (m) => m.result?.type === 'VIDEO' || m.file.type.startsWith('video/'),
  ),
)

const minDealDate = computed(() => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
})

// ── AI Magic Lister Integration ───────────────────────────────────────────────
const isGeneratingAI = ref(false)
const hasAiCaptions = computed(
  () =>
    !!(
      form.socialCaptions.instagram ||
      form.socialCaptions.facebook ||
      form.socialCaptions.pinterest
    ),
)

// Helper to convert File to Base64 for the Gemini API
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // The API expects pure base64 without the data:image prefix
      const base64Data = result.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = (error) => reject(error)
  })
}

const autoFillWithAI = async () => {
  if (!mediaItems.value.length) return

  isGeneratingAI.value = true
  try {
    // 1. Get the first image (cover image)
    const coverFile = mediaItems.value[0]?.file
    if (!coverFile) return

    const base64Image = await fileToBase64(coverFile)
    // 2. Call AI service
    const response = await aiApi.generateListing(
      base64Image,
      coverFile.type,
      form.isThrift ? 'This is a thrift/vintage item.' : '',
    )

    // 3. Populate the reactive form fields
    if (response.success && response.data) {
      const aiData = response.data

      // Only overwrite fields if they are empty, or fully overwrite if you prefer
      form.title = aiData.title || form.title
      form.description = aiData.description || form.description

      // Don't overwrite price if they already typed one
      if (!form.price && aiData.suggestedPrice) {
        // Convert suggested USD price to NGN (Rough mock conversion, adjust as needed)
        // Assuming 1 USD = ~1500 NGN for placeholder logic
        form.price = Math.round((aiData.suggestedPrice * 1500) / 100) * 100
      }

      form.socialCaptions.instagram = aiData.socialCaptions?.instagram || ''
      form.socialCaptions.facebook = aiData.socialCaptions?.facebook || ''
      form.socialCaptions.pinterest = aiData.socialCaptions?.pinterest || ''

      notify({ type: 'success', text: '✨ AI has filled out your listing!' })
    }
  } catch (err: any) {
    console.error('AI Generation Failed:', err)
    notify({
      type: 'error',
      text: 'Failed to generate listing with AI. Please try again.',
    })
  } finally {
    isGeneratingAI.value = false
  }
}

// ── Categories ────────────────────────────────────────────────────────────────
const categories = ref<Array<{ id: number; name: string; slug: string }>>([])
const categoriesLoading = ref(false)

onMounted(async () => {
  categoriesLoading.value = true
  try {
    categories.value = await fetchCategories()
  } catch {
    // non-fatal
  } finally {
    categoriesLoading.value = false
  }
})

const handleSubmit = async () => {
  try {
    const payload: any = {
      storeSlug: storeSlug.value,
      title: form.title,
      description: form.description,
      price: form.price,
      discount: form.discount || 0,
      status: form.status,
      isFeatured: form.isFeatured,
      isThrift: form.isThrift,
      isAccessory: form.isAccessory,
      showInFeed: form.showInFeed,
      showInReels: form.showInReels,
      isDeal: form.isDeal,
      dealEndsAt:
        form.isDeal && form.dealEndsAt
          ? new Date(form.dealEndsAt).toISOString()
          : undefined,
      condition: form.isThrift && form.condition ? form.condition : undefined,
      // Include the social captions in the payload to save them to the DB
      socialCaptions: form.socialCaptions,
    }

    if (form.affiliateCommission && form.affiliateCommission > 0)
      payload.affiliateCommission = form.affiliateCommission
    if (form.SKU) payload.SKU = form.SKU
    if (form.categoryIds.length) payload.categoryIds = form.categoryIds
    if (form.tagNames.length) payload.tagNames = form.tagNames

    if (form.variants.length) {
      payload.variants = form.variants
        .filter((v) => v.size)
        .map((v) => ({
          size: v.size,
          price: v.price ?? undefined,
          stock: v.stock,
        }))
    }

    const validOffers = form.offers.filter(
      (o) =>
        o.minQuantity && o.minQuantity >= 2 && o.discount && o.discount > 0,
    )
    if (validOffers.length) {
      payload.offers = validOffers.map((o) => ({
        minQuantity: o.minQuantity!,
        discount: o.discount!,
        label: o.label || undefined,
      }))
    }

    // Attach uploaded media
    const uploaded = mediaItems.value.filter((m) => m.result)
    if (uploaded.length) {
      payload.mediaItems = uploaded.map((m) => ({
        url: m.result!.url,
        public_id: m.result!.public_id,
        type: m.result!.type || 'IMAGE',
      }))
    }

    if (bgMusicResult.value) {
      payload.bgMusic = {
        url: bgMusicResult.value.url,
        public_id: bgMusicResult.value.public_id,
        name: bgMusicResult.value.name,
      }
    }

    await createProduct(payload)
    saveSuccess.value = true
    notify({ type: 'success', text: 'Product created successfully!' })
    if (isOnboarding.value) {
      await router.push(`/seller/${storeSlug.value}/dashboard?welcome=1`)
    } else {
      await router.push(`/seller/${storeSlug.value}/products`)
    }
  } catch {
    // error is reactive from composable
    notify({ type: 'error', text: 'Failed to create product' })
  }
}
</script>
