<template>
  <HomeLayout :narrow-feed="true" :hide-right-sidebar="true">
    <div class="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-6">
      <!-- Header -->
      <div class="mb-2 flex items-center gap-3">
        <button
          class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
          @click="$router.back()"
        >
          <Icon name="mdi:arrow-left" size="22" />
        </button>
        <h1 class="text-xl font-bold text-gray-900 dark:text-neutral-100">
          Settings
        </h1>
      </div>

      <!-- Appearance -->
      <section
        class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="border-b border-gray-100 px-5 py-3.5 dark:border-neutral-800"
        >
          <h2
            class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
          >
            Appearance
          </h2>
        </div>

        <!-- Dark mode -->
        <div
          class="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-neutral-800"
        >
          <div class="flex items-center gap-3">
            <Icon
              name="mdi:weather-night"
              size="20"
              class="text-gray-500 dark:text-neutral-400"
            />
            <div>
              <p
                class="text-sm font-medium text-gray-900 dark:text-neutral-100"
              >
                Dark Mode
              </p>
              <p class="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                Change app theme
              </p>
            </div>
          </div>
          <div
            class="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800"
          >
            <button
              v-for="opt in COLOR_MODES"
              :key="opt.value"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              :class="
                colorMode.preference === opt.value
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                  : 'text-gray-500 dark:text-neutral-400'
              "
              @click="colorMode.preference = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Text size -->
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            <Icon
              name="mdi:format-size"
              size="20"
              class="text-gray-500 dark:text-neutral-400"
            />
            <div>
              <p
                class="text-sm font-medium text-gray-900 dark:text-neutral-100"
              >
                Text Size
              </p>
              <p class="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                Adjust reading comfort
              </p>
            </div>
          </div>
          <div
            class="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-neutral-800"
          >
            <button
              v-for="opt in TEXT_SIZES"
              :key="opt.value"
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              :class="
                settings.textSize === opt.value
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                  : 'text-gray-500 dark:text-neutral-400'
              "
              @click="update('textSize', opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- Playback -->
      <section
        class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="border-b border-gray-100 px-5 py-3.5 dark:border-neutral-800"
        >
          <h2
            class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
          >
            Playback
          </h2>
        </div>

        <SettingToggle
          icon="mdi:volume-off"
          label="Auto-mute Videos"
          description="Videos play silently by default"
          :value="settings.autoMute"
          @change="update('autoMute', $event)"
        />
      </section>

      <!-- Feed -->
      <section
        class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="border-b border-gray-100 px-5 py-3.5 dark:border-neutral-800"
        >
          <h2
            class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
          >
            Feed
          </h2>
        </div>

        <SettingToggle
          icon="mdi:view-agenda-outline"
          label="Compact Feed"
          description="Show smaller post cards"
          :value="settings.compactFeed"
          :border="true"
          @change="update('compactFeed', $event)"
        />
        <SettingToggle
          icon="mdi:closed-caption-outline"
          label="Show Captions"
          description="Display post captions on cards"
          :value="settings.showCaptions"
          :border="true"
          @change="update('showCaptions', $event)"
        />
        <SettingToggle
          icon="mdi:heart-outline"
          label="Show Like Counts"
          description="Display like numbers on posts"
          :value="settings.showLikeCounts"
          :border="true"
          @change="update('showLikeCounts', $event)"
        />
        <SettingToggle
          icon="mdi:map-marker-radius-outline"
          label="Show Near Me"
          description="Show nearby stores on the home feed"
          :value="settings.showNearMe"
          :border="true"
          @change="update('showNearMe', $event)"
        />
        <SettingToggle
          icon="mdi:storefront-outline"
          label="Show Shop Today"
          description="Show featured products shelf on the home feed"
          :value="settings.showShopToday"
          @change="update('showShopToday', $event)"
        />
        <SettingToggle
          icon="mdi:play-circle-outline"
          label="Show Stories"
          description="Show stories bar at the top of your home feed"
          :value="settings.showStories"
          @change="update('showStories', $event)"
        />
      </section>

      <!-- Language -->
      <section
        class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="border-b border-gray-100 px-5 py-3.5 dark:border-neutral-800"
        >
          <h2
            class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
          >
            Language
          </h2>
        </div>
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            <Icon
              name="mdi:translate"
              size="20"
              class="text-gray-500 dark:text-neutral-400"
            />
            <p class="text-sm font-medium text-gray-900 dark:text-neutral-100">
              App Language
            </p>
          </div>
          <select
            :value="locale"
            class="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:bg-neutral-800 dark:text-neutral-300"
            @change="
              setLocale(($event.target as HTMLSelectElement).value as any)
            "
          >
            <option
              v-for="l in locales"
              :key="(l as any).code"
              :value="(l as any).code"
            >
              {{ (l as any).name }}
            </option>
          </select>
        </div>
      </section>

      <!-- Currency -->
      <section
        class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div
          class="border-b border-gray-100 px-5 py-3.5 dark:border-neutral-800"
        >
          <h2
            class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
          >
            Currency
          </h2>
        </div>
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            <Icon
              name="mdi:currency-usd"
              size="20"
              class="text-gray-500 dark:text-neutral-400"
            />
            <div>
              <p
                class="text-sm font-medium text-gray-900 dark:text-neutral-100"
              >
                Default Currency
              </p>
              <p class="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                Used for price display
              </p>
            </div>
          </div>
          <select
            :value="settings.currency"
            class="rounded-xl border-0 bg-gray-100 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/30 dark:bg-neutral-800 dark:text-neutral-300"
            @change="
              update('currency', ($event.target as HTMLSelectElement).value)
            "
          >
            <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">
              {{ c.symbol }} {{ c.code }} — {{ c.name }}
            </option>
          </select>
        </div>
      </section>

      <!-- Account -->
      <ClientOnly>
        <section
          v-if="profileStore.isLoggedIn"
          class="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="border-b border-gray-100 px-5 py-3.5 dark:border-neutral-800"
          >
            <h2
              class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500"
            >
              Account
            </h2>
          </div>

          <NuxtLink
            to="/buyer/orders"
            class="setting-link border-b border-gray-100 dark:border-neutral-800"
          >
            <Icon
              name="mdi:package-variant-closed-outline"
              size="20"
              class="text-gray-500 dark:text-neutral-400"
            />
            <span>My Orders</span>
            <Icon
              name="mdi:chevron-right"
              size="18"
              class="ml-auto text-gray-400"
            />
          </NuxtLink>

          <NuxtLink
            :to="
              profileStore.me?.role === 'seller'
                ? '/sellers/dashboard'
                : '/buyer/profile'
            "
            class="setting-link border-b border-gray-100 dark:border-neutral-800"
          >
            <Icon
              name="mdi:account-outline"
              size="20"
              class="text-gray-500 dark:text-neutral-400"
            />
            <span>Edit Profile</span>
            <Icon
              name="mdi:chevron-right"
              size="18"
              class="ml-auto text-gray-400"
            />
          </NuxtLink>

          <button
            class="setting-link w-full text-red-500"
            @click="handleLogout"
          >
            <Icon name="mdi:logout" size="20" />
            <span>Log Out</span>
          </button>
        </section>
      </ClientOnly>

      <!-- Reset -->
      <button
        class="w-full py-2 text-center text-xs text-gray-400 transition-colors hover:text-gray-600 dark:text-neutral-600 dark:hover:text-neutral-400"
        @click="reset"
      >
        Reset all settings to defaults
      </button>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from '~~/layers/feed/app/layouts/HomeLayout.vue'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import SettingToggle from '../components/settings/SettingToggle.vue'

definePageMeta({ middleware: undefined })

const { settings, update, reset } = useSettings()
const colorMode = useColorMode()
const profileStore = useProfileStore()
const { locale, locales, setLocale } = useI18n()

// On mount, apply saved theme + language from settings (covers server-hydrated values)
onMounted(() => {
  if (settings.value.theme && settings.value.theme !== colorMode.preference) {
    colorMode.preference = settings.value.theme
  }
  if (settings.value.language && settings.value.language !== locale.value) {
    setLocale(settings.value.language as any)
  }
})

const COLOR_MODES = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'Auto' },
  { value: 'dark', label: 'Dark' },
]

const TEXT_SIZES = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
]

const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

// Sync theme preference to settings composable when colorMode changes
watch(
  () => colorMode.preference,
  (val) => {
    update('theme', val)
  },
)

// Sync language preference to settings composable when locale changes
watch(locale, (val) => {
  update('language', val)
})

useSeoMeta({ title: 'Settings · Styli', robots: 'noindex' })

const handleLogout = async () => {
  await navigateTo('/user-login')
  // Auth store clears on login page mount
}
</script>

<style scoped>
.setting-link {
  @apply flex items-center gap-3 px-5 py-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:text-neutral-100 dark:hover:bg-neutral-800/50;
}
</style>
