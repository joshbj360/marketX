import type { CartItem } from './cart'

export interface Order {
  id: number
  userId: string
  stripeId: string
  name: string
  address: string
  zipcode: string
  county: string
  country: string
  totalAmount: number
  paymentMethod: string
  affiliateUserId?: string
  affiliateCut?: number
  orderItem: CartItem[]
  status: string
  created_at: string
}

export interface PlaceOrderData {
  items: { variantId: number; quantity: number }[]
  name: string
  address: string
  zipcode: string
  county?: string
  country: string
  paymentMethod?: string
  affiliateCode?: string
}
