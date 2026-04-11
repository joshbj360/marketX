<!-- layers/auth/pages/reset-password.vue -->
<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Full-screen Background -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://www.bellanaijastyle.com/wp-content/uploads/2024/02/Lagos-Fashion-Week-Street-Style-2024-1.jpg"
        alt="Stylish group at Lagos Fashion Week street style in vibrant outfits"
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
        <!-- Header & Motivational Copy -->
        <div class="mb-7 text-center">
          <h1
            class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white"
          >
            Reset Password
          </h1>
          <p
            class="mt-2.5 text-base leading-relaxed text-gray-700 dark:text-gray-300"
          >
            Set a new password and jump back into sharing your style,
            discovering trends, and shopping on
            {{ $config.public.siteName || 'MarketX' }}
          </p>
        </div>

        <!-- Token Invalid State -->
        <div
          v-if="tokenInvalid"
          class="mb-6 rounded-xl border border-red-200/80 bg-red-50/70 p-5 dark:border-red-800/40 dark:bg-red-950/25"
        >
          <div class="flex gap-3">
            <Icon
              name="mdi:alert-circle"
              class="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400"
            />
            <div>
              <h3
                class="text-base font-semibold text-red-900 dark:text-red-300"
              >
                Invalid or expired link
              </h3>
              <p class="mt-1.5 text-sm text-red-800 dark:text-red-300">
                This reset link is no longer valid. Please request a new one.
              </p>
              <NuxtLink
                to="/forgot-password"
                class="mt-3 inline-block text-sm font-medium text-brand transition hover:text-brand/80"
              >
                Request new reset link →
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- General Error (non-token) -->
        <div
          v-else-if="error && !success"
          class="mb-6 rounded-xl border border-red-200/80 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300"
        >
          {{ error }}
        </div>

        <!-- Reset Form (only shown if token valid & not success) -->
        <form
          v-else-if="!success"
          class="space-y-5"
          @submit.prevent="handleSubmit"
        >
          <!-- New Password -->
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="New password (min 12 characters)"
              :disabled="isLoading"
              class="w-full rounded-xl border bg-white/60 px-4 py-3.5 pr-12 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
              :class="{ 'border-red-400 dark:border-red-600': errors.password }"
            />
            <button
              type="button"
              :disabled="isLoading"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
                class="h-5.5 w-5.5"
              />
            </button>
            <p
              v-if="errors.password"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.password }}
            </p>
          </div>

          <!-- Confirm Password -->
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm new password"
              :disabled="isLoading"
              class="w-full rounded-xl border bg-white/60 px-4 py-3.5 pr-12 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
              :class="{
                'border-red-400 dark:border-red-600': errors.confirmPassword,
              }"
            />
            <button
              type="button"
              :disabled="isLoading"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon
                :name="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'"
                class="h-5.5 w-5.5"
              />
            </button>
            <p
              v-if="errors.confirmPassword"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Password Strength Meter -->
          <PasswordStrengthMeter
            v-if="form.password"
            :password="form.password"
          />

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="mt-2 w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white shadow transition hover:bg-brand/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="isLoading"
              class="flex items-center justify-center gap-2.5"
            >
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Resetting password...
            </span>
            <span v-else>Reset Password</span>
          </button>
        </form>

        <!-- Success State -->
        <div v-if="success" class="space-y-6">
          <div
            class="rounded-xl border border-green-200/80 bg-green-50/70 p-5 text-sm dark:border-green-800/40 dark:bg-green-950/25"
          >
            <div class="flex gap-3">
              <Icon
                name="mdi:check-circle"
                class="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400"
              />
              <div>
                <h3 class="font-semibold text-green-900 dark:text-green-300">
                  Password reset successful!
                </h3>
                <p class="mt-1.5 text-gray-800 dark:text-gray-300">
                  Your password has been updated.<br />
                  Redirecting you to sign in...
                </p>
              </div>
            </div>
          </div>

          <!-- Optional: manual login link if redirect is slow -->
          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            Taking too long?
            <NuxtLink
              to="/user-login"
              class="font-semibold text-brand transition hover:text-brand/80"
            >
              Go to login
            </NuxtLink>
          </p>
        </div>

        <!-- Footer Link (only when not success & token valid) -->
        <p
          v-if="!success && !tokenInvalid"
          class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          Remember your password?
          <NuxtLink
            to="/user-login"
            class="font-semibold text-brand transition hover:text-brand/80"
          >
            Sign in
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const route = useRoute()
const router = useRouter()

const {
  resetPassword: authResetPassword,
  isLoading: authLoading,
  error: authError,
} = useAuth()

const success = ref(false)
const tokenInvalid = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  password: '',
  confirmPassword: '',
})

const isLoading = computed(() => authLoading.value)
const error = computed(() => authError.value)

const validateForm = () => {
  errors.password = ''
  errors.confirmPassword = ''

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

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const token = route.query.token as string

  try {
    await authResetPassword(token, form.password, form.confirmPassword)
    success.value = true
    // authResetPassword should handle navigation / redirect
  } catch (err) {
    console.error('Password reset failed:', err)
  }
}

onMounted(() => {
  const token = route.query.token as string
  if (!token) {
    tokenInvalid.value = true
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
