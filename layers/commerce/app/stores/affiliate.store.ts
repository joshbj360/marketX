export const useAffiliateStore = defineStore('affiliate', () => {
  const isEnrolled = ref(false)
  const affiliateCode = ref<string | null>(null)
  const stats = ref({
    totalEarnings: 0,
    pendingEarnings: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
  })
  const referrals = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  return {
    isEnrolled,
    affiliateCode,
    stats,
    referrals,
    isLoading,
    error,
    setStatus: (enrolled: boolean, code: string | null, newStats: any) => {
      isEnrolled.value = enrolled
      affiliateCode.value = code
      stats.value = { ...stats.value, ...newStats }
    },
    setReferrals: (r: any[]) => {
      referrals.value = r
    },
    setLoading: (val: boolean) => {
      isLoading.value = val
    },
    setError: (val: string | null) => {
      error.value = val
    },
  }
})
