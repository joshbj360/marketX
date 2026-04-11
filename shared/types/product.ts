import type { Seller } from './seller'
import type { Media } from './media'

export interface Product {
  id: string
  title: string
  description: string
  price: number
  status: string
  seller: Partial<Seller>
  media: Media[]
}

export interface ProductVariant {
  id: number
  name: string
  price: number
  stock: number
}

export interface ProductData {
  title: string
  description: string
  price: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  tags: { name: string }[]
  media: { id: string; url: string }[]
  variants: { name: string; price: number; stock: number }[]
}
