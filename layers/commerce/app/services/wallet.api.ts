import { BaseApiClient } from "~~/layers/core/app/services/base.api"

export class WalletApiClient extends BaseApiClient {
  async getWallet() {
    return this.request('/api/commerce/wallet', { method: 'GET' })
  }
  async getTransactions(params?: { limit?: number; offset?: number }) {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : ''
    return this.request(`/api/commerce/wallet/transactions${query}`, {
      method: 'GET',
    })
  }
  async getStoreWallet(storeSlug: string) {
    return this.request(`/api/commerce/wallet/store/${storeSlug}`, {
      method: 'GET',
    })
  }
  async addFunds(amount: number) {
    return this.request('/api/commerce/wallet/add-funds', {
      method: 'POST',
      body: { amount },
    })
  }
  async withdraw(amount: number, bankAccount: any) {
    return this.request('/api/commerce/wallet/withdraw', {
      method: 'POST',
      body: { amount, bankAccount },
    })
  }
}

let instance: WalletApiClient | null = null
export const useWalletApi = () => {
  if (!instance) instance = new WalletApiClient()
  return instance
}
