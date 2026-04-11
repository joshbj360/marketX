import { useAffiliateApi } from '../services/affiliate.api'
import { useAffiliateStore } from '../stores/affiliate.store'
import type {
  AffiliateStatus,
  AffiliateEnrollment,
  ReferralsResponse,
} from '../types/affiliate'

export const useAffiliate = () => {
  const api = useAffiliateApi()
  const store = useAffiliateStore()

  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const isEnrolled = computed(() => store.isEnrolled)
  const affiliateCode = computed(() => store.affiliateCode)
  const stats = computed(() => store.stats)
  const referrals = computed(() => store.referrals)

  const fetchAffiliateStatus = async () => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: AffiliateStatus } = await api.getAffiliateStatus()
      store.setStatus(
        result.data?.isEnrolled,
        result.data?.affiliateCode,
        result.data?.stats || {},
      )
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to fetch affiliate status')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const enroll = async () => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: AffiliateEnrollment } = await api.enroll()
      await fetchAffiliateStatus()
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to enroll in affiliate program')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const fetchReferrals = async (limit = 20, offset = 0) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: ReferralsResponse } = await api.getReferrals({
        limit,
        offset,
      })
      store.setReferrals(result.data?.referrals || [])
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to fetch referrals')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  /** Call this on any page to capture ?ref=CODE from the URL into localStorage */
  const captureAffiliateRef = () => {
    if (!import.meta.client) return
    const route = useRoute()
    const ref = route.query.ref as string | undefined
    if (ref) {
      localStorage.setItem('affiliate_ref', ref)
    }
  }

  /** Returns the stored affiliate code (for attaching to order payload) */
  const getStoredRef = (): string | null => {
    if (!import.meta.client) return null
    return localStorage.getItem('affiliate_ref')
  }

  /** Clear after a successful order */
  const clearStoredRef = () => {
    if (!import.meta.client) return
    localStorage.removeItem('affiliate_ref')
  }

  return {
    isLoading,
    error,
    isEnrolled,
    affiliateCode,
    stats,
    referrals,
    fetchAffiliateStatus,
    enroll,
    fetchReferrals,
    captureAffiliateRef,
    getStoredRef,
    clearStoredRef,
  }
}
