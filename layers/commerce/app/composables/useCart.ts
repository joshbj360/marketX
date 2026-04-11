import { notify } from '@kyvg/vue3-notification'
import { useCartApi } from '../services/cart.api'
import { useCartStore } from '../stores/cart.store'
import type { CartItem } from '../types/cart'

export const useCart = () => {
  const api = useCartApi()
  const store = useCartStore()

  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const cartCount = computed(() => store.cartCount)
  const cartTotal = computed(() => store.cartTotal)
  const items = computed(() => store.items)

  const fetchCart = async () => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: { items: CartItem[] } } = await api.getCart()
      store.setItems(result.data?.items || [])
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to fetch cart')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const addToCart = async (variantId: number, quantity = 1) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: CartItem } = await api.addToCart(
        variantId,
        quantity,
      )
      store.addItem(result.data)
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to add to cart')
      notify({ type: 'error', text: error.message || 'Failed to add to cart' })
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const updateQuantity = async (variantId: number, quantity: number) => {
    store.updateItem(variantId, quantity) // optimistic
    try {
      const result: { data: CartItem } = await api.updateQuantity(
        variantId,
        quantity,
      )
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      await fetchCart() // revert on error
      store.setError(error.message || 'Failed to update cart')
      notify({ type: 'error', text: error.message || 'Failed to update cart' })
      throw e
    }
  }

  const removeFromCart = async (variantId: number) => {
    store.removeItem(variantId) // optimistic
    try {
      await api.removeFromCart(variantId)
    } catch (e: unknown) {
      const error = e as Error
      await fetchCart() // revert on error
      store.setError(error.message || 'Failed to remove from cart')
      notify({
        type: 'error',
        text: error.message || 'Failed to remove from cart',
      })
      throw e
    }
  }

  return {
    isLoading,
    error,
    cartCount,
    cartTotal,
    items,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  }
}
