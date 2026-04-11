import { BaseApiClient } from "~~/layers/core/app/services/base.api"

export class AffiliateApiClient extends BaseApiClient {
  async getAffiliateStatus() {
    return this.request('/api/commerce/affiliate', { method: 'GET' })
  }
  async enroll() {
    return this.request('/api/commerce/affiliate/enroll', { method: 'POST' })
  }
  async getReferrals(params?: { limit?: number; offset?: number }) {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : ''
    return this.request(`/api/commerce/affiliate/referrals${query}`, {
      method: 'GET',
    })
  }
  async getSellerProducts() {
    return this.request('/api/commerce/affiliate/seller-products', {
      method: 'GET',
    })
  }

  async getAvailableProducts(params?: { limit?: number; offset?: number }) {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : ''
    return this.request(`/api/commerce/affiliate/available-products${query}`, {
      method: 'GET',
    })
  }
}

let instance: AffiliateApiClient | null = null
export const useAffiliateApi = () => {
  if (!instance) instance = new AffiliateApiClient()
  return instance
}
