<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="handleClose"
      >
        <div
          class="w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl dark:bg-neutral-900"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <h2
              class="text-lg font-semibold text-gray-900 dark:text-neutral-100"
            >
              Withdraw Funds
            </h2>
            <button
              @click="handleClose"
              class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Icon name="mdi:close" size="22" />
            </button>
          </div>

          <div class="max-h-[80vh] overflow-y-auto">
            <div class="space-y-5 p-5">
              <!-- Available Balance -->
              <div
                class="rounded-xl bg-gradient-to-br from-brand to-[#d81b36] p-4 text-white"
              >
                <p class="text-xs text-white/70">Available Balance</p>
                <p class="text-3xl font-bold">{{ fmt(balance) }}</p>
                <p class="mt-1 text-xs text-white/60">
                  Pending: {{ fmt(pendingBalance) }}
                </p>
              </div>

              <!-- Amount input -->
              <div>
                <label
                  class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                >
                  Amount to withdraw
                </label>
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400"
                    >₦</span
                  >
                  <input
                    v-model.number="amountNaira"
                    type="number"
                    min="500"
                    :max="balanceNaira"
                    step="1"
                    placeholder="0"
                    class="w-full rounded-lg border border-gray-200 bg-white py-3 pl-7 pr-4 text-lg font-semibold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div class="mt-1.5 flex justify-between text-xs text-gray-400">
                  <span>Min: ₦500</span>
                  <button
                    @click="amountNaira = balanceNaira"
                    class="font-medium text-brand hover:underline"
                  >
                    Withdraw all (₦{{ balanceNaira.toLocaleString() }})
                  </button>
                </div>
                <p v-if="amountError" class="mt-1 text-xs text-red-500">
                  {{ amountError }}
                </p>
              </div>

              <!-- Fee breakdown -->
              <div
                v-if="amountNaira > 0"
                class="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50"
              >
                <p
                  class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500"
                >
                  Payout breakdown
                </p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-neutral-400"
                      >Gross amount</span
                    >
                    <span
                      class="font-medium text-gray-900 dark:text-neutral-100"
                      >{{ fmt(amountKobo) }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-neutral-400">
                      Platform fee ({{ feeConfig.platformFeePercent }}%)
                    </span>
                    <span class="font-medium text-red-500"
                      >- {{ fmt(breakdown.platformFee) }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-neutral-400"
                      >Transfer fee</span
                    >
                    <span class="font-medium text-red-500"
                      >- {{ fmt(breakdown.transferFee) }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between border-t border-gray-200 pt-2 dark:border-neutral-700"
                  >
                    <span
                      class="font-semibold text-gray-900 dark:text-neutral-100"
                      >You'll receive</span
                    >
                    <span
                      class="text-lg font-bold text-green-600 dark:text-green-400"
                      >{{ fmt(breakdown.net) }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Bank account selector -->
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <label
                    class="text-sm font-medium text-gray-700 dark:text-neutral-300"
                    >Pay to</label
                  >
                  <button
                    @click="showAddAccount = !showAddAccount"
                    class="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                  >
                    <Icon name="mdi:plus" size="14" />
                    Add account
                  </button>
                </div>

                <!-- Saved accounts -->
                <div v-if="bankAccounts.length" class="space-y-2">
                  <button
                    v-for="account in bankAccounts"
                    :key="account.id"
                    @click="selectedAccountId = account.id"
                    class="flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all"
                    :class="
                      selectedAccountId === account.id
                        ? 'border-brand bg-brand/5 dark:bg-brand/10'
                        : 'border-gray-200 hover:border-gray-300 dark:border-neutral-700'
                    "
                  >
                    <div
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                    >
                      <Icon
                        name="mdi:bank"
                        size="18"
                        class="text-gray-500 dark:text-neutral-400"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p
                        class="text-sm font-semibold text-gray-900 dark:text-neutral-100"
                      >
                        {{ account.accountName }}
                      </p>
                      <p class="text-xs text-gray-400 dark:text-neutral-500">
                        {{ account.bankName }} · ****{{
                          account.accountNumber.slice(-4)
                        }}
                      </p>
                    </div>
                    <div
                      v-if="account.isDefault"
                      class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    >
                      Default
                    </div>
                    <div
                      v-if="selectedAccountId === account.id"
                      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand"
                    >
                      <Icon name="mdi:check" size="14" class="text-white" />
                    </div>
                  </button>
                </div>

                <div
                  v-else-if="!showAddAccount"
                  class="rounded-xl border border-dashed border-gray-200 p-4 text-center dark:border-neutral-700"
                >
                  <Icon
                    name="mdi:bank-plus"
                    size="28"
                    class="mx-auto mb-2 text-gray-300 dark:text-neutral-600"
                  />
                  <p class="text-sm text-gray-500 dark:text-neutral-400">
                    No bank accounts saved
                  </p>
                  <button
                    @click="showAddAccount = true"
                    class="mt-1 text-xs font-medium text-brand hover:underline"
                  >
                    Add your first account
                  </button>
                </div>

                <!-- Add account form -->
                <div
                  v-if="showAddAccount"
                  class="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <p
                    class="mb-3 text-sm font-semibold text-gray-900 dark:text-neutral-100"
                  >
                    New Bank Account
                  </p>
                  <div class="space-y-3">
                    <!-- Bank selector -->
                    <div>
                      <label
                        class="mb-1 block text-xs font-medium text-gray-600 dark:text-neutral-400"
                        >Bank</label
                      >
                      <select
                        v-model="newAccount.bankCode"
                        @change="onBankChange"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                      >
                        <option value="" disabled>Select bank</option>
                        <option
                          v-for="bank in NIGERIAN_BANKS"
                          :key="bank.code"
                          :value="bank.code"
                        >
                          {{ bank.name }}
                        </option>
                      </select>
                    </div>
                    <!-- Account number -->
                    <div>
                      <label
                        class="mb-1 block text-xs font-medium text-gray-600 dark:text-neutral-400"
                        >Account Number</label
                      >
                      <input
                        v-model="newAccount.accountNumber"
                        type="text"
                        maxlength="10"
                        placeholder="10-digit account number"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                      />
                    </div>
                    <!-- Account name (manual entry — Paystack resolve can be added later) -->
                    <div>
                      <label
                        class="mb-1 block text-xs font-medium text-gray-600 dark:text-neutral-400"
                        >Account Name</label
                      >
                      <input
                        v-model="newAccount.accountName"
                        type="text"
                        placeholder="As it appears on your bank statement"
                        class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                      />
                    </div>
                    <div class="flex gap-2">
                      <button
                        @click="saveNewAccount"
                        :disabled="savingAccount || !canSaveAccount"
                        class="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {{ savingAccount ? 'Saving…' : 'Save Account' }}
                      </button>
                      <button
                        @click="showAddAccount = false"
                        class="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 dark:border-neutral-600 dark:text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Withdraw button -->
              <button
                @click="handleWithdraw"
                :disabled="!canProceed || isProcessing"
                class="w-full rounded-xl bg-brand py-3 font-bold text-white transition-colors hover:bg-[#d81b36] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{
                  isProcessing
                    ? 'Processing…'
                    : `Withdraw ${fmt(breakdown.net)}`
                }}
              </button>

              <!-- Notes -->
              <p
                class="text-center text-xs text-gray-400 dark:text-neutral-500"
              >
                Withdrawals are processed within 1–3 business days · Platform
                fee {{ feeConfig.platformFeePercent }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useWallet } from '~~/layers/commerce/app/composables/useWallet'
import { BaseApiClient } from '~~/layers/core/app/services/base.api'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'

const props = defineProps<{ balance: number; pendingBalance?: number }>()
const emit = defineEmits(['close', 'success'])

const { withdraw } = useWallet()
const sellerStore = useSellerStore()
const api = new BaseApiClient()

// ── Fee config ──────────────────────────────────────────────────────────────
const feeConfig = ref({ platformFeePercent: 5, transferFeeKobo: 5000 })
onMounted(async () => {
  try {
    const res: any = await api.request('/api/commerce/wallet/fee-config', {
      method: 'GET',
    })
    if (res?.data) feeConfig.value = res.data
  } catch {}
})

// ── Amount ───────────────────────────────────────────────────────────────────
const balanceNaira = computed(() => Math.floor(props.balance / 100))
const amountNaira = ref(0)
const amountKobo = computed(() => amountNaira.value * 100)

const breakdown = computed(() => {
  const gross = amountKobo.value
  const platformFee = Math.round(
    gross * (feeConfig.value.platformFeePercent / 100),
  )
  const transferFee = feeConfig.value.transferFeeKobo
  const net = Math.max(0, gross - platformFee - transferFee)
  return { gross, platformFee, transferFee, net }
})

const amountError = computed(() => {
  if (amountNaira.value > 0 && amountNaira.value < 500)
    return 'Minimum withdrawal is ₦500'
  if (amountKobo.value > props.balance) return 'Insufficient balance'
  return null
})

// ── Bank accounts ────────────────────────────────────────────────────────────
const bankAccounts = ref<any[]>([])
const selectedAccountId = ref<string | null>(null)
const showAddAccount = ref(false)
const savingAccount = ref(false)
const newAccount = reactive({
  bankCode: '',
  accountNumber: '',
  accountName: '',
})

const onBankChange = () => {
  const bank = NIGERIAN_BANKS.find((b) => b.code === newAccount.bankCode)
  // bankName auto-resolved from the code
}

const canSaveAccount = computed(
  () =>
    newAccount.bankCode &&
    newAccount.accountNumber.length === 10 &&
    newAccount.accountName.length > 1,
)

const loadBankAccounts = async () => {
  try {
    const res: any = await api.request('/api/seller/bank-accounts', {
      method: 'GET',
    })
    bankAccounts.value = res?.data ?? []
    const def = bankAccounts.value.find((a) => a.isDefault)
    if (def) selectedAccountId.value = def.id
  } catch {}
}

onMounted(async () => {
  await loadBankAccounts()
})

const saveNewAccount = async () => {
  if (!canSaveAccount.value) return
  const bank = NIGERIAN_BANKS.find((b) => b.code === newAccount.bankCode)
  if (!bank) return

  // Use first active seller as the owner
  const sellerId = sellerStore.sellers?.[0]?.id
  if (!sellerId) return

  savingAccount.value = true
  try {
    const res: any = await api.request('/api/seller/bank-accounts', {
      method: 'POST',
      body: {
        sellerId,
        bankName: bank.name,
        bankCode: bank.code,
        accountNumber: newAccount.accountNumber,
        accountName: newAccount.accountName,
        isDefault: bankAccounts.value.length === 0,
      },
    })
    bankAccounts.value.push(res.data)
    if (res.data.isDefault) selectedAccountId.value = res.data.id
    showAddAccount.value = false
    newAccount.bankCode = ''
    newAccount.accountNumber = ''
    newAccount.accountName = ''
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to save account')
  } finally {
    savingAccount.value = false
  }
}

// ── Withdraw ─────────────────────────────────────────────────────────────────
const isProcessing = ref(false)

const canProceed = computed(
  () =>
    amountNaira.value >= 500 &&
    amountKobo.value <= props.balance &&
    !amountError.value &&
    selectedAccountId.value !== null &&
    breakdown.value.net > 0,
)

const handleWithdraw = async () => {
  if (!canProceed.value) return
  const account = bankAccounts.value.find(
    (a) => a.id === selectedAccountId.value,
  )
  if (
    !confirm(
      `Withdraw ${fmt(breakdown.value.net)} to ${account?.bankName} ****${account?.accountNumber.slice(-4)}?\n\nThis cannot be undone.`,
    )
  )
    return

  isProcessing.value = true
  try {
    await withdraw(amountKobo.value, {
      accountId: account?.id,
      bankName: account?.bankName,
      bankCode: account?.bankCode,
      accountNumber: account?.accountNumber,
      accountName: account?.accountName,
    })
    emit('success', amountKobo.value)
  } catch (e: any) {
    alert(e?.data?.statusMessage || e?.message || 'Withdrawal failed')
  } finally {
    isProcessing.value = false
  }
}

const handleClose = () => {
  if (!isProcessing.value) emit('close')
}

const fmt = (kobo: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
    kobo / 100,
  )

// ── Nigerian banks ────────────────────────────────────────────────────────────
const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Guaranty Trust Bank (GTB)', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda Bank', code: '090267' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'OPay', code: '100004' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Taj Bank', code: '302' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'VFD Microfinance Bank', code: '566' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
]
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.25s ease;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(20px);
}
</style>
