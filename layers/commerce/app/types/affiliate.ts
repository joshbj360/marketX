export interface AffiliateStatus {
  isEnrolled: boolean
  affiliateCode: string | null
  stats: {
    totalEarnings: number
    pendingEarnings: number
    totalConversions: number
  }
}

export interface AffiliateEnrollment {
  isEnrolled: boolean
  affiliateCode: string
}

export interface Referral {
  id: string
  name: string
}

export interface ReferralsResponse {
  referrals: Referral[]
  total: number
  limit: number
  offset: number
}
