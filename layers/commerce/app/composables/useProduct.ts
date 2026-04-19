import { useProductApi } from '../services/product.api'
import { useProductStore } from '../stores/product.store'
import { extractErrorMessage } from '~~/layers/core/app/utils/errors'
import type { Product } from '~~/shared/types/product'
import type { Category } from '~~/shared/types/category'

export const useProduct = () => {
  const api = useProductApi()
  const store = useProductStore()

  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)

  const fetchProducts = async (params?: {
    status?: string
    search?: string
    sellerId?: string
    limit?: number
    offset?: number
    isThrift?: boolean
    categorySlug?: string
  }) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: { products: Product[] } } =
        await api.getProducts(params)
      store.addProducts(result.data?.products || [])
      return result.data
    } catch (e: unknown) {
      store.setError(extractErrorMessage(e, 'Failed to fetch products'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const fetchSellerProducts = async (
    storeSlug: string,
    params?: { status?: string; limit?: number; offset?: number; search?: string },
  ) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: { products: Product[] } } =
        await api.getSellerProducts(storeSlug, params)
      store.addProducts(result.data?.products || [], storeSlug)
      return result.data
    } catch (e: unknown) {
      store.setError(extractErrorMessage(e, 'Failed to fetch seller products'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const getProductById = async (id: number) => {
    const cached = store.getProductById(id)
    if (cached) return cached
    store.setLoading(true)
    try {
      const result: { data: Product } = await api.getProductById(id)
      store.setProduct(result.data)
      return result.data
    } catch (e: unknown) {
      store.setError(extractErrorMessage(e, 'Product not found'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const createProduct = async (data: ProductData) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: Product } = await api.createProduct(data)
      store.setProduct(result.data)
      return result.data
    } catch (e: unknown) {
      store.setError(extractErrorMessage(e, 'Failed to create product'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const updateProduct = async (id: number, data: Partial<ProductData>) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: Product } = await api.updateProduct(id, data)
      store.setProduct(result.data)
      return result.data
    } catch (e: unknown) {
      store.setError(extractErrorMessage(e, 'Failed to update product'))
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      await api.deleteProduct(id)
      store.removeProduct(id)
    } catch (e: unknown) {
      store.setError(extractErrorMessage(e, 'Failed to delete product'))
      throw e
    }
  }

  const likeProduct = async (id: number) => {
    return api.likeProduct(id)
  }

  const unlikeProduct = async (id: number) => {
    return api.unlikeProduct(id)
  }

  const fetchCategories = async () => {
    const result: { data: Category[] } = await api.getCategories()
    return result.data || []
  }

  return {
    isLoading,
    error,
    fetchProducts,
    fetchSellerProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    likeProduct,
    unlikeProduct,
    fetchCategories,
    store,
  }
}
