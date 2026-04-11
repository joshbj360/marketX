import { BaseApiClient } from './base.api'
import type { User } from '../types/user'
import type { Product } from '~~/shared/types/product'
import type { Post } from '~~/shared/types/post'
import type { Tag } from '~~/shared/types/tag'

export class SearchApiClient extends BaseApiClient {
  // FIXED: Added 'stores' to the acceptable types
  async search(
    query: string,
    type: 'all' | 'users' | 'products' | 'posts' | 'stores' = 'all',
    limit = 10,
    offset = 0,
  ): Promise<{
    success: boolean
    data: {
      users: User[]
      products: Product[]
      posts: Post[]
      stores: User[]
      tags: Tag[]
    }
  }> {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: String(limit),
      offset: String(offset),
    })
    return this.request(`/api/search?${params.toString()}`, { method: 'GET' })
  }
}

let instance: SearchApiClient | null = null
export const useSearchApi = () => {
  if (!instance) instance = new SearchApiClient()
  return instance
}
