import { BaseApiClient } from "~~/layers/core/app/services/base.api"

export class CartApiClient extends BaseApiClient {
  async getCart() {
    return this.request('/api/commerce/cart', { method: 'GET' })
  }
  async addToCart(variantId: number, quantity = 1) {
    return this.request('/api/commerce/cart', {
      method: 'POST',
      body: { variantId, quantity },
      silent: true,
    })
  }
  async updateQuantity(variantId: number, quantity: number) {
    return this.request(`/api/commerce/cart/${variantId}`, {
      method: 'PATCH',
      body: { quantity },
      silent: true,
    })
  }
  async removeFromCart(variantId: number) {
    return this.request(`/api/commerce/cart/${variantId}`, {
      method: 'DELETE',
      silent: true,
    })
  }
}

let instance: CartApiClient | null = null
export const useCartApi = () => {
  if (!instance) instance = new CartApiClient()
  return instance
}
