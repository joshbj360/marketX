/**
 * PayPal Orders API v2 helper
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 * Auth: OAuth2 client credentials → Bearer token
 * Note: PayPal does not support NGN. All amounts must be in USD.
 */

function getBase() {
  return process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret)
    throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not set')
  return { clientId, clientSecret }
}

/** Exchange client credentials for an access token */
async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials()
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  )
  const res: any = await $fetch(`${getBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.access_token) throw new Error('Failed to get PayPal access token')
  return res.access_token
}

async function authHeaders() {
  const token = await getAccessToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export const paypal = {
  /**
   * Create a PayPal order. Returns the order ID and approval URL.
   * amountUSD: the charge amount in US dollars (2 decimal places)
   */
  async createOrder(params: {
    amountUSD: number
    internalOrderId: number
    description?: string
    returnUrl: string
    cancelUrl: string
  }): Promise<{ id: string; approvalUrl: string }> {
    const headers = await authHeaders()
    const res: any = await $fetch(`${getBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers,
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `stylex_${params.internalOrderId}`,
            description:
              params.description ?? `Order #${params.internalOrderId}`,
            amount: {
              currency_code: 'USD',
              value: params.amountUSD.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'stylex',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
      },
    })
    const approvalUrl = (res.links as any[])?.find(
      (l: any) => l.rel === 'approve',
    )?.href
    if (!approvalUrl) throw new Error('PayPal did not return an approval URL')
    return { id: res.id as string, approvalUrl }
  },

  /**
   * Capture a PayPal order after buyer approval.
   * paypalOrderId is the token/order ID from the return URL query param.
   */
  async captureOrder(
    paypalOrderId: string,
  ): Promise<{ status: string; captureId: string }> {
    const headers = await authHeaders()
    const res: any = await $fetch(
      `${getBase()}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers,
        body: {},
      },
    )
    const captureId = res.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? ''
    return { status: res.status as string, captureId }
  },
}

/** Convert NGN kobo → USD (major units). 1600 NGN = 1 USD */
export const NGN_TO_USD = 1600
export function koboToUSD(kobo: number): number {
  return Math.round((kobo / 100 / NGN_TO_USD) * 100) / 100
}
