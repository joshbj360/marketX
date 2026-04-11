export const useWalletStore = defineStore('wallet', () => {
  const wallet = ref<any>(null)
  const stats = ref<any>({ totalEarned: 0, totalSpent: 0 })
  const storeWallets = ref<any[]>([])
  const transactions = ref<any[]>([])
  const transactionsTotal = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const balance = computed(() => wallet.value?.balance ?? 0)
  const pendingBalance = computed(() => wallet.value?.pending_balance ?? 0)

  return {
    wallet,
    stats,
    storeWallets,
    transactions,
    transactionsTotal,
    isLoading,
    error,
    balance,
    pendingBalance,
    setWallet: (w: any, s: any, stores?: any[]) => {
      wallet.value = w
      stats.value = s
      storeWallets.value = stores ?? []
    },
    setTransactions: (t: any[], total: number) => {
      transactions.value = t
      transactionsTotal.value = total
    },
    addTransactions: (t: any[]) => {
      transactions.value = [...transactions.value, ...t]
    },
    setLoading: (val: boolean) => {
      isLoading.value = val
    },
    setError: (val: string | null) => {
      error.value = val
    },
  }
})
