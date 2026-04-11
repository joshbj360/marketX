export interface Seller {
  id: string
  store_name: string
  store_slug: string
  store_logo: string
  store_banner: string
  store_description: string
  is_verified: boolean
  followers_count: number
  _count: {
    products: number
  }
}
