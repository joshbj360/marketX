// FILE PATH: layers/seller/app/stores/seller.store.ts

import type { ISellerProfile } from '../types/seller.types'

export const useSellerStore = defineStore('seller', () => {
  // State
  const sellers = ref<ISellerProfile[]>([])
  const currentSeller = ref<ISellerProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const message = ref<string | null>(null)

  // Getters
  const hasSellers = computed(() => sellers.value.length > 0)
  const sellerCount = computed(() => sellers.value.length)
  const activeSellers = computed(() => sellers.value.filter((s) => s.is_active))
  const inactiveSellers = computed(() =>
    sellers.value.filter((s) => !s.is_active),
  )

  // Actions - State Management
  const setSellers = (newSellers: ISellerProfile[]) => {
    sellers.value = newSellers
  }

  const addSeller = (seller: ISellerProfile) => {
    sellers.value.push(seller)
  }

  const updateSeller = (sellerId: string, updates: Partial<ISellerProfile>) => {
    const index = sellers.value.findIndex((s) => s.id === sellerId)
    if (index !== -1) {
      sellers.value[index] = { ...sellers.value[index], ...updates }
    }
  }

  const removeSeller = (sellerId: string) => {
    sellers.value = sellers.value.filter((s) => s.id !== sellerId)
  }

  const setCurrentSeller = (seller: ISellerProfile | null) => {
    currentSeller.value = seller
  }

  const clearCurrentSeller = () => {
    currentSeller.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (err: string | null) => {
    error.value = err
  }

  const setMessage = (msg: string | null) => {
    message.value = msg
    if (msg) {
      setTimeout(() => {
        message.value = null
      }, 5000)
    }
  }

  const clearAllSellers = () => {
    sellers.value = []
    currentSeller.value = null
  }

  return {
    sellers,
    currentSeller,
    isLoading,
    error,
    message,
    hasSellers,
    sellerCount,
    activeSellers,
    inactiveSellers,
    setSellers,
    addSeller,
    updateSeller,
    removeSeller,
    setCurrentSeller,
    clearCurrentSeller,
    setLoading,
    setError,
    setMessage,
    clearAllSellers,
  }
})
