import type { IOrder } from '../types/commerce.types'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<IOrder[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getOrderById = (id: number) => orders.value.find((o) => o.id === id)

  const setOrders = (newOrders: IOrder[], newTotal: number) => {
    orders.value = newOrders
    total.value = newTotal
  }

  const addOrders = (newOrders: IOrder[]) => {
    const existingIds = new Set(orders.value.map((o) => o.id))
    orders.value = [
      ...orders.value,
      ...newOrders.filter((o) => !existingIds.has(o.id)),
    ]
  }

  const updateOrder = (order: IOrder) => {
    const idx = orders.value.findIndex((o) => o.id === order.id)
    if (idx !== -1) orders.value[idx] = order
    else orders.value.unshift(order)
  }

  return {
    orders,
    total,
    isLoading,
    error,
    getOrderById,
    setOrders,
    addOrders,
    updateOrder,
    setLoading: (val: boolean) => {
      isLoading.value = val
    },
    setError: (val: string | null) => {
      error.value = val
    },
  }
})
