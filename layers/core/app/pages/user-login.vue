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
        class="fade-in bg-white/88 dark:bg-neutral-900/82 w-full max-w-md rounded-2xl p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:max-w-lg md:p-10 dark:shadow-black/40"
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
            <p>{{ error }}</p>
            <button
              v-if="isVerificationError"
              type="button"
              :disabled="resendCooldown > 0 || resendLoading"
              class="mt-2.5 flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-60 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              @click="resendVerification"
            >
              <svg
                v-if="resendLoading"
                class="h-3 w-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="3"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <Icon v-else name="mdi:email-sync-outline" size="13" />
              {{
                resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend verification email'
              }}
            </button>
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
          <BaseInput
            v-model="form.email"
            type="email"
            autocomplete="email"
            :disabled="isBusy"
            placeholder="you@example.com"
            icon-left="mdi:at"
            size="lg"
            :error="errors.email"
          />

          <BaseInput
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            :disabled="isBusy"
            placeholder="Enter your password"
            icon-left="mdi:lock-outline"
            size="lg"
            :error="errors.password"
          />

          <div class="flex items-center justify-end">
            <NuxtLink
              to="/forgot-password"
              class="text-sm font-semibold text-brand transition hover:text-brand/80"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <BaseButton
            type="submit"
            size="lg"
            class="w-full"
            :loading="isLoading"
            :disabled="isBusy"
          >
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </BaseButton>
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
import { useSeo } from '~~/layers/core/app/composables/useSeo'
import { definePageMeta, useRoute } from '#imports'
import { useAuth } from '~~/layers/core/app/composables/useAuth'
import { useAuthApi } from '~~/layers/core/app/services/auth.api'
import BaseButton from '~~/layers/ui/app/components/BaseButton.vue'
import BaseInput from '~~/layers/ui/app/components/BaseInput.vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

useSeo().setLoginPage()

const route = useRoute()
const {
  login: authLogin,
  socialLogin,
  isLoading: authLoading,
  error: authError,
} = useAuth()

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

const isVerificationError = computed(
  () => !!error.value && /verify your email/i.test(error.value),
)

const resendLoading = ref(false)
const resendCooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const resendVerification = async () => {
  if (!form.email || resendLoading.value || resendCooldown.value > 0) return
  resendLoading.value = true
  try {
    await useAuthApi().resendVerificationEmail(form.email.trim())
    localMessage.value = 'Verification email sent — check your inbox.'
    resendCooldown.value = 60
    cooldownTimer = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  } catch {
    localMessage.value = 'Failed to send email. Please try again.'
  } finally {
    resendLoading.value = false
  }
}

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

const handleSocial = async (provider: 'google' | 'facebook' | 'tiktok') => {
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
