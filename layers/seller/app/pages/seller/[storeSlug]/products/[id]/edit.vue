<template>
  <div class="px-4 py-6 sm:px-6">
    <!-- Save status overlay -->
    <SaveStatusOverlay
      :saving="isLoading"
      :success="saveSuccess"
      :error="error"
      saving-text="Saving product…"
      success-text="Changes saved!"
    />
    <div class="mb-6 flex items-center gap-3">
      <NuxtLink
        :to="`/seller/${storeSlug}/products`"
        class="text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <Icon name="mdi:arrow-left" size="20" />
      </NuxtLink>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
        Edit Product
      </h1>
    </div>

    <div class="max-w-3xl">
      <!-- Loading skeleton -->
      <div v-if="isFetching" class="space-y-6">
        <div
          v-for="i in 3"
          :key="i"
          class="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div class="mb-4 h-5 w-1/3 rounded bg-gray-200 dark:bg-neutral-700" />
          <div class="space-y-3">
            <div class="h-10 rounded-lg bg-gray-100 dark:bg-neutral-700" />
            <div class="h-10 rounded-lg bg-gray-100 dark:bg-neutral-700" />
          </div>
        </div>
      </div>

      <!-- Fetch Error -->
      <div v-else-if="fetchError" class="py-20 text-center">
        <p class="mb-3 text-red-500 dark:text-red-400">
          Failed to load product.
        </p>
        <NuxtLink
          :to="`/seller/${storeSlug}/products`"
          class="text-sm text-brand hover:underline"
          >Back to products</NuxtLink
        >
      </div>

      <template v-else>
        <!-- Tab Nav -->
        <div
          class="mb-6 flex w-fit gap-1 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="[
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300',
            ]"
            @click="activeTab = tab.id"
          >
            <Icon :name="tab.icon" size="15" />
            {{ tab.label }}
          </button>
        </div>

        <!-- ── DETAILS TAB ── -->
        <form
          v-show="activeTab === 'details'"
          class="space-y-6"
          @submit.prevent="handleSubmit"
        >
          <!-- Error / Success banners -->
          <div
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          >
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
          <div
            v-if="successMsg"
            class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
          >
            <p class="text-sm text-green-600 dark:text-green-400">
              {{ successMsg }}
            </p>
          </div>

          <!-- ── Product Images ── -->
          <div
            class="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <h2 class="font-semibold text-gray-900 dark:text-neutral-100">
              Product Images
            </h2>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              Up to 5 images. First image is the cover.
            </p>

            <!-- Image grid -->
            <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
              <!-- Existing images not yet removed -->
              <div
                v-for="(img, i) in visibleExistingMedia"
                :key="'existing-' + img.id"
                class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <img
                  :src="img.type === 'VIDEO' ? videoThumb(img.url) : img.url"
                  class="h-full w-full object-cover"
                />
                <Icon
                  v-if="img.type === 'VIDEO'"
                  name="mdi:play-circle"
                  size="18"
                  class="pointer-events-none absolute right-1.5 top-1.5 text-white drop-shadow-lg"
                />
                <div
                  v-if="i === 0 && newMediaItems.length === 0"
                  class="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white"
                >
                  Cover
                </div>
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  @click="removeExistingMedia(img.id)"
                >
                  <Icon name="mdi:close" size="12" />
                </button>
              </div>

              <!-- New uploaded images -->
              <div
                v-for="(img, i) in newMediaItems"
                :key="'new-' + i"
                class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <img :src="img.preview" class="h-full w-full object-cover" />
                <div
                  v-if="img.uploading"
                  class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55"
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    class="-rotate-90"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      stroke-width="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#F43F5E"
                      stroke-width="3"
                      stroke-linecap="round"
                      :stroke-dasharray="`${2 * Math.PI * 14}`"
                      :stroke-dashoffset="`${2 * Math.PI * 14 * (1 - img.progress / 100)}`"
                      style="transition: stroke-dashoffset 0.15s ease"
                    />
                  </svg>
                  <span class="text-[11px] font-bold text-white"
                    >{{ img.progress }}%</span
                  >
                </div>
                <div
                  v-if="visibleExistingMedia.length === 0 && i === 0"
                  class="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white"
                >
                  Cover
                </div>
                <button
                  type="button"
                  class="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  @click="removeNewMedia(i)"
                >
                  <Icon name="mdi:close" size="12" />
                </button>
              </div>

              <!-- Add image button -->
              <label
                v-if="totalImageCount < 5"
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

            <!-- Background Music -->
            <div
              class="mt-4 border-t border-gray-100 pt-4 dark:border-neutral-700"
            >
              <h3
                class="mb-2 text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Background Music (optional)
              </h3>

              <!-- Existing bg music -->
              <div
                v-if="existingBgMusic && !bgMusicRemoved && !newBgMusic"
                class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-neutral-900"
              >
                <Icon
                  name="mdi:music-note"
                  size="20"
                  class="flex-shrink-0 text-brand"
                />
                <span
                  class="flex-1 truncate text-sm text-gray-700 dark:text-neutral-300"
                >
                  Current background music
                </span>
                <a
                  :href="existingBgMusic.url"
                  target="_blank"
                  class="flex-shrink-0 text-xs text-brand hover:underline"
                  >Preview</a
                >
                <button
                  type="button"
                  class="flex-shrink-0 text-gray-400 hover:text-red-500"
                  @click="bgMusicRemoved = true"
                >
                  <Icon name="mdi:close" size="16" />
                </button>
              </div>

              <!-- New bg music -->
              <div
                v-else-if="newBgMusic"
                class="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-neutral-900"
              >
                <Icon
                  name="mdi:music-note"
                  size="20"
                  class="flex-shrink-0 text-brand"
                />
                <span
                  class="flex-1 truncate text-sm text-gray-700 dark:text-neutral-300"
                >
                  {{ newBgMusic.name }}
                </span>
                <div v-if="bgMusicUploading" class="flex-shrink-0">
                  <Icon
                    name="mdi:loading"
                    size="16"
                    class="animate-spin text-brand"
                  />
                </div>
                <button
                  type="button"
                  class="flex-shrink-0 text-gray-400 hover:text-red-500"
                  @click="newBgMusic = null"
                >
                  <Icon name="mdi:close" size="16" />
                </button>
              </div>

              <!-- Upload button -->
              <label
                v-else
                class="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 transition-colors hover:border-brand hover:bg-brand/5 dark:border-neutral-600"
              >
                <Icon
                  name="mdi:music-plus"
                  size="18"
                  class="text-gray-400 dark:text-neutral-500"
                />
                <span class="text-sm text-gray-500 dark:text-neutral-400">
                  {{
                    bgMusicRemoved
                      ? 'Add new background music'
                      : 'Add background music'
                  }}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  class="hidden"
                  @change="onBgMusicSelected"
                />
              </label>
            </div>
          </div>

          <!-- Basic Info -->
          <ProductBasicInfo :form="form" />

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

          <!-- Flags -->
          <div
            class="rounded-xl border border-gray-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <h2 class="mb-4 font-semibold text-gray-900 dark:text-neutral-100">
              Product Flags
            </h2>
            <div class="grid grid-cols-3 gap-4">
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  v-model="form.isFeatured"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span class="text-sm text-gray-700 dark:text-neutral-300"
                  >Featured</span
                >
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  v-model="form.isThrift"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span class="text-sm text-gray-700 dark:text-neutral-300"
                  >Thrift</span
                >
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  v-model="form.isAccessory"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span class="text-sm text-gray-700 dark:text-neutral-300"
                  >Accessory</span
                >
              </label>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex gap-3">
            <NuxtLink
              :to="`/seller/${storeSlug}/products`"
              class="flex-1 rounded-xl border border-gray-200 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="isLoading || isAnyUploading"
              class="flex-1 rounded-xl bg-brand py-3 font-semibold text-white transition-colors hover:bg-[#d81b36] disabled:opacity-50"
            >
              {{
                isAnyUploading
                  ? 'Uploading...'
                  : isLoading
                    ? 'Saving...'
                    : 'Save Changes'
              }}
            </button>
          </div>
        </form>

        <!-- ── PROMOTE TAB ── -->
        <div v-show="activeTab === 'promote'" class="space-y-4">
          <!-- AI Magic Lister trigger (when cover image exists) -->
          <div
            v-if="currentCoverUrl"
            class="flex flex-col items-start justify-between gap-4 rounded-xl border border-brand/20 bg-gradient-to-r from-brand/10 to-purple-600/10 p-4 sm:flex-row sm:items-center dark:from-brand/20 dark:to-purple-600/20"
          >
            <div>
              <h3
                class="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white"
              >
                <Icon name="mdi:magic-staff" class="text-brand" size="18" />
                AI Magic Lister
              </h3>
              <p class="mt-1 max-w-sm text-xs text-gray-600 dark:text-gray-300">
                Re-analyze your cover image to regenerate all captions from
                scratch.
              </p>
            </div>
            <button
              type="button"
              :disabled="isGeneratingAI"
              class="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 sm:w-auto dark:bg-white dark:text-gray-900"
              @click="runAiMagic"
            >
              <Icon
                v-if="isGeneratingAI"
                name="eos-icons:loading"
                class="animate-spin"
                size="18"
              />
              <Icon v-else name="mdi:creation" size="18" />
              {{ isGeneratingAI ? 'Generating...' : 'Regenerate Captions' }}
            </button>
          </div>

          <ProductPromotePanel
            :product-id="productId"
            :initial-captions="socialCaptions"
            :cover-image-url="currentCoverUrl"
            :is-generating="isGeneratingAI"
            @regenerate="runAiMagic"
            @saved="onCaptionsSaved"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { definePageMeta } from '#app'
import { useRoute } from 'vue-router'
import { notify } from '@kyvg/vue3-notification'
import { useProduct } from '~~/layers/commerce/app/composables/useProduct'
import { useProductApi } from '~~/layers/commerce/app/services/product.api'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { useAiApi } from '~~/layers/core/app/services/ai.api'
import { extractErrorMessage } from '~~/layers/core/app/utils/errors'
import { videoThumb } from '~~/layers/core/app/utils/cloudinary'

import ProductPromotePanel from '~~/layers/seller/app/components/ProductPromotePanel.vue'
import SaveStatusOverlay from '~~/layers/core/app/components/SaveStatusOverlay.vue'
import ProductBasicInfo from '~~/layers/seller/app/components/product-form/ProductBasicInfo.vue'
import ProductVariantsSection from '~~/layers/seller/app/components/product-form/ProductVariantsSection.vue'
import VolumeOffersSection from '~~/layers/seller/app/components/product-form/VolumeOffersSection.vue'
import ProductCategoriesSection from '~~/layers/seller/app/components/product-form/ProductCategoriesSection.vue'
import ProductTagsSection from '~~/layers/seller/app/components/product-form/ProductTagsSection.vue'

definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const route = useRoute()
const storeSlug = computed(() => route.params.storeSlug as string)
const productId = computed(() => Number(route.params.id))

const { updateProduct, isLoading, error } = useProduct()
const saveSuccess = ref(false)
const productApi = useProductApi()
const { uploadMedia } = useMediaUpload()
const aiApi = useAiApi()

const tabs = [
  { id: 'details', label: 'Details', icon: 'mdi:pencil-outline' },
  { id: 'promote', label: 'Promote', icon: 'mdi:rocket-launch-outline' },
]
const activeTab = ref<'details' | 'promote'>(
  route.query.tab === 'promote' ? 'promote' : 'details',
)

const isFetching = ref(true)
const fetchError = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// ── Media state ───────────────────────────────────────────────────────────────
interface ExistingMedia {
  id: string
  url: string
  type: string
  isBgMusic: boolean
}

interface NewMediaItem {
  preview: string
  file: File
  uploading: boolean
  progress: number
  result: { url: string; public_id: string; type: string } | null
}

const existingMedia = ref<ExistingMedia[]>([])
const removedMediaIds = ref<string[]>([])
const newMediaItems = ref<NewMediaItem[]>([])

const existingBgMusic = ref<ExistingMedia | null>(null)
const bgMusicRemoved = ref(false)
const newBgMusic = ref<{
  name: string
  file: File
  result: { url: string; public_id: string } | null
} | null>(null)
const bgMusicUploading = ref(false)

const visibleExistingMedia = computed(() =>
  existingMedia.value.filter((m) => !removedMediaIds.value.includes(m.id)),
)

const totalImageCount = computed(
  () => visibleExistingMedia.value.length + newMediaItems.value.length,
)

const currentCoverUrl = computed(
  () =>
    visibleExistingMedia.value[0]?.url ||
    newMediaItems.value[0]?.result?.url ||
    null,
)

const isAnyUploading = computed(
  () => newMediaItems.value.some((m) => m.uploading) || bgMusicUploading.value,
)

const onImagesSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || []).slice(
    0,
    5 - totalImageCount.value,
  )
  input.value = ''

  for (const file of files) {
    const item: NewMediaItem = {
      preview: URL.createObjectURL(file),
      file,
      uploading: true,
      progress: 0,
      result: null,
    }
    newMediaItems.value.push(item)
    const idx = newMediaItems.value.length - 1

    try {
      const res = await uploadMedia({ file }, (pct) => {
        if (newMediaItems.value[idx]) newMediaItems.value[idx].progress = pct
      })
      if (newMediaItems.value[idx]) {
        newMediaItems.value[idx].result = res
        newMediaItems.value[idx].uploading = false
      }
    } catch {
      newMediaItems.value.splice(idx, 1)
    }
  }
}

const removeExistingMedia = (id: string) => {
  removedMediaIds.value.push(id)
}

const removeNewMedia = (i: number) => {
  const item = newMediaItems.value[i]
  if (item?.preview) URL.revokeObjectURL(item.preview)
  newMediaItems.value.splice(i, 1)
}

const onBgMusicSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  newBgMusic.value = { name: file.name, file, result: null }
  bgMusicUploading.value = true

  try {
    const res = await uploadMedia({ file })
    if (newBgMusic.value) newBgMusic.value.result = res
  } catch {
    newBgMusic.value = null
  } finally {
    bgMusicUploading.value = false
  }
}

// ── Form state ────────────────────────────────────────────────────────────────
const form = reactive({
  title: '',
  description: '',
  price: 0,
  discount: 0,
  affiliateCommission: null as number | null,
  SKU: '',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  isFeatured: false,
  isThrift: false,
  isAccessory: false,
  categoryIds: [] as number[],
  tagNames: [] as string[],
  variants: [] as Array<{ size: string; price: number | null; stock: number }>,
  offers: [] as Array<{
    minQuantity: number | null
    discount: number | null
    label: string
  }>,
})

const socialCaptions = reactive({
  instagram: '',
  facebook: '',
  pinterest: '',
})

const categories = ref<Array<{ id: number; name: string; slug: string }>>([])
const categoriesLoading = ref(false)

onMounted(async () => {
  categoriesLoading.value = true

  const [, catRes] = await Promise.allSettled([
    (async () => {
      try {
        // Fetch fresh from API — bypass cache for edit page
        const result: any = await productApi.getProductById(productId.value)
        const product = result.data
        if (product) {
          form.title = product.title || ''
          form.description = product.description || ''
          form.price = Number(product.price) || 0
          form.discount = Number(product.discount) || 0
          form.SKU = product.SKU || ''
          form.status = product.status || 'DRAFT'
          form.isFeatured = product.isFeatured ?? false
          form.isThrift = product.isThrift ?? false
          form.isAccessory = product.isAccessory ?? false
          form.affiliateCommission = product.affiliateCommission ?? null
          form.categoryIds = (product.category || []).map(
            (c: any) => c.category.id,
          )
          form.tagNames = (product.tags || [])
            .map((t: any) => t.tag?.name ?? t.name)
            .filter(Boolean)

          // Load existing media
          const allMedia: ExistingMedia[] = (product.media || []).map(
            (m: any) => ({
              id: m.id,
              url: m.url,
              type: m.type,
              isBgMusic: m.isBgMusic,
            }),
          )
          existingMedia.value = allMedia.filter((m) => !m.isBgMusic)
          existingBgMusic.value = allMedia.find((m) => m.isBgMusic) ?? null

          // Load variants
          form.variants = (product.variants || []).map((v: any) => ({
            size: v.size || '',
            price: v.price ?? null,
            stock: v.stock ?? 0,
          }))

          // Load offers
          form.offers = (product.offers || []).map((o: any) => ({
            minQuantity: o.minQuantity,
            discount: o.discount,
            label: o.label || '',
          }))

          // Load social captions
          const sc = product.socialCaptions as any
          if (sc) {
            socialCaptions.instagram = sc.instagram || ''
            socialCaptions.facebook = sc.facebook || ''
            socialCaptions.pinterest = sc.pinterest || ''
          }
        }
      } catch (e: any) {
        fetchError.value = extractErrorMessage(e, 'Failed to load product')
      } finally {
        isFetching.value = false
      }
    })(),
    productApi.getCategories(),
  ])

  if (catRes.status === 'fulfilled')
    categories.value = (catRes.value as any).data || []
  categoriesLoading.value = false
})

const handleSubmit = async () => {
  successMsg.value = null
  try {
    const payload: any = {
      title: form.title,
      description: form.description,
      price: form.price,
      discount: form.discount,
      status: form.status,
      isFeatured: form.isFeatured,
      isThrift: form.isThrift,
      isAccessory: form.isAccessory,
    }

    if (form.SKU) payload.SKU = form.SKU
    payload.affiliateCommission =
      form.affiliateCommission && form.affiliateCommission > 0
        ? form.affiliateCommission
        : null
    payload.categoryIds = form.categoryIds
    payload.tagNames = form.tagNames

    // Variants (replace all)
    payload.variants = form.variants
      .filter((v) => v.size)
      .map((v) => ({
        size: v.size,
        price: v.price ?? undefined,
        stock: v.stock,
      }))

    // Offers (replace all)
    const validOffers = form.offers.filter(
      (o) =>
        o.minQuantity && o.minQuantity >= 2 && o.discount && o.discount > 0,
    )
    payload.offers = validOffers.map((o) => ({
      minQuantity: o.minQuantity!,
      discount: o.discount!,
      label: o.label || undefined,
    }))

    // New media to add
    const uploaded = newMediaItems.value.filter((m) => m.result)
    if (uploaded.length) {
      payload.mediaItems = uploaded.map((m) => ({
        url: m.result!.url,
        public_id: m.result!.public_id,
        type: m.result!.type || 'IMAGE',
      }))
    }

    // Existing media to remove
    if (removedMediaIds.value.length) {
      payload.removeMediaIds = removedMediaIds.value
    }

    // New bg music
    if (newBgMusic.value?.result) {
      payload.bgMusic = {
        url: newBgMusic.value.result.url,
        public_id: newBgMusic.value.result.public_id,
      }
    }

    // Remove existing bg music
    if (bgMusicRemoved.value && !newBgMusic.value) {
      payload.removeBgMusic = true
    }

    await updateProduct(productId.value, payload)
    saveSuccess.value = true
    successMsg.value = 'Product updated successfully!'
    setTimeout(() => {
      successMsg.value = null
      saveSuccess.value = false
    }, 3000)
  } catch {
    // error is reactive from composable
  }
}

// ── AI Magic on the Promote tab ───────────────────────────────────────────────
const isGeneratingAI = ref(false)

const fileToBase64 = (
  url: string,
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = () => {
          const result = reader.result as string
          resolve({ base64: result.split(',')[1], mimeType: blob.type })
        }
        reader.onerror = reject
      })
      .catch(reject)
  })
}

const runAiMagic = async () => {
  if (!currentCoverUrl.value) return
  isGeneratingAI.value = true
  try {
    const { base64, mimeType } = await fileToBase64(currentCoverUrl.value)
    const response = await aiApi.generateListing(
      base64,
      mimeType,
      form.isThrift ? 'This is a thrift/vintage item.' : '',
    )

    if (response.success && response.data?.socialCaptions) {
      const sc = response.data.socialCaptions
      socialCaptions.instagram = sc.instagram || ''
      socialCaptions.facebook = sc.facebook || ''
      socialCaptions.pinterest = sc.pinterest || ''
      notify({
        type: 'success',
        text: '✨ Captions regenerated! Review and save.',
      })
    }
  } catch {
    notify({ type: 'error', text: 'AI generation failed. Please try again.' })
  } finally {
    isGeneratingAI.value = false
  }
}

const onCaptionsSaved = (captions: any) => {
  socialCaptions.instagram = captions.instagram
  socialCaptions.facebook = captions.facebook
  socialCaptions.pinterest = captions.pinterest
}
</script>
