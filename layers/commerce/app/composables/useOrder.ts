import { useOrderApi } from '../services/order.api'
import { useOrderStore } from '../stores/order.store'
import type { Order } from '../types/order'

export const useOrder = () => {
  const api = useOrderApi()
  const store = useOrderStore()

  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const orders = computed(() => store.orders)
  const total = computed(() => store.total)

  const fetchMyOrders = async (limit = 20, offset = 0) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: { orders: Order[]; total: number } } =
        await api.getOrders({ limit, offset })
      const { orders: newOrders, total: newTotal } = result.data
      if (offset === 0) {
        store.setOrders(newOrders, newTotal)
      } else {
        store.addOrders(newOrders)
      }
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to fetch orders')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const getOrderById = async (id: number) => {
    const cached = store.getOrderById(id)
    if (cached) return cached
    store.setLoading(true)
    try {
      const result: { data: Order } = await api.getOrderById(id)
      store.updateOrder(result.data)
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Order not found')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const placeOrder = async (data: PlaceOrderData) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: Order } = await api.placeOrder(data)
      store.updateOrder(result.data)
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to place order')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  const cancelOrder = async (id: number) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const result: { data: Order } = await api.cancelOrder(id)
      store.updateOrder(result.data)
      return result.data
    } catch (e: unknown) {
      const error = e as Error
      store.setError(error.message || 'Failed to cancel order')
      throw e
    } finally {
      store.setLoading(false)
    }
  }

  return {
    isLoading,
    error,
    orders,
    total,
    fetchMyOrders,
    getOrderById,
    placeOrder,
    cancelOrder,
  }
}
