import { useWalletApi } from '../services/wallet.api'
import { useWalletStore } from '../stores/wallet.store'
import { extractErrorMessage } from '~~/layers/core/app/utils/errors'

export const useWallet = () => {
  const api = useWalletApi()
  const store = useWalletStore()

  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const balance = computed(() => store.balance)
  const pendingBalance = computed(() => store.pendingBalance)
  const stats = computed(() => store.stats)
  const storeWallets = computed(() => store.storeWallets)
  const transactions = computed(() => store.transactions)

  const fetchWallet = async () => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: any = await api.getWallet()
      store.setWallet(
        result.data?.wallet,
        result.data?.stats,
        result.data?.stores,
      )
      return result.data
    } catch (e: any) {
      store.setError(extractErrorMessage(e, 'Failed to fetch wallet'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const fetchTransactions = async (limit = 20, offset = 0) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: any = await api.getTransactions({ limit, offset })
      if (offset === 0) {
        store.setTransactions(result.data?.transactions, result.data?.total)
      } else {
        store.addTransactions(result.data?.transactions)
      }
      return result.data
    } catch (e: any) {
      store.setError(extractErrorMessage(e, 'Failed to fetch transactions'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const addFunds = async (amount: number) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: any = await api.addFunds(amount)
      await fetchWallet()
      return result.data
    } catch (e: any) {
      store.setError(extractErrorMessage(e, 'Failed to add funds'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const withdraw = async (amount: number, bankAccount: any) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: any = await api.withdraw(amount, bankAccount)
      await fetchWallet()
      return result.data
    } catch (e: any) {
      store.setError(extractErrorMessage(e, 'Failed to withdraw'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  return {
    isLoading,
    error,
    balance,
    pendingBalance,
    stats,
    storeWallets,
    transactions,
    fetchWallet,
    fetchTransactions,
    addFunds,
    withdraw,
  }
}
