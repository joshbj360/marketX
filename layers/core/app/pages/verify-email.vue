<!-- layers/auth/pages/verify-email.vue -->
<template>
  <AuthLayout title="Verifying your email" subtitle="Just a moment...">
    <!-- Loading State -->
    <div
      v-if="verifyingState === 'loading'"
      class="flex flex-col items-center justify-center py-12"
    >
      <div
        class="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-900"
      />
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Verifying your email...
      </p>
    </div>

    <!-- Success State -->
    <div v-else-if="verifyingState === 'success'" class="space-y-6">
      <div class="mb-6 flex justify-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
        >
          <Icon
            name="mdi:check"
            class="h-8 w-8 text-green-600 dark:text-green-400"
          />
        </div>
      </div>

      <div
        class="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
      >
        <h3 class="text-sm font-semibold text-green-900 dark:text-green-300">
          Email verified!
        </h3>
        <p class="mt-1 text-xs text-green-800 dark:text-green-400">
          Your email has been successfully verified. You can now log in to your
          account.
        </p>
      </div>

      <!-- Redirect Message -->
      <div
        class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
      >
        <p class="text-sm text-blue-800 dark:text-blue-400">
          Redirecting to login in
          <strong>{{ redirectCountdown }}</strong> seconds...
        </p>
      </div>

      <!-- Manual Link -->
      <NuxtLink
        to="/user-login"
        class="block w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-center text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-lg"
      >
        Go to Login Now
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-else-if="verifyingState === 'error'" class="space-y-6">
      <div class="mb-6 flex justify-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <Icon
            name="mdi:alert-circle"
            class="h-8 w-8 text-red-600 dark:text-red-400"
          />
        </div>
      </div>

      <div
        class="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
      >
        <h3 class="text-sm font-semibold text-red-900 dark:text-red-300">
          Verification failed
        </h3>
        <p class="mt-1 text-xs text-red-800 dark:text-red-400">
          {{
            errorMessage ||
            'The verification link is invalid or has expired. Please request a new one.'
          }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <NuxtLink
          to="/resend-verification"
          class="block w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-center text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-lg"
        >
          Request New Verification Link
        </NuxtLink>

        <NuxtLink
          to="/user-login"
          class="block w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
        >
          Back to Login
        </NuxtLink>
      </div>
    </div>

    <!-- Info Box -->
    <div
      class="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div class="flex gap-3">
        <Icon
          name="mdi:information"
          class="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400"
        />
        <div>
          <p class="text-xs text-gray-700 dark:text-gray-300">
            <strong>Info:</strong> Verification links expire after 24 hours. If
            your link has expired, you can request a new one.
          </p>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
import AuthLayout from '../layouts/AuthLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const route = useRoute()
const router = useRouter()
const { verifyEmail } = useAuth()

type VerifyingState = 'loading' | 'success' | 'error'

const verifyingState = ref<VerifyingState>('loading')
const errorMessage = ref('')
const redirectCountdown = ref(5)

const performVerification = async () => {
  try {
    const token = route.query.token as string

    if (!token) {
      verifyingState.value = 'error'
      errorMessage.value =
        'No verification token provided. Please check your email link.'
      return
    }

    // Call verify email from composable
    await verifyEmail(token)

    // Success!
    verifyingState.value = 'success'

    // Start countdown and redirect
    const interval = setInterval(() => {
      redirectCountdown.value--

      if (redirectCountdown.value <= 0) {
        clearInterval(interval)
        router.push('/user-login')
      }
    }, 1000)
  } catch (e: unknown) {
    console.error('Email verification error:', e)
    verifyingState.value = 'error'
    const err = e as Record<string, unknown>
    const data = err?.data as Record<string, unknown> | undefined
    errorMessage.value =
      (typeof data?.statusMessage === 'string' ? data.statusMessage : null) ||
      (typeof err?.statusMessage === 'string' ? err.statusMessage : null) ||
      (typeof err?.message === 'string' ? err.message : null) ||
      'Failed to verify email'
  }
}

onMounted(() => {
  performVerification()
})
</script>
