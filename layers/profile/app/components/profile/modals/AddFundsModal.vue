<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-neutral-100"
            >
              Add Funds
            </h2>
            <button
              @click="handleClose"
              class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Icon
                name="mdi:close"
                size="24"
                class="text-gray-900 dark:text-neutral-100"
              />
            </button>
          </div>

          <!-- Content -->
          <div class="space-y-6 p-6">
            <!-- Quick Amount Buttons -->
            <div>
              <label
                class="mb-3 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Quick Select
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="preset in presetAmounts"
                  :key="preset"
                  @click="amount = preset"
                  class="rounded-lg py-3 font-semibold transition-colors"
                  :class="
                    amount === preset
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700'
                  "
                >
                  ${{ preset }}
                </button>
              </div>
            </div>

            <!-- Custom Amount -->
            <div>
              <label
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Or Enter Custom Amount
              </label>
              <div class="relative">
                <span
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-500 dark:text-neutral-400"
                >
                  $
                </span>
                <input
                  v-model.number="amount"
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  placeholder="0.00"
                  class="w-full rounded-lg border border-gray-200 bg-white py-3 pl-8 pr-4 text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                />
              </div>
              <p class="mt-2 text-xs text-gray-500 dark:text-neutral-400">
                Minimum: $1 • Maximum: $10,000
              </p>
            </div>

            <!-- Payment Method -->
            <div>
              <label
                class="mb-3 block text-sm font-medium text-gray-700 dark:text-neutral-300"
              >
                Payment Method
              </label>
              <div class="space-y-2">
                <button
                  v-for="method in paymentMethods"
                  :key="method.id"
                  @click="selectedMethod = method.id"
                  class="flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-all"
                  :class="
                    selectedMethod === method.id
                      ? 'border-brand bg-brand/5'
                      : 'border-gray-200 hover:border-gray-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                  "
                >
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full"
                    :class="method.color"
                  >
                    <Icon :name="method.icon" size="20" class="text-white" />
                  </div>
                  <div class="flex-1 text-left">
                    <p
                      class="font-semibold text-gray-900 dark:text-neutral-100"
                    >
                      {{ method.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-neutral-400">
                      {{ method.description }}
                    </p>
                  </div>
                  <div
                    v-if="selectedMethod === method.id"
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-brand"
                  >
                    <Icon name="mdi:check" size="16" class="text-white" />
                  </div>
                </button>
              </div>
            </div>

            <!-- Summary -->
            <div
              class="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-neutral-800"
            >
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-neutral-400">Amount</span>
                <span class="font-semibold text-gray-900 dark:text-neutral-100">
                  ${{ amount.toFixed(2) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-neutral-400"
                  >Processing Fee</span
                >
                <span class="font-semibold text-gray-900 dark:text-neutral-100">
                  ${{ processingFee.toFixed(2) }}
                </span>
              </div>
              <div
                class="flex justify-between border-t border-gray-200 pt-2 dark:border-neutral-700"
              >
                <span class="font-semibold text-gray-900 dark:text-neutral-100"
                  >Total</span
                >
                <span class="text-lg font-bold text-brand">
                  ${{ total.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Add Funds Button -->
            <button
              @click="handleAddFunds"
              :disabled="!canProceed || isProcessing"
              class="w-full rounded-lg bg-brand py-3 font-bold text-white transition-colors hover:bg-[#d81b36] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isProcessing ? 'Processing...' : `Add $${amount.toFixed(2)}` }}
            </button>

            <!-- Security Note -->
            <p class="text-center text-xs text-gray-500 dark:text-neutral-400">
              <Icon name="mdi:shield-check" size="14" class="inline" />
              Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWallet } from '~~/layers/commerce/app/composables/useWallet'

const emit = defineEmits(['close', 'success'])
const { addFunds } = useWallet()

const amount = ref(50)
const selectedMethod = ref('card')
const isProcessing = ref(false)

const presetAmounts = [10, 25, 50, 100, 250, 500]

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Amex',
    icon: 'mdi:credit-card',
    color: 'bg-blue-500',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: 'mdi:paypal',
    color: 'bg-[#0070ba]',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: 'mdi:bank',
    color: 'bg-green-500',
  },
]

const processingFee = computed(() => {
  // Example: 2.9% + $0.30 processing fee
  return amount.value * 0.029 + 0.3
})

const total = computed(() => {
  return amount.value + processingFee.value
})

const canProceed = computed(() => {
  return amount.value >= 1 && amount.value <= 10000 && selectedMethod.value
})

const handleAddFunds = async () => {
  if (!canProceed.value) return

  isProcessing.value = true

  try {
    // TODO: Integrate with payment processor
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    await addFunds(amount.value)

    // Success
    emit('success', amount.value)
  } catch (error) {
    console.error('Failed to add funds:', error)
    alert('Failed to process payment. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

const handleClose = () => {
  if (isProcessing.value) return
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}

/* Hide number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
