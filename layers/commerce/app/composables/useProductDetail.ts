import { ref } from 'vue'
import { useRouter } from '#imports'
import type { IProduct } from '../types/commerce.types'

export const useProductDetail = () => {
  const router = useRouter()

  // Kept as stubs so existing template bindings (:product="selectedProduct" v-if="selectedProduct") compile and stay inert.
  const selectedProduct = ref<IProduct | null>(null)
  const detailLoading = ref(false)

  const prefetchProduct = (_id: number) => {}

  const openProduct = (productOrId: IProduct | number) => {
    const slug =
      typeof productOrId === 'object' ? (productOrId as IProduct).slug : null
    if (slug) {
      router.push(`/product/${slug}`)
    } else {
      const id = typeof productOrId === 'number' ? productOrId : productOrId.id
      router.push(`/product/${id}`)
    }
  }

  return { selectedProduct, detailLoading, openProduct, prefetchProduct }
}
