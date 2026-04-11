<!-- layers/auth/pages/resend-verification.vue -->
<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Full-screen Background -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://www.bellanaijastyle.com/wp-content/uploads/2024/03/Lagos-Fashion-Week-Street-Style-March-2024-12.jpg"
        alt="Trendy Lagos street style group in colorful modern African fashion"
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
            Verify Your Email
          </h1>
          <p
            class="mt-2.5 text-base leading-relaxed text-gray-700 dark:text-gray-300"
          >
            One quick step before you can start sharing your style, following
            creators, and shopping the latest vibes on
            {{ $config.public.siteName || 'MarketX' }}
          </p>
        </div>

        <!-- Status / Info Messages -->
        <div v-if="verificationState === 'sent'" class="mb-6 space-y-4">
          <div
            class="rounded-xl border border-green-200/80 bg-green-50/70 p-5 dark:border-green-800/40 dark:bg-green-950/25"
          >
            <div class="flex gap-3">
              <Icon
                name="mdi:check-circle"
                class="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400"
              />
              <div>
                <h3
                  class="text-base font-semibold text-green-900 dark:text-green-300"
                >
                  Verification email sent!
                </h3>
                <p class="mt-1.5 text-sm text-green-800 dark:text-green-300">
                  We've sent a link to <strong>{{ email }}</strong
                  >.<br />
                  Check your inbox (and spam/junk folder). Link expires in 24
                  hours.
                </p>
              </div>
            </div>
          </div>

          <!-- Back to Login -->
          <NuxtLink
            to="/user-login"
            class="block w-full rounded-xl border border-gray-300 bg-white/80 py-3.5 text-center text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-white dark:hover:bg-neutral-700"
          >
            Back to Login
          </NuxtLink>

          <!-- Resend to different email -->
          <button
            @click="resetForm"
            type="button"
            class="w-full text-center text-sm font-medium text-brand transition hover:text-brand/80"
          >
            Resend to a different email
          </button>
        </div>

        <!-- Pending state info (before sending) -->
        <div
          v-else-if="verificationState === 'pending' && email"
          class="mb-6 rounded-xl border border-blue-200/70 bg-blue-50/60 p-4 text-sm dark:border-blue-800/40 dark:bg-blue-950/20 dark:text-blue-300"
        >
          <div class="flex gap-3">
            <Icon
              name="mdi:information"
              class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
            />
            <p>
              We sent a verification email earlier, but if you haven't received
              it yet or need a new one, enter your email below.
            </p>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-6 rounded-xl border border-red-200/80 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300"
        >
          {{ error }}
        </div>

        <!-- Resend Form (shown when not yet sent in this session) -->
        <form
          v-if="verificationState !== 'sent'"
          class="space-y-5"
          @submit.prevent="handleResend"
        >
          <!-- Email -->
          <div>
            <input
              v-model="email"
              type="email"
              placeholder="Your email address"
              :disabled="isLoading"
              class="w-full rounded-xl border bg-white/60 px-4 py-3.5 text-base placeholder-gray-500 transition focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-neutral-600 dark:bg-neutral-800/50 dark:text-white dark:placeholder-gray-400"
              :class="{ 'border-red-400 dark:border-red-600': errors.email }"
            />
            <p
              v-if="errors.email"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.email }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white shadow transition hover:bg-brand/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              v-if="isLoading"
              class="flex items-center justify-center gap-2.5"
            >
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              Sending verification email...
            </span>
            <span v-else>Send Verification Email</span>
          </button>
        </form>

        <!-- Tip Box -->
        <div
          class="mt-6 rounded-xl border border-yellow-200/70 bg-yellow-50/60 p-4 text-xs text-yellow-800 dark:border-yellow-800/40 dark:bg-yellow-950/20 dark:text-yellow-300"
        >
          <div class="flex gap-3">
            <Icon
              name="mdi:lightbulb"
              class="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
            />
            <p>
              <strong>Quick tip:</strong> After clicking the link in your email,
              you'll be able to log in and start exploring trends right away.
            </p>
          </div>
        </div>

        <!-- Footer Links -->
        <div
          class="mt-8 space-y-2 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          <p>
            Already verified?
            <NuxtLink
              to="/user-login"
              class="font-semibold text-brand transition hover:text-brand/80"
            >
              Log in
            </NuxtLink>
          </p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const route = useRoute()

const {
  resendVerificationEmail,
  isLoading: authLoading,
  error: authError,
} = useAuth()

type VerificationState = 'pending' | 'sent'

const email = ref('')
const verificationState = ref<VerificationState>('pending')

const errors = reactive({
  email: '',
})

const isLoading = computed(() => authLoading.value)
const error = computed(() => authError.value)

const validateEmail = () => {
  errors.email = ''

  if (!email.value.trim()) {
    errors.email = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Please enter a valid email'
    return false
  }

  return true
}

const handleResend = async () => {
  if (!validateEmail()) return

  try {
    await resendVerificationEmail(email.value.trim())
    verificationState.value = 'sent'
  } catch (err) {
    console.error('Resend verification error:', err)
  }
}

const resetForm = () => {
  email.value = ''
  verificationState.value = 'pending'
  errors.email = ''
}

onMounted(() => {
  // Pre-fill from query param if coming from registration flow, etc.
  const queryEmail = route.query.email as string
  if (queryEmail) {
    email.value = queryEmail
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
