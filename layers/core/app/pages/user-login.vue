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
        class="fade-in bg-white/88 dark:bg-neutral-900/82 w-full max-w-md rounded-2xl p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:max-w-lg md:p-10 lg:max-w-md dark:shadow-black/40"
      >
        <!-- Header -->
        <div class="mb-7 text-center">
          <p
            class="mb-2 text-xs font-bold uppercase tracking-widest text-brand"
          >
            Welcome back
          </p>
          <h1
            class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white"
          >
            Sign in to continue
          </h1>
          <p
            class="mt-2.5 text-base leading-relaxed text-gray-700 dark:text-gray-300"
          >
            Use your email and password, or continue with a social account.
          </p>
        </div>

        <!-- Alerts -->
        <div v-if="error || localMessage" class="mb-5 space-y-3">
          <div
            v-if="error"
            class="rounded-xl border border-red-200/80 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300"
          >
            {{ error }}
          </div>
          <div
            v-if="localMessage"
            class="rounded-xl border border-blue-200/70 bg-blue-50/60 p-4 text-sm text-blue-800 dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300"
          >
            {{ localMessage }}
          </div>
        </div>

        <!-- Social Logins -->
        <div class="flex items-center gap-4">
          <button
            type="button"
            :disabled="isBusy"
            title="Continue with Google"
            aria-label="Continue with Google"
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
            >Email login</span
          >
          <span class="h-px w-full bg-gray-300 dark:bg-neutral-700"></span>
        </div>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <div class="relative">
              <Icon
                name="mdi:at"
                class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size="20"
              />
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                :disabled="isBusy"
                placeholder="you@example.com"
                class="w-full rounded-xl border bg-white/60 py-3.5 pl-11 pr-4 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
                :class="{ 'border-red-400 dark:border-red-600': errors.email }"
              />
            </div>
            <p
              v-if="errors.email"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.email }}
            </p>
          </div>

          <div>
            <div class="relative">
              <Icon
                name="mdi:lock-outline"
                class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size="20"
              />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :disabled="isBusy"
                placeholder="Enter your password"
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

          <div class="flex items-center justify-end">
            <NuxtLink
              to="/forgot-password"
              class="text-sm font-semibold text-brand transition hover:text-brand/80"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <button
            type="submit"
            :disabled="isBusy"
            class="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white shadow transition hover:bg-brand/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="isLoading"
              class="flex items-center justify-center gap-2.5"
            >
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <!-- Footer Links -->
        <div class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            New to {{ $config.public.siteName || 'MarketX' }}?
            <NuxtLink
              to="/user-register"
              class="font-semibold text-brand transition hover:text-brand/80"
            >
              Create an account
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { definePageMeta, useRoute } from '#imports'
import { useAuth } from '~~/layers/core/app/composables/useAuth'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const route = useRoute()
const {
  login: authLogin,
  socialLogin,
  isLoading: authLoading,
  error: authError,
} = useAuth()

const showPassword = ref(false)
const isSocialLoading = ref(false)
const localMessage = ref('')

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const isLoading = computed(() => authLoading.value)
const error = computed(() => authError.value)
const isBusy = computed(() => authLoading.value || isSocialLoading.value)

const validateForm = () => {
  errors.email = ''
  errors.password = ''

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

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  await authLogin(form.email.trim(), form.password)
}

const handleSocial = async (provider: 'google' | 'apple' | 'facebook') => {
  localMessage.value = ''
  isSocialLoading.value = true
  await socialLogin(provider, '/')
}

onMounted(() => {
  const oauthError = route.query.oauth_error
  if (typeof oauthError === 'string' && oauthError.trim()) {
    localMessage.value = decodeURIComponent(oauthError)
  }
})
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
