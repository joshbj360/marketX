<template>
  <div class="max-w-2xl px-4 py-6 sm:px-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
        Store Settings
      </h1>
      <p class="mt-1 text-[13px] text-gray-400 dark:text-neutral-500">
        @{{ storeSlug }}
      </p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pageLoading" class="animate-pulse space-y-4">
      <div class="h-32 rounded-2xl bg-gray-100 dark:bg-neutral-800" />
      <div class="h-10 rounded-xl bg-gray-100 dark:bg-neutral-800" />
      <div class="h-10 rounded-xl bg-gray-100 dark:bg-neutral-800" />
      <div class="h-10 rounded-xl bg-gray-100 dark:bg-neutral-800" />
    </div>

    <template v-else>
      <!-- Success -->
      <div
        v-if="saveSuccess"
        class="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
      >
        <Icon name="mdi:check-circle" size="16" />
        Store updated successfully!
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Banner -->
        <div
          class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2
            class="text-[14px] font-semibold text-gray-900 dark:text-neutral-100"
          >
            Store Branding
          </h2>

          <!-- Banner upload -->
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
                <span class="text-[11px] font-medium">Upload banner</span>
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

          <!-- Logo upload -->
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

        <!-- Store Info -->
        <div
          class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2
            class="text-[14px] font-semibold text-gray-900 dark:text-neutral-100"
          >
            Store Information
          </h2>

          <!-- Store Name -->
          <div>
            <label
              class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
            >
              Store Name <span class="text-brand">*</span>
            </label>
            <input
              v-model="form.store_name"
              type="text"
              maxlength="100"
              required
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-900 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <!-- Slug (read-only) -->
          <div>
            <label
              class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
            >
              Store URL
              <span class="text-[11px] font-normal text-gray-400"
                >(cannot be changed)</span
              >
            </label>
            <div
              class="w-full select-none rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-[14px] text-gray-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400"
            >
              {{
                $config.public.brandDomain || 'stylex.indicestech.com'
              }}/sellers/profile/{{ storeSlug }}
            </div>
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
          </div>

          <!-- Description -->
          <div>
            <label
              class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
              >Description</label
            >
            <textarea
              v-model="form.store_description"
              rows="3"
              maxlength="500"
              class="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <p class="mt-0.5 text-right text-[11px] text-gray-400">
              {{ form.store_description?.length ?? 0 }}/500
            </p>
          </div>
        </div>

        <!-- Contact -->
        <div
          class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <h2
            class="text-[14px] font-semibold text-gray-900 dark:text-neutral-100"
          >
            Contact & Location
          </h2>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >Location</label
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
                >Phone</label
              >
              <input
                v-model="form.store_phone"
                type="tel"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label
              class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
              >Website</label
            >
            <input
              v-model="form.store_website"
              type="url"
              placeholder="https://yourstore.com"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        </div>

        <!-- Map Discovery -->
        <div class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-[14px] font-semibold text-gray-900 dark:text-neutral-100">Map Discovery</h2>
              <p class="mt-0.5 text-[12px] text-gray-500 dark:text-neutral-400">Let buyers find your store on the Near Me map</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold transition"
              :class="form.hideLocation
                ? 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
                : 'bg-brand/10 text-brand'"
              @click="form.hideLocation = !form.hideLocation"
            >
              <Icon :name="form.hideLocation ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" size="15" />
              {{ form.hideLocation ? 'Hidden' : 'Visible on map' }}
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400">City</label>
              <input
                v-model="form.city"
                type="text"
                placeholder="Lagos"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400">State / Region</label>
              <input
                v-model="form.state"
                type="text"
                placeholder="Lagos State"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400">Display location label</label>
            <input
              v-model="form.locationLabel"
              type="text"
              placeholder="e.g. Yaba, Lagos"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="text-[12px] font-semibold text-gray-600 dark:text-neutral-400">GPS Coordinates</label>
              <button
                type="button"
                :disabled="gettingLocation"
                class="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:bg-brand/10 hover:text-brand disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300"
                @click="detectLocation"
              >
                <Icon :name="gettingLocation ? 'mdi:loading' : 'mdi:crosshairs-gps'" size="13" :class="gettingLocation && 'animate-spin'" />
                {{ gettingLocation ? 'Detecting…' : 'Detect my location' }}
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <input
                v-model.number="form.latitude"
                type="number"
                step="0.000001"
                placeholder="Latitude e.g. 6.5244"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <input
                v-model.number="form.longitude"
                type="number"
                step="0.000001"
                placeholder="Longitude e.g. 3.3792"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <p class="mt-1.5 text-[11px] text-gray-400 dark:text-neutral-500">
              Used to show your store on the buyer map. City-level precision recommended.
            </p>
          </div>
        </div>

        <!-- Shipping Origin -->
        <div
          class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div>
            <h2
              class="text-[14px] font-semibold text-gray-900 dark:text-neutral-100"
            >
              Shipping Origin
            </h2>
            <p class="mt-0.5 text-[12px] text-gray-400 dark:text-neutral-500">
              Where your orders ship from. Used to calculate accurate shipping
              rates at checkout.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >Sender Name (for shipping labels)</label
              >
              <input
                v-model="form.shipFromName"
                type="text"
                placeholder="e.g. Lagos Warehouse"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div class="col-span-2">
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >Street Address <span class="text-brand">*</span></label
              >
              <input
                v-model="form.shipFromAddress"
                type="text"
                placeholder="123 Market Street"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >City <span class="text-brand">*</span></label
              >
              <input
                v-model="form.shipFromCity"
                type="text"
                placeholder="Lagos"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >State / Province</label
              >
              <input
                v-model="form.shipFromState"
                type="text"
                placeholder="Lagos State"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >Postal / ZIP Code</label
              >
              <input
                v-model="form.shipFromZip"
                type="text"
                placeholder="100001"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >Country</label
              >
              <select
                v-model="form.shipFromCountry"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option
                  v-for="c in SHIP_FROM_COUNTRIES"
                  :key="c.code"
                  :value="c.code"
                >
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div class="col-span-2">
              <label
                class="mb-1.5 block text-[12px] font-semibold text-gray-600 dark:text-neutral-400"
                >Contact Phone</label
              >
              <input
                v-model="form.shipFromPhone"
                type="tel"
                placeholder="+2348012345678"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div
            v-if="!form.shipFromAddress || !form.shipFromCity"
            class="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3 text-[12px] text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400"
          >
            <Icon name="mdi:alert-outline" size="14" class="mt-0.5 shrink-0" />
            Shipping rates won't be shown at checkout until you save your
            ship-from address and city.
          </div>
        </div>

        <!-- Save -->
        <button
          type="submit"
          :disabled="isSaving || isUploadingLogo || isUploadingBanner"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f02c56] to-purple-600 py-3.5 text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          <Icon
            v-if="isSaving"
            name="eos-icons:loading"
            size="18"
            class="animate-spin"
          />
          {{ isSaving ? 'Saving…' : 'Save Changes' }}
        </button>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSellerManagement } from '~~/layers/seller/app/composables/useSellerManagement'
import { useMediaUpload } from '~~/layers/core/app/composables/useMediaUpload'
import { SUPPORTED_CURRENCIES } from '~~/shared/utils/currency'

const SHIP_FROM_COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'CM', name: 'Cameroon' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'AE', name: 'UAE' },
  { code: 'CN', name: 'China' },
]

definePageMeta({ middleware: 'auth', layout: 'store-layout' })

const route = useRoute()
const storeSlug = computed(() => route.params.storeSlug as string)

const { loadPublicSeller, updateSeller, currentSeller, error, isLoading } =
  useSellerManagement()
const { uploadMedia } = useMediaUpload()

const pageLoading = ref(true)
const isSaving = ref(false)
const saveSuccess = ref(false)
const logoInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)
const logoPreview = ref('')
const bannerPreview = ref('')
const isUploadingLogo = ref(false)
const isUploadingBanner = ref(false)

const form = reactive({
  store_name: '',
  store_description: '',
  store_location: '',
  store_phone: '',
  store_website: '',
  store_logo: '',
  store_banner: '',
  default_currency: 'NGN' as string,
  // Shipping origin
  shipFromName: '',
  shipFromAddress: '',
  shipFromCity: '',
  shipFromState: '',
  shipFromZip: '',
  shipFromCountry: 'NG',
  shipFromPhone: '',
  // Map / Discovery
  latitude: null as number | null,
  longitude: null as number | null,
  city: '',
  state: '',
  locationLabel: '',
  hideLocation: false,
})

const gettingLocation = ref(false)

const detectLocation = () => {
  if (!navigator.geolocation) return
  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.latitude = Math.round(pos.coords.latitude * 1e6) / 1e6
      form.longitude = Math.round(pos.coords.longitude * 1e6) / 1e6
      gettingLocation.value = false
    },
    () => { gettingLocation.value = false },
    { enableHighAccuracy: false, timeout: 10000 },
  )
}

const prefillForm = (s: any) => {
  form.store_name = s.store_name ?? ''
  form.store_description = s.store_description ?? ''
  form.store_location = s.store_location ?? ''
  form.store_phone = s.store_phone ?? ''
  form.store_website = s.store_website ?? ''
  form.store_logo = s.store_logo ?? ''
  form.store_banner = s.store_banner ?? ''
  form.default_currency = s.default_currency ?? 'NGN'
  logoPreview.value = s.store_logo ?? ''
  bannerPreview.value = s.store_banner ?? ''
  // Shipping origin
  form.shipFromName = s.shipFromName ?? ''
  form.shipFromAddress = s.shipFromAddress ?? ''
  form.shipFromCity = s.shipFromCity ?? ''
  form.shipFromState = s.shipFromState ?? ''
  form.shipFromZip = s.shipFromZip ?? ''
  form.shipFromCountry = s.shipFromCountry ?? 'NG'
  form.shipFromPhone = s.shipFromPhone ?? ''
  // Map / Discovery
  form.latitude = s.latitude ?? null
  form.longitude = s.longitude ?? null
  form.city = s.city ?? ''
  form.state = s.state ?? ''
  form.locationLabel = s.locationLabel ?? ''
  form.hideLocation = s.hideLocation ?? false
}

onMounted(async () => {
  try {
    await loadPublicSeller(storeSlug.value)
    if (currentSeller.value) prefillForm(currentSeller.value)
  } finally {
    pageLoading.value = false
  }
})

watch(storeSlug, async (slug) => {
  pageLoading.value = true
  try {
    await loadPublicSeller(slug)
    if (currentSeller.value) prefillForm(currentSeller.value)
  } finally {
    pageLoading.value = false
  }
})

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

const handleSubmit = async () => {
  if (isSaving.value || !currentSeller.value) return
  isSaving.value = true
  saveSuccess.value = false
  try {
    await updateSeller(currentSeller.value.id, {
      store_name: form.store_name || undefined,
      store_description: form.store_description || undefined,
      store_location: form.store_location || undefined,
      store_phone: form.store_phone || undefined,
      store_website: form.store_website || undefined,
      store_logo: form.store_logo || undefined,
      store_banner: form.store_banner || undefined,
      default_currency: form.default_currency,
      // Shipping origin
      shipFromName: form.shipFromName || undefined,
      shipFromAddress: form.shipFromAddress || undefined,
      shipFromCity: form.shipFromCity || undefined,
      shipFromState: form.shipFromState || undefined,
      shipFromZip: form.shipFromZip || undefined,
      shipFromCountry: form.shipFromCountry || 'NG',
      shipFromPhone: form.shipFromPhone || undefined,
      // Map / Discovery
      latitude: form.latitude,
      longitude: form.longitude,
      city: form.city || undefined,
      state: form.state || undefined,
      locationLabel: form.locationLabel || undefined,
      hideLocation: form.hideLocation,
    } as any)
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } finally {
    isSaving.value = false
  }
}
</script>
