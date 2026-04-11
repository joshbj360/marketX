<template>
  <HomeLayout :narrow-feed="true" :hide-right-sidebar="true">
    <div class="mx-auto w-full max-w-xl pb-20 md:pb-6">
      <!-- Back -->
      <NuxtLink
        to="/sellers/dashboard"
        class="mb-5 inline-flex items-center gap-1.5 text-[13px] text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-neutral-300"
      >
        <Icon name="mdi:arrow-left" size="16" />
        Back to My Stores
      </NuxtLink>

      <h1
        class="mb-1 text-[22px] font-bold text-gray-900 dark:text-neutral-100"
      >
        Create a Store
      </h1>
      <p class="mb-6 text-[13px] text-gray-400 dark:text-neutral-500">
        Set up your seller profile to start listing products
      </p>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Logo + Banner upload row -->
        <div class="space-y-3">
          <!-- Banner -->
          <div>
            <label
              class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
              >Store Banner</label
            >
            <div
              class="group relative h-32 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-brand dark:border-neutral-700 dark:bg-neutral-800"
              :style="
                bannerPreview
                  ? {
                      backgroundImage: `url(${bannerPreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : {}
              "
              @click="bannerInput?.click()"
            >
              <div
                v-if="!bannerPreview"
                class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400"
              >
                <Icon name="mdi:image-plus-outline" size="28" />
                <span class="text-[11px] font-medium"
                  >Upload banner (recommended: 1200×400)</span
                >
              </div>
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30"
              >
                <Icon
                  name="mdi:pencil"
                  size="22"
                  class="text-white opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <div
                v-if="isUploadingBanner"
                class="absolute inset-0 flex items-center justify-center bg-black/40"
              >
                <Icon
                  name="eos-icons:loading"
                  size="24"
                  class="animate-spin text-white"
                />
              </div>
            </div>
            <input
              ref="bannerInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleBannerUpload"
            />
          </div>

          <!-- Logo -->
          <div class="flex items-center gap-4">
            <div
              class="group relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-brand dark:border-neutral-700 dark:bg-neutral-800"
              @click="logoInput?.click()"
            >
              <img
                v-if="logoPreview"
                :src="logoPreview"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full flex-col items-center justify-center text-gray-400"
              >
                <Icon name="mdi:store-plus-outline" size="22" />
              </div>
              <div
                v-if="isUploadingLogo"
                class="absolute inset-0 flex items-center justify-center bg-black/40"
              >
                <Icon
                  name="eos-icons:loading"
                  size="16"
                  class="animate-spin text-white"
                />
              </div>
            </div>
            <div>
              <p
                class="text-[13px] font-semibold text-gray-700 dark:text-neutral-300"
              >
                Store Logo
              </p>
              <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                Square image, at least 200×200px
              </p>
              <button
                type="button"
                @click="logoInput?.click()"
                class="mt-1 text-[11px] font-semibold text-brand transition-colors hover:text-[#d81b36]"
              >
                {{ logoPreview ? 'Change logo' : 'Upload logo' }}
              </button>
            </div>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleLogoUpload"
            />
          </div>
        </div>

        <!-- Store Name -->
        <div>
          <label
            class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
            >Store Name <span class="text-brand">*</span></label
          >
          <input
            v-model="form.store_name"
            type="text"
            placeholder="e.g. Lagos Streetwear Co."
            maxlength="100"
            class="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 dark:bg-neutral-800 dark:text-neutral-100"
            :class="
              fieldErrors.store_name
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-gray-200 focus:border-brand focus:ring-brand/20 dark:border-neutral-700'
            "
            @input="onNameChange"
          />
          <p
            v-if="fieldErrors.store_name"
            class="mt-1 text-[11px] text-red-500"
          >
            {{ fieldErrors.store_name }}
          </p>
        </div>

        <!-- Slug -->
        <div>
          <label
            class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
            >Store URL <span class="text-brand">*</span></label
          >
          <div class="relative">
            <span
              class="absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-[13px] text-gray-400 dark:text-neutral-500"
              >{{
                $config.public.brandDomain || 'stylex.indicestech.com'
              }}/sellers/</span
            >
            <input
              v-model="form.store_slug"
              type="text"
              placeholder="your-store"
              maxlength="50"
              required
              class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-[144px] pr-10 text-[14px] text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              :class="
                slugStatus === 'available'
                  ? 'border-emerald-400 focus:ring-emerald-400/20'
                  : slugStatus === 'taken'
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'focus:border-brand focus:ring-brand/20'
              "
              @input="onSlugInput"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
              <Icon
                v-if="slugStatus === 'available'"
                name="mdi:check-circle"
                size="18"
                class="text-emerald-500"
              />
              <Icon
                v-else-if="slugStatus === 'taken'"
                name="mdi:close-circle"
                size="18"
                class="text-red-500"
              />
              <Icon
                v-else-if="slugChecking"
                name="eos-icons:loading"
                size="16"
                class="animate-spin text-gray-400"
              />
            </div>
          </div>
          <p
            v-if="fieldErrors.store_slug"
            class="mt-1 text-[11px] text-red-500"
          >
            {{ fieldErrors.store_slug }}
          </p>
          <p
            v-else-if="slugStatus === 'available'"
            class="mt-1 text-[11px] text-emerald-600"
          >
            Available!
          </p>

          <!-- Suggestions -->
          <div
            v-if="slugSuggestions.length"
            class="mt-2 flex flex-wrap gap-1.5"
          >
            <button
              v-for="s in slugSuggestions"
              :key="s"
              type="button"
              @click="pickSuggestion(s)"
              class="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/60"
            >
              {{ s }}
            </button>
          </div>
          <button
            v-if="form.store_name && !slugSuggestions.length"
            type="button"
            @click="loadSuggestions"
            class="mt-1.5 text-[11px] font-semibold text-brand transition-colors hover:text-[#d81b36]"
          >
            Get suggestions →
          </button>
        </div>

        <!-- Currency -->
        <div>
          <label
            class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
            >Store Currency</label
          >
          <select
            v-model="form.default_currency"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-900 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option v-for="c in SUPPORTED_CURRENCIES" :key="c" :value="c">
              {{ c }}
            </option>
          </select>
          <p class="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
            All product prices in your store will use this currency
          </p>
        </div>

        <!-- Description -->
        <div>
          <label
            class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
            >Description
            <span class="font-normal text-gray-400">(optional)</span></label
          >
          <textarea
            v-model="form.store_description"
            placeholder="Tell buyers about your store…"
            rows="3"
            maxlength="500"
            class="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <p class="mt-0.5 text-right text-[11px] text-gray-400">
            {{ form.store_description?.length ?? 0 }}/500
          </p>
        </div>

        <!-- Location + Phone -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label
              class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
              >Location
              <span class="font-normal text-gray-400">(optional)</span></label
            >
            <input
              v-model="form.store_location"
              type="text"
              placeholder="Lagos, Nigeria"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label
              class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
              >Phone
              <span class="font-normal text-gray-400">(optional)</span></label
            >
            <input
              v-model="form.store_phone"
              type="tel"
              placeholder="+2348012345678"
              class="w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 dark:bg-neutral-800 dark:text-neutral-100"
              :class="
                fieldErrors.store_phone
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-gray-200 focus:border-brand focus:ring-brand/20 dark:border-neutral-700'
              "
              @input="clearFieldError('store_phone')"
              @blur="
                () => {
                  const e = validatePhone(form.store_phone)
                  if (e) fieldErrors.store_phone = e
                }
              "
            />
            <p
              v-if="fieldErrors.store_phone"
              class="mt-1 text-[11px] text-red-500"
            >
              {{ fieldErrors.store_phone }}
            </p>
          </div>
        </div>

        <!-- Website -->
        <div>
          <label
            class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
            >Website
            <span class="font-normal text-gray-400">(optional)</span></label
          >
          <input
            v-model="form.store_website"
            type="url"
            placeholder="https://yourstore.com"
            class="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 dark:bg-neutral-800 dark:text-neutral-100"
            :class="
              fieldErrors.store_website
                ? 'border-red-400 focus:ring-red-400/20'
                : 'border-gray-200 focus:border-brand focus:ring-brand/20 dark:border-neutral-700'
            "
            @input="clearFieldError('store_website')"
            @blur="
              () => {
                const e = validateWebsite(form.store_website)
                if (e) fieldErrors.store_website = e
              }
            "
          />
          <p
            v-if="fieldErrors.store_website"
            class="mt-1 text-[11px] text-red-500"
          >
            {{ fieldErrors.store_website }}
          </p>
        </div>

        <!-- Shipping Origin accordion -->
        <div
          class="overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-700"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50"
            @click="shipFromOpen = !shipFromOpen"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10"
              >
                <Icon
                  name="mdi:truck-fast-outline"
                  size="16"
                  class="text-brand"
                />
              </div>
              <div>
                <p
                  class="text-[13px] font-semibold text-gray-800 dark:text-neutral-200"
                >
                  Shipping Origin
                  <span
                    class="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400 dark:bg-neutral-800 dark:text-neutral-500"
                    >optional</span
                  >
                </p>
                <p class="text-[11px] text-gray-400 dark:text-neutral-500">
                  Where you ship products from — enables live carrier rates
                </p>
              </div>
            </div>
            <Icon
              name="mdi:chevron-down"
              size="18"
              class="shrink-0 text-gray-400 transition-transform duration-200"
              :class="shipFromOpen ? 'rotate-180' : ''"
            />
          </button>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="shipFromOpen"
              class="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3 dark:border-neutral-700"
            >
              <p
                class="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[11px] text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
              >
                <Icon
                  name="mdi:information-outline"
                  size="14"
                  class="mt-0.5 shrink-0"
                />
                Setting this now enables live DHL/UPS rates at checkout for your
                buyers. You can always update it in your store settings.
              </p>

              <!-- Contact name -->
              <div>
                <label
                  class="mb-1 block text-[11px] font-semibold text-gray-500 dark:text-neutral-400"
                  >Contact Name</label
                >
                <input
                  v-model="form.shipFromName"
                  type="text"
                  placeholder="Sender full name"
                  class="input-sm"
                />
              </div>

              <!-- Address -->
              <div>
                <label
                  class="mb-1 block text-[11px] font-semibold text-gray-500 dark:text-neutral-400"
                  >Street Address</label
                >
                <input
                  v-model="form.shipFromAddress"
                  type="text"
                  placeholder="123 Broad Street"
                  class="input-sm"
                />
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    class="mb-1 block text-[11px] font-semibold text-gray-500 dark:text-neutral-400"
                    >City</label
                  >
                  <input
                    v-model="form.shipFromCity"
                    type="text"
                    placeholder="Lagos"
                    class="input-sm"
                  />
                </div>
                <div>
                  <label
                    class="mb-1 block text-[11px] font-semibold text-gray-500 dark:text-neutral-400"
                    >State / Region</label
                  >
                  <input
                    v-model="form.shipFromState"
                    type="text"
                    placeholder="Lagos State"
                    class="input-sm"
                  />
                </div>
                <div>
                  <label
                    class="mb-1 block text-[11px] font-semibold text-gray-500 dark:text-neutral-400"
                    >Postal / ZIP Code</label
                  >
                  <input
                    v-model="form.shipFromZip"
                    type="text"
                    placeholder="100001"
                    class="input-sm"
                  />
                </div>
                <div>
                  <label
                    class="mb-1 block text-[11px] font-semibold text-gray-500 dark:text-neutral-400"
                    >Country</label
                  >
                  <select v-model="form.shipFromCountry" class="input-sm">
                    <option
                      v-for="c in SHIP_COUNTRIES"
                      :key="c.code"
                      :value="c.code"
                    >
                      {{ c.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  class="mb-1 block text-[11px] font-semibold text-gray-500 dark:text-neutral-400"
                  >Phone (carrier pickup)</label
                >
                <input
                  v-model="form.shipFromPhone"
                  type="tel"
                  placeholder="+2348012345678"
                  class="input-sm"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="
            isSubmitting ||
            slugStatus === 'taken' ||
            slugChecking ||
            Object.values(fieldErrors).some(Boolean)
          "
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-[14px] font-bold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon
            v-if="isSubmitting"
            name="eos-icons:loading"
            size="18"
            class="animate-spin"
          />
          {{ isSubmitting ? 'Creating store…' : 'Create Store' }}
        </button>
      </form>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { SUPPORTED_CURRENCIES } from '~~/shared/utils/currency'

definePageMeta({ middleware: 'auth' })

const SHIP_COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'SN', name: 'Senegal' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
]

const { createSeller, checkSlugAvailability, suggestSlugs, error } =
  useSellerManagement()
const { uploadMedia } = useMediaUpload()

const logoInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)
const logoPreview = ref('')
const bannerPreview = ref('')
const isUploadingLogo = ref(false)
const isUploadingBanner = ref(false)
const isSubmitting = ref(false)
const shipFromOpen = ref(false)

const form = reactive({
  store_name: '',
  store_slug: '',
  store_description: '',
  store_location: '',
  store_phone: '',
  store_website: '',
  store_logo: '',
  store_banner: '',
  default_currency: 'NGN' as string,
  shipFromName: '',
  shipFromAddress: '',
  shipFromCity: '',
  shipFromState: '',
  shipFromZip: '',
  shipFromCountry: 'NG',
  shipFromPhone: '',
})

// Per-field inline errors
const fieldErrors = reactive<Record<string, string>>({})
const clearFieldError = (field: string) => {
  fieldErrors[field] = ''
}

// ── Client-side validation ──────────────────────────────────────────────────

const PHONE_RE = /^\+?[1-9]\d{6,14}$/

const validatePhone = (raw: string): string | null => {
  if (!raw.trim()) return null // optional
  const stripped = raw.replace(/[\s\-().]/g, '')
  if (!PHONE_RE.test(stripped))
    return 'Phone must be in international format, e.g. +2348012345678'
  return null
}

const validateWebsite = (raw: string): string | null => {
  if (!raw.trim()) return null
  try {
    new URL(raw.trim())
    return null
  } catch {
    return 'Website must be a valid URL, e.g. https://yourstore.com'
  }
}

const validateForm = (): boolean => {
  let valid = true

  if (!form.store_name.trim() || form.store_name.trim().length < 3) {
    fieldErrors.store_name = 'Store name must be at least 3 characters'
    valid = false
  }
  if (!form.store_slug.trim() || form.store_slug.trim().length < 3) {
    fieldErrors.store_slug = 'Store URL must be at least 3 characters'
    valid = false
  } else if (slugStatus.value === 'taken') {
    fieldErrors.store_slug = 'This URL is already taken — choose another'
    valid = false
  }

  const phoneErr = validatePhone(form.store_phone)
  if (phoneErr) {
    fieldErrors.store_phone = phoneErr
    valid = false
  }

  const webErr = validateWebsite(form.store_website)
  if (webErr) {
    fieldErrors.store_website = webErr
    valid = false
  }

  return valid
}

// ── Slug checker ────────────────────────────────────────────────────────────

const slugStatus = ref<'idle' | 'available' | 'taken'>('idle')
const slugChecking = ref(false)
const slugSuggestions = ref<string[]>([])
let slugTimer: ReturnType<typeof setTimeout> | null = null

const onNameChange = () => {
  clearFieldError('store_name')
  const base = form.store_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (!form.store_slug) {
    form.store_slug = base
    triggerSlugCheck()
  }
}

const onSlugInput = () => {
  clearFieldError('store_slug')
  slugStatus.value = 'idle'
  slugSuggestions.value = []
  triggerSlugCheck()
}

const triggerSlugCheck = () => {
  if (slugTimer) clearTimeout(slugTimer)
  slugTimer = setTimeout(async () => {
    const slug = form.store_slug
    if (!slug || slug.length < 3) return
    slugChecking.value = true
    const available = await checkSlugAvailability(slug)
    slugStatus.value = available ? 'available' : 'taken'
    if (!available)
      fieldErrors.store_slug = 'This URL is already taken — choose another'
    slugChecking.value = false
  }, 500)
}

const loadSuggestions = async () => {
  if (!form.store_name) return
  const suggestions = await suggestSlugs(form.store_name)
  slugSuggestions.value = suggestions.slice(0, 4)
}

const pickSuggestion = (s: string) => {
  form.store_slug = s
  slugSuggestions.value = []
  slugStatus.value = 'available'
  fieldErrors.store_slug = ''
}

// ── Media uploads ───────────────────────────────────────────────────────────

const handleLogoUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploadingLogo.value = true
  try {
    const result = await uploadMedia({ file })
    form.store_logo = result.url
    logoPreview.value = result.url
  } finally {
    isUploadingLogo.value = false
  }
}

const handleBannerUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploadingBanner.value = true
  try {
    const result = await uploadMedia({ file })
    form.store_banner = result.url
    bannerPreview.value = result.url
  } finally {
    isUploadingBanner.value = false
  }
}

// ── Submit ──────────────────────────────────────────────────────────────────

const handleSubmit = async () => {
  if (isSubmitting.value) return

  // Reset field errors and run client validation
  Object.keys(fieldErrors).forEach((k) => {
    fieldErrors[k] = ''
  })
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    await createSeller({
      store_name: form.store_name,
      store_slug: form.store_slug,
      store_description: form.store_description || undefined,
      store_location: form.store_location || undefined,
      store_phone: form.store_phone || undefined,
      store_website: form.store_website || undefined,
      store_logo: form.store_logo || undefined,
      store_banner: form.store_banner || undefined,
      default_currency: form.default_currency,
      shipFromName: form.shipFromName || undefined,
      shipFromAddress: form.shipFromAddress || undefined,
      shipFromCity: form.shipFromCity || undefined,
      shipFromState: form.shipFromState || undefined,
      shipFromZip: form.shipFromZip || undefined,
      shipFromCountry: form.shipFromCountry || undefined,
      shipFromPhone: form.shipFromPhone || undefined,
    })
  } catch (err: any) {
    // Map API field errors back to inline messages
    if (err.fieldErrors) {
      Object.assign(fieldErrors, err.fieldErrors)
    }
  } finally {
    isSubmitting.value = false
  }
}

onUnmounted(() => {
  if (slugTimer) clearTimeout(slugTimer)
})
</script>

<style scoped>
.input-sm {
  @apply w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100;
}
</style>
