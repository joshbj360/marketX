import { useAffiliateApi } from '../services/affiliate.api'
import { useAffiliateStore } from '../stores/affiliate.store'
import { extractErrorMessage } from '~~/layers/core/app/utils/errors'
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
      store.setError(extractErrorMessage(e, 'Failed to fetch affiliate status'))
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
      store.setError(
        extractErrorMessage(e, 'Failed to enroll in affiliate program'),
      )
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
      store.setError(extractErrorMessage(e, 'Failed to fetch referrals'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const REF_KEY = 'mx_affiliate_ref'
  const REF_EXP_KEY = 'mx_affiliate_ref_exp'
  const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

  /** Capture ?ref=CODE from the current URL and store it with a 30-day TTL */
  const captureAffiliateRef = () => {
    if (!import.meta.client) return
    const route = useRoute()
    const ref = route.query.ref as string | undefined
    if (!ref) return
    localStorage.setItem(REF_KEY, ref)
    localStorage.setItem(REF_EXP_KEY, String(Date.now() + REF_TTL_MS))
  }

  /** Returns the stored affiliate code if it hasn't expired */
  const getStoredRef = (): string | null => {
    if (!import.meta.client) return null
    const code = localStorage.getItem(REF_KEY)
    const exp = Number(localStorage.getItem(REF_EXP_KEY) || 0)
    if (!code || Date.now() > exp) {
      localStorage.removeItem(REF_KEY)
      localStorage.removeItem(REF_EXP_KEY)
      return null
    }
    return code
  }

  /** Clear after a successful order */
  const clearStoredRef = () => {
    if (!import.meta.client) return
    localStorage.removeItem(REF_KEY)
    localStorage.removeItem(REF_EXP_KEY)
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
