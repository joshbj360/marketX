import type { Seller } from '~~/shared/types/seller'
import type { Category } from '~~/shared/types/category'

/**
 * Fetch global layout data (top sellers, categories)
 * Cached across all pages via useLazyAsyncData key 'layout-data'
 */
export const useLayoutData = () => {
  return useLazyAsyncData(
    'layout-data',
    async () => {
      const [sellersRes, categoriesRes] = await Promise.allSettled([
        $fetch<{ data: Seller[] }>('/api/seller/featured'),
        $fetch<{ data: Category[] }>('/api/commerce/categories'),
      ])
      return {
        topSellers:
          sellersRes.status === 'fulfilled' ? sellersRes.value?.data ?? [] : [],
        categories:
          categoriesRes.status === 'fulfilled'
            ? categoriesRes.value?.data ?? []
            : [],
      }
    },
    {
      server: false,
      dedupe: 'defer',
      default: () => ({
        topSellers: [] as Seller[],
        categories: [] as Category[],
      }),
    },
  )
}
