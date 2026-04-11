import type { Product, ProductVariant } from '~~/shared/types/product'

export interface CartItem {
  id: string
  quantity: number
  variant: ProductVariant & {
    product: Product
  }
}
