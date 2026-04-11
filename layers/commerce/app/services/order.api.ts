import { BaseApiClient } from "~~/layers/core/app/services/base.api"

export class OrderApiClient extends BaseApiClient {
  async getOrders(params?: { limit?: number; offset?: number }) {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : ''
    return this.request(`/api/commerce/orders${query}`, { method: 'GET' })
  }
  async getOrderById(id: number) {
    return this.request(`/api/commerce/orders/${id}`, { method: 'GET' })
  }
  async placeOrder(data: any) {
    return this.request('/api/commerce/orders', { method: 'POST', body: data })
  }
  async cancelOrder(id: number) {
    return this.request(`/api/commerce/orders/${id}/cancel`, { method: 'POST' })
  }
  async initializePayment(data: any) {
    return this.request('/api/commerce/payments/initialize', {
      method: 'POST',
      body: data,
    })
  }
  async verifyPayment(reference: string) {
    return this.request('/api/commerce/payments/verify', {
      method: 'POST',
      body: { reference },
    })
  }
  async getSellerOrders(
    storeSlug: string,
    params?: { status?: string; limit?: number; offset?: number },
  ) {
    const q = new URLSearchParams({ storeSlug, ...(params as any) }).toString()
    return this.request(`/api/commerce/orders/seller?${q}`, { method: 'GET' })
  }
  async updateOrderStatus(
    id: number,
    body: { status: string; trackingNumber?: string; shipper?: string },
  ) {
    return this.request(`/api/commerce/orders/${id}/status`, {
      method: 'PATCH',
      body,
    })
  }
  async initializePayPal(data: any) {
    return this.request('/api/commerce/payments/paypal/create', {
      method: 'POST',
      body: data,
    })
  }
  async capturePayPal(data: { orderId: number; paypalOrderId: string }) {
    return this.request('/api/commerce/payments/paypal/capture', {
      method: 'POST',
      body: data,
    })
  }
  async confirmReceipt(id: number) {
    return this.request(`/api/commerce/orders/${id}/confirm-receipt`, {
      method: 'POST',
    })
  }
}

let instance: OrderApiClient | null = null
export const useOrderApi = () => {
  if (!instance) instance = new OrderApiClient()
  return instance
}
