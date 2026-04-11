<template>
  <div class="space-y-6 p-6">
    <!-- Loading State -->
    <div v-if="isLoading && !wallet" class="py-12 text-center">
      <Icon
        name="eos-icons:loading"
        size="32"
        class="animate-spin text-brand"
      />
    </div>

    <template v-else>
      <!-- ── BUYER WALLET (no seller stores) ──────────────────────────── -->
      <template v-if="storeWallets.length === 0">
        <!-- Affiliate earnings card -->
        <div
          class="rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm text-white/80">Affiliate Earnings</p>
              <h2 class="text-4xl font-bold">
                {{ formatAmount(affiliateEarnings) }}
              </h2>
            </div>
            <Icon name="mdi:cash-multiple" size="48" class="text-white/20" />
          </div>
          <div class="mb-4 rounded-lg bg-white/10 px-4 py-3">
            <div class="flex items-center gap-2">
              <Icon
                name="mdi:information-outline"
                size="16"
                class="text-white/70"
              />
              <p class="text-[12px] text-white/80">
                Earn commissions by sharing affiliate product links from the
                Affiliate tab
              </p>
            </div>
          </div>
          <NuxtLink
            to="/sellers/create"
            class="block w-full rounded-lg bg-white/20 py-2 text-center font-medium transition-colors hover:bg-white/30"
          >
            Open a Store to earn more →
          </NuxtLink>
        </div>

        <!-- Spending stats -->
        <div class="grid grid-cols-2 gap-4">
          <div
            class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon
              name="mdi:shopping-outline"
              size="24"
              class="mb-2 text-brand"
            />
            <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ formatAmount(stats.totalSpent ?? 0) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              Total Spent
            </p>
          </div>
          <div
            class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon
              name="mdi:cash-multiple"
              size="24"
              class="mb-2 text-purple-500"
            />
            <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ formatAmount(affiliateEarnings) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              Affiliate Earned
            </p>
          </div>
        </div>

        <!-- Become a seller CTA -->
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="flex items-center gap-4 p-5">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10"
            >
              <Icon
                name="mdi:store-plus-outline"
                size="24"
                class="text-brand"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-gray-900 dark:text-neutral-100">
                Ready to sell?
              </p>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                Open a store to accept payments, track earnings, and withdraw to
                your bank account.
              </p>
            </div>
            <NuxtLink
              to="/sellers/create"
              class="shrink-0 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand/25 transition-colors hover:bg-brand-dark"
            >
              Start →
            </NuxtLink>
          </div>
        </div>
      </template>

      <!-- ── SELLER WALLET ─────────────────────────────────────────────── -->
      <template v-else>
        <!-- Wallet Balance Card -->
        <div
          class="rounded-xl bg-gradient-to-br from-brand to-[#d81b36] p-6 text-white"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm text-white/80">Total Available Balance</p>
              <h2 class="text-4xl font-bold">{{ formatAmount(balance) }}</h2>
            </div>
            <Icon name="mdi:wallet" size="48" class="text-white/20" />
          </div>
          <!-- Pending balance row — always visible -->
          <div class="mb-4 rounded-lg bg-white/10 px-4 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon
                  name="mdi:clock-outline"
                  size="16"
                  class="text-white/70"
                />
                <span class="text-sm text-white/80">Pending (held)</span>
              </div>
              <span class="font-semibold">{{
                formatAmount(pendingBalance)
              }}</span>
            </div>
            <p class="mt-1 text-[11px] text-white/60">
              Released to balance when orders are marked delivered
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="showWithdrawModal = true"
              class="flex-1 rounded-lg bg-white/20 py-2 font-medium transition-colors hover:bg-white/30"
            >
              Withdraw
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div
            class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon
              name="mdi:trending-up"
              size="24"
              class="mb-2 text-green-500"
            />
            <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ formatAmount(stats.totalEarned ?? 0) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              Total Earned
            </p>
          </div>

          <div
            class="rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Icon
              name="mdi:trending-down"
              size="24"
              class="mb-2 text-red-500"
            />
            <p class="text-2xl font-bold text-gray-900 dark:text-neutral-100">
              {{ formatAmount(stats.totalSpent ?? 0) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-neutral-400">
              Total Spent
            </p>
          </div>
        </div>

        <!-- Per-Store Breakdown (shown whenever user has at least one store) -->
        <div
          v-if="storeWallets.length >= 1"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
            <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
              Store Balances
            </h3>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-neutral-800">
            <div
              v-for="store in storeWallets"
              :key="store.storeId"
              class="flex items-center justify-between p-4"
            >
              <div>
                <p
                  class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                >
                  {{ store.storeName || store.storeSlug }}
                </p>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  @{{ store.storeSlug }}
                </p>
              </div>
              <div class="text-right">
                <p
                  class="text-sm font-bold text-gray-900 dark:text-neutral-100"
                >
                  {{ formatAmount(store.wallet?.balance ?? 0) }}
                </p>
                <p class="text-xs text-gray-400 dark:text-neutral-500">
                  <span class="text-amber-500 dark:text-amber-400">
                    {{ formatAmount(store.wallet?.pending_balance ?? 0) }}
                  </span>
                  pending
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Accounts -->
        <div
          v-if="storeWallets.length"
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div
            class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800"
          >
            <div class="flex items-center gap-2">
              <Icon name="mdi:bank-outline" size="20" class="text-brand" />
              <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
                Payout Accounts
              </h3>
            </div>
            <button
              @click="showAddBankAccount = !showAddBankAccount"
              class="flex items-center gap-1 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20"
            >
              <Icon name="mdi:plus" size="14" />
              Add account
            </button>
          </div>

          <!-- Account list -->
          <div
            v-if="bankAccounts.length"
            class="divide-y divide-gray-100 dark:divide-neutral-800"
          >
            <div
              v-for="account in bankAccounts"
              :key="account.id"
              class="flex items-center justify-between p-4"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                >
                  <Icon
                    name="mdi:bank"
                    size="16"
                    class="text-gray-500 dark:text-neutral-400"
                  />
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                  >
                    {{ account.accountName }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-neutral-500">
                    {{ account.bankName }} · ****{{
                      account.accountNumber.slice(-4)
                    }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="account.isDefault"
                  class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400"
                >
                  Default
                </span>
                <button
                  v-else
                  @click="setDefaultAccount(account.id)"
                  class="text-xs text-gray-400 hover:text-brand dark:text-neutral-500"
                >
                  Set default
                </button>
                <button
                  @click="deleteAccount(account.id)"
                  class="rounded p-1 text-gray-300 hover:text-red-500 dark:text-neutral-600"
                >
                  <Icon name="mdi:trash-can-outline" size="16" />
                </button>
              </div>
            </div>
          </div>

          <div
            v-else-if="!showAddBankAccount"
            class="p-6 text-center text-gray-400 dark:text-neutral-500"
          >
            <Icon name="mdi:bank-plus" size="32" class="mx-auto mb-2" />
            <p class="text-sm">No payout accounts yet</p>
            <p class="mt-0.5 text-xs">
              Add a bank account to enable withdrawals
            </p>
          </div>

          <!-- Add account inline form -->
          <div
            v-if="showAddBankAccount"
            class="border-t border-gray-100 p-4 dark:border-neutral-800"
          >
            <p
              class="mb-3 text-sm font-semibold text-gray-900 dark:text-neutral-100"
            >
              Add Bank Account
            </p>
            <div class="space-y-3">
              <select
                v-model="newBank.bankCode"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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
              <input
                v-model="newBank.accountNumber"
                type="text"
                maxlength="10"
                placeholder="Account number (10 digits)"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <input
                v-model="newBank.accountName"
                type="text"
                placeholder="Account name"
                class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              <div class="flex gap-2">
                <button
                  @click="saveNewBankAccount"
                  :disabled="
                    savingBank ||
                    !newBank.bankCode ||
                    newBank.accountNumber.length !== 10 ||
                    !newBank.accountName
                  "
                  class="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {{ savingBank ? 'Saving…' : 'Save Account' }}
                </button>
                <button
                  @click="showAddBankAccount = false"
                  class="rounded-lg border border-gray-200 px-4 py-2 text-sm dark:border-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div class="border-b border-gray-200 p-4 dark:border-neutral-800">
            <h3 class="font-semibold text-gray-900 dark:text-neutral-100">
              Transaction History
            </h3>
          </div>

          <div
            v-if="transactions.length === 0"
            class="p-8 text-center text-gray-400 dark:text-neutral-500"
          >
            <Icon
              name="mdi:receipt-text-outline"
              size="40"
              class="mx-auto mb-2"
            />
            <p class="text-sm">No transactions yet</p>
          </div>

          <div v-else class="divide-y divide-gray-200 dark:divide-neutral-800">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full"
                  :class="txIconBg(transaction.type)"
                >
                  <Icon
                    :name="txIcon(transaction.type)"
                    size="20"
                    :class="txIconColor(transaction.type)"
                  />
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-neutral-100"
                  >
                    {{ transaction.description }}
                  </p>
                  <div class="flex items-center gap-2">
                    <p class="text-xs text-gray-500 dark:text-neutral-400">
                      {{ formatDate(transaction.created_at) }}
                    </p>
                    <span
                      v-if="transaction.type === 'CREDIT_PENDING'"
                      class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    >
                      PENDING
                    </span>
                  </div>
                </div>
              </div>
              <div class="text-right" :class="txAmountColor(transaction.type)">
                <p class="font-semibold">
                  {{ transaction.type === 'DEBIT' ? '-' : '+'
                  }}{{ formatAmount(transaction.amount) }}
                </p>
              </div>
            </div>
          </div>
        </div> </template
      ><!-- end seller wallet --> </template
    ><!-- end v-else (loaded) -->
  </div>

  <!-- Withdraw Modal -->
  <WithdrawModal
    v-if="showWithdrawModal"
    :balance="balance"
    :pending-balance="pendingBalance"
    @close="showWithdrawModal = false"
    @success="handleWithdrawSuccess"
  />
</template>

<script setup lang="ts">
import WithdrawModal from '../modals/WithdrawModal.vue'
import { useWallet } from '~~/layers/commerce/app/composables/useWallet'
import { BaseApiClient } from '~~/layers/core/app/services/base.api'
import { useSellerStore } from '~~/layers/seller/app/store/seller.store'
import { useCurrency } from '~~/layers/core/app/composables/useCurrency'

const {
  wallet,
  isLoading,
  balance,
  pendingBalance,
  stats,
  transactions,
  storeWallets,
  fetchWallet,
  fetchTransactions,
  withdraw,
} = useWallet()

const showWithdrawModal = ref(false)
const sellerStore = useSellerStore()
const api = new BaseApiClient()
const { formatKobo } = useCurrency()

// Affiliate earnings for buyer wallet (pulled from transactions CREDIT entries)
const affiliateEarnings = computed(() =>
  transactions.value
    .filter(
      (t: any) =>
        t.type === 'CREDIT' &&
        t.description?.toLowerCase().includes('affiliate'),
    )
    .reduce((sum: number, t: any) => sum + (t.amount ?? 0), 0),
)

// ── Bank accounts ─────────────────────────────────────────────────────────────
const bankAccounts = ref<any[]>([])
const showAddBankAccount = ref(false)
const savingBank = ref(false)
const newBank = reactive({ bankCode: '', accountNumber: '', accountName: '' })

const loadBankAccounts = async () => {
  try {
    const res: any = await api.request('/api/seller/bank-accounts', {
      method: 'GET',
    })
    bankAccounts.value = res?.data ?? []
  } catch {}
}

const saveNewBankAccount = async () => {
  const bank = NIGERIAN_BANKS.find((b) => b.code === newBank.bankCode)
  const sellerId = sellerStore.sellers?.[0]?.id
  if (!bank || !sellerId) return
  savingBank.value = true
  try {
    const res: any = await api.request('/api/seller/bank-accounts', {
      method: 'POST',
      body: {
        sellerId,
        bankName: bank.name,
        bankCode: bank.code,
        accountNumber: newBank.accountNumber,
        accountName: newBank.accountName,
        isDefault: bankAccounts.value.length === 0,
      },
    })
    bankAccounts.value.push(res.data)
    showAddBankAccount.value = false
    newBank.bankCode = ''
    newBank.accountNumber = ''
    newBank.accountName = ''
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Failed to save account')
  } finally {
    savingBank.value = false
  }
}

const setDefaultAccount = async (id: string) => {
  try {
    await api.request(`/api/seller/bank-accounts/${id}/set-default`, {
      method: 'PATCH',
    })
    bankAccounts.value.forEach((a) => (a.isDefault = a.id === id))
  } catch {}
}

const deleteAccount = async (id: string) => {
  if (!confirm('Remove this bank account?')) return
  try {
    await api.request(`/api/seller/bank-accounts/${id}`, { method: 'DELETE' })
    bankAccounts.value = bankAccounts.value.filter((a) => a.id !== id)
  } catch {}
}

const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Guaranty Trust Bank (GTB)', code: '058' },
  { name: 'Kuda Bank', code: '090267' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'OPay', code: '100004' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
]

onMounted(async () => {
  try {
    await Promise.all([fetchWallet(), fetchTransactions(), loadBankAccounts()])
  } catch {
    // Wallet might not exist yet for non-sellers — handled gracefully
  }
})

const formatAmount = (amount: number) => formatKobo(amount)

const txIconBg = (type: string) => {
  if (type === 'DEBIT') return 'bg-red-100 dark:bg-red-900/20'
  if (type === 'CREDIT_PENDING') return 'bg-amber-100 dark:bg-amber-900/20'
  return 'bg-green-100 dark:bg-green-900/20'
}
const txIcon = (type: string) => {
  if (type === 'DEBIT') return 'mdi:arrow-up'
  if (type === 'CREDIT_PENDING') return 'mdi:clock-outline'
  return 'mdi:arrow-down'
}
const txIconColor = (type: string) => {
  if (type === 'DEBIT') return 'text-red-600'
  if (type === 'CREDIT_PENDING') return 'text-amber-600'
  return 'text-green-600'
}
const txAmountColor = (type: string) => {
  if (type === 'DEBIT') return 'text-red-600'
  if (type === 'CREDIT_PENDING') return 'text-amber-600'
  return 'text-green-600'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleWithdrawSuccess = async (amount: number, bankAccount: any) => {
  showWithdrawModal.value = false
  try {
    await withdraw(amount, bankAccount)
  } catch {
    // Error handled in composable
  }
}
</script>
