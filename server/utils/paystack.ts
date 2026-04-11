/**
 * Paystack API helper
 * Wraps the Paystack REST API for transaction initialization and verification.
 * Extend this file to add other Paystack features (transfers, subscriptions, etc.)
 */

const PAYSTACK_BASE = 'https://api.paystack.co'

function getSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set')
  return key
}

function paystackHeaders() {
  return {
    Authorization: `Bearer ${getSecret()}`,
    'Content-Type': 'application/json',
  }
}

export interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    status: 'success' | 'failed' | 'abandoned'
    reference: string
    amount: number // in kobo
    currency: string
    customer: { email: string }
    metadata: Record<string, any>
  }
}

export const paystack = {
  /**
   * Initialize a transaction. Returns the hosted payment page URL.
   * amount is in CENTS (kobo for NGN, pesewas for GHS, etc.)
   */
  async initializeTransaction(params: {
    email: string
    amount: number // in cents
    reference: string
    currency?: string
    metadata?: Record<string, any>
    callback_url?: string
  }): Promise<PaystackInitResponse> {
    const res = await $fetch<PaystackInitResponse>(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        method: 'POST',
        headers: paystackHeaders(),
        body: {
          email: params.email,
          amount: params.amount,
          reference: params.reference,
          currency: params.currency || 'NGN',
          metadata: params.metadata || {},
          callback_url: params.callback_url,
        },
      },
    )
    if (!res.status)
      throw new Error(res.message || 'Paystack initialization failed')
    return res
  },

  /**
   * Verify a transaction by reference.
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    const res = await $fetch<PaystackVerifyResponse>(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      { method: 'GET', headers: paystackHeaders() },
    )
    if (!res.status)
      throw new Error(res.message || 'Paystack verification failed')
    return res
  },
}
