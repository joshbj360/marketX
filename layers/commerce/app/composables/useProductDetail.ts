import { ref } from 'vue'
import { useProductApi } from '../services/product.api'
import type { IProduct } from '../types/commerce.types'

/**
 * Centralises the product-detail open/prefetch pattern used by the feed,
 * discover and category pages.
 *
 * Usage:
 *   const { selectedProduct, detailLoading, openProduct, prefetchProduct } = useProductDetail()
 *
 *   // In template:
 *   @mouseenter="prefetchProduct(product.id)"
 *   @touchstart.passive="prefetchProduct(product.id)"
 *   @click="openProduct(product)"
 *
 *   <ProductDetailModal :product="selectedProduct" :loading="detailLoading" @close="selectedProduct = null" />
 */
export const useProductDetail = () => {
  const api = useProductApi()

  // In-flight / resolved promises keyed by product id.
  // Shared across callers within the same component tree so repeated
  // prefetch calls on the same id are no-ops.
  const cache = new Map<number, Promise<IProduct | null>>()

  const selectedProduct = ref<IProduct | null>(null)
  const detailLoading = ref(false)

  /** Fire a background fetch so data is ready before the user clicks. */
  const prefetchProduct = (id: number) => {
    if (cache.has(id)) return
    const p = api
      .getProductById(id)
      .then((res: any) => (res?.data as IProduct) ?? null)
      .catch(() => null)
    cache.set(id, p)
  }

  /**
   * Open the modal immediately with whatever partial data is available,
   * then swap to full product data (all media + variants) once the fetch
   * resolves. If prefetchProduct was called earlier, this awaits the
   * already-in-flight request — no second round-trip.
   */
  const openProduct = async (productOrId: IProduct | number) => {
    const partial: IProduct | null =
      typeof productOrId === 'number' ? null : productOrId
    const id: number =
      typeof productOrId === 'number' ? productOrId : productOrId.id

    // Show partial data immediately so the modal isn't blank.
    if (partial) selectedProduct.value = partial

    if (!id) return

    // Reuse an in-flight prefetch or start a fresh fetch.
    if (!cache.has(id)) prefetchProduct(id)

    detailLoading.value = true
    try {
      const full = await cache.get(id)!
      if (full) selectedProduct.value = full
    } finally {
      detailLoading.value = false
    }
  }

  return { selectedProduct, detailLoading, openProduct, prefetchProduct }
}
