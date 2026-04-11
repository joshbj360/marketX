<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Full-screen Background -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://res.cloudinary.com/dcci05bzj/image/upload/q_auto/f_auto/v1775835271/freepik_horizontal-site-backgroun_2758965030_gtxztq.png"
        alt="Background"
        class="h-full w-full object-cover object-center brightness-[0.78] contrast-[1.08] saturate-[1.15]"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/45 to-black/30"
      />
    </div>

    <!-- Main Content – centered glassmorphism card -->
    <div
      class="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-6 md:py-12 lg:px-8"
    >
      <div
        class="fade-in bg-white/88 dark:bg-neutral-900/82 w-full max-w-xl rounded-2xl p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10 dark:shadow-black/40"
      >
        <!-- Header -->
        <div class="mb-7 text-center">
          <h1
            class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white"
          >
            {{
              $t('auth.register.welcomeTitle', {
                site: $config.public.siteName || 'MarketX',
              })
            }}
          </h1>
          <p
            class="mt-2.5 text-base leading-relaxed text-gray-700 dark:text-gray-300"
          >
            {{ $t('auth.register.welcomeSubtitle') }}
          </p>
        </div>

        <!-- Alerts -->
        <div v-if="error || message" class="mb-5 space-y-3">
          <div
            v-if="error"
            class="rounded-xl border border-red-200/80 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300"
          >
            {{ error }}
          </div>
          <div
            v-if="message"
            class="rounded-xl border border-green-200/80 bg-green-50/70 p-4 text-sm text-green-700 dark:border-green-800/40 dark:bg-green-950/25 dark:text-green-300"
          >
            {{ message }}
          </div>
        </div>

        <!-- Social Logins -->
        <div class="flex items-center gap-4">
          <button
            type="button"
            :disabled="isBusy"
            :title="$t('auth.register.continueWithGoogle')"
            :aria-label="$t('auth.register.continueWithGoogle')"
            class="flex flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white/80 py-3 shadow-sm transition hover:bg-gray-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800/60 dark:hover:bg-neutral-700"
            @click="handleSocial('google')"
          >
            <Icon name="mdi:google" class="h-6 w-6 text-[#4285F4]" />
          </button>
          <button
            type="button"
            :disabled="isBusy"
            title="Continue with TikTok"
            aria-label="Continue with TikTok"
            class="flex flex-1 items-center justify-center rounded-xl border border-gray-300 bg-white/80 py-3 shadow-sm transition hover:bg-gray-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800/60 dark:hover:bg-neutral-700"
            @click="handleSocial('tiktok')"
          >
            <Icon
              name="simple-icons:tiktok"
              class="h-5 w-5 text-black dark:text-white"
            />
          </button>
          <button
            type="button"
            :disabled="isBusy"
            title="Continue with Facebook"
            aria-label="Continue with Facebook"
            class="flex flex-1 items-center justify-center rounded-xl border border-[#1877F2] bg-[#1877F2]/90 py-3 shadow-sm transition hover:bg-[#1877F2] disabled:opacity-60"
            @click="handleSocial('facebook')"
          >
            <Icon name="mdi:facebook" class="h-6 w-6 text-white" />
          </button>
        </div>

        <div class="my-6 flex items-center justify-center space-x-4">
          <span class="h-px w-full bg-gray-300 dark:bg-neutral-700"></span>
          <span
            class="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
            >{{ $t('auth.register.orWithEmail') }}</span
          >
          <span class="h-px w-full bg-gray-300 dark:bg-neutral-700"></span>
        </div>

        <!-- Form -->
        <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
          <div class="grid gap-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <div class="relative">
                <Icon
                  name="mdi:account-outline"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size="20"
                />
                <input
                  v-model="form.username"
                  type="text"
                  :placeholder="$t('auth.register.usernamePlaceholder')"
                  autocomplete="username"
                  :disabled="isBusy"
                  class="w-full rounded-xl border bg-white/60 py-3.5 pl-11 pr-4 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
                  :class="{
                    'border-red-400 dark:border-red-600': errors.username,
                  }"
                />
              </div>
              <p
                v-if="errors.username"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.username }}
              </p>
            </div>

            <div class="sm:col-span-2">
              <div class="relative">
                <Icon
                  name="mdi:at"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size="20"
                />
                <input
                  v-model="form.email"
                  type="email"
                  :placeholder="$t('auth.register.emailPlaceholder')"
                  autocomplete="email"
                  :disabled="isBusy"
                  class="w-full rounded-xl border bg-white/60 py-3.5 pl-11 pr-4 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
                  :class="{
                    'border-red-400 dark:border-red-600': errors.email,
                  }"
                />
              </div>
              <p
                v-if="errors.email"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.email }}
              </p>
            </div>

            <div class="sm:col-span-1">
              <div class="relative">
                <Icon
                  name="mdi:lock-outline"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size="20"
                />
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="$t('auth.register.passwordPlaceholder')"
                  autocomplete="new-password"
                  :disabled="isBusy"
                  class="w-full rounded-xl border bg-white/60 py-3.5 pl-11 pr-11 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
                  :class="{
                    'border-red-400 dark:border-red-600': errors.password,
                  }"
                />
                <button
                  type="button"
                  :disabled="isBusy"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="showPassword = !showPassword"
                >
                  <Icon
                    :name="
                      showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'
                    "
                    size="20"
                  />
                </button>
              </div>
              <p
                v-if="errors.password"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.password }}
              </p>
            </div>

            <div class="sm:col-span-1">
              <div class="relative">
                <Icon
                  name="mdi:lock-check-outline"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size="20"
                />
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
                  autocomplete="new-password"
                  :disabled="isBusy"
                  class="w-full rounded-xl border bg-white/60 py-3.5 pl-11 pr-11 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
                  :class="{
                    'border-red-400 dark:border-red-600':
                      errors.confirmPassword,
                  }"
                />
                <button
                  type="button"
                  :disabled="isBusy"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <Icon
                    :name="
                      showConfirmPassword
                        ? 'mdi:eye-off-outline'
                        : 'mdi:eye-outline'
                    "
                    size="20"
                  />
                </button>
              </div>
              <p
                v-if="errors.confirmPassword"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>

          <PasswordStrengthMeter
            v-if="form.password"
            :password="form.password"
          />

          <SellerSignupSection
            v-model="storeName"
            :error="errors.storeName"
            :site-name="$config.public.siteName || 'MarketX'"
          />

          <label
            for="terms"
            class="flex items-start gap-3 rounded-xl border border-gray-200/70 bg-gray-50/60 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/40"
          >
            <input
              id="terms"
              v-model="agreedToTerms"
              type="checkbox"
              :disabled="isBusy"
              class="mt-0.5 h-5 w-5 rounded border-gray-300 text-brand focus:ring-brand/40 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span
              class="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            >
              {{ $t('auth.register.agreePrefix') }}
              <NuxtLink
                to="/Terms"
                class="font-semibold text-brand hover:opacity-80"
                >{{ $t('auth.register.terms') }}</NuxtLink
              >
              {{ $t('auth.register.agreeMid') }}
              <NuxtLink
                to="/Privacy"
                class="font-semibold text-brand hover:opacity-80"
                >{{ $t('auth.register.privacy') }}</NuxtLink
              >
            </span>
          </label>

          <button
            type="submit"
            :disabled="isBusy || !agreedToTerms"
            class="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white shadow transition hover:bg-brand/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="isLoading"
              class="flex items-center justify-center gap-2.5"
            >
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              {{ $t('auth.register.creating') }}
            </span>
            <span v-else>{{ $t('auth.register.createButton') }}</span>
          </button>
        </form>

        <!-- Footer Links -->
        <div class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            {{
              $t('auth.register.alreadyHaveAccount', {
                site: $config.public.siteName || 'MarketX',
              })
            }}
            <NuxtLink
              to="/user-login"
              class="font-semibold text-brand transition hover:text-brand/80"
            >
              {{ $t('nav.signIn') }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { definePageMeta, useSeoMeta } from '#imports'
import { useAuth } from '../composables/useAuth'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.vue'
import SellerSignupSection from '~~/layers/seller/app/components/SellerSignupSection.vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

useSeoMeta({
  title: 'Create Account',
  description: 'Join MarketX - buy, sell, and discover amazing products.',
  robots: 'noindex',
})

const {
  register: authRegister,
  socialLogin,
  isLoading: authLoading,
  error: authError,
  message: authMessage,
} = useAuth()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreedToTerms = ref(false)
const storeName = ref('')
const isSocialLoading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  storeName: '',
})

const isLoading = computed(() => authLoading.value)
const isBusy = computed(() => authLoading.value || isSocialLoading.value)
const error = computed(() => authError.value)
const message = computed(() => authMessage.value)

const validateForm = () => {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.storeName = ''

  if (!form.username.trim()) {
    errors.username = 'Username is required'
    return false
  }
  if (form.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters'
    return false
  }
  if (form.username.trim().length > 20) {
    errors.username = 'Username must be at most 20 characters'
    return false
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
    return false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }
  if (form.password.length < 12) {
    errors.password = 'Password must be at least 12 characters'
    return false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    return false
  }
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }

  if (storeName.value.trim() && storeName.value.trim().length < 3) {
    errors.storeName = 'Store name must be at least 3 characters'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const redirectTo = storeName.value.trim()
    ? `/sellers/create?storeName=${encodeURIComponent(storeName.value.trim())}`
    : '/user-login'

  await authRegister(
    form.email.trim(),
    form.username.trim(),
    form.password,
    form.confirmPassword,
    redirectTo,
  )
}

const handleSocial = async (provider: 'google' | 'facebook' | 'tiktok') => {
  isSocialLoading.value = true
  await socialLogin(provider, '/')
}
</script>

<style scoped>
.fade-in {
  animation: fadeInUp 0.55s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
