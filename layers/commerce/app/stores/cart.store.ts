import type { ICartItem, IProductOffer } from '../types/commerce.types'

/** Returns the effective unit price for a cart item after all discounts.
 *  1. product.discount  — general sale % (always applied)
 *  2. best active offer — bulk % applied on top when minQuantity is met
 */
export function effectiveUnitPrice(item: ICartItem): number {
  const base = item.variant?.price ?? item.variant?.product?.price ?? 0
  const productDiscount = item.variant?.product?.discount ?? 0
  let price = base * (1 - productDiscount / 100)

  const offers: IProductOffer[] = item.variant?.product?.offers ?? []
  const bestOffer = offers
    .filter((o) => o.isActive && item.quantity >= o.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0]

  if (bestOffer) {
    price = price * (1 - bestOffer.discount / 100)
  }

  return price
}

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref<ICartItem[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const cartCount = computed(() =>
      items.value.reduce((sum, item) => sum + item.quantity, 0),
    )
    const cartTotal = computed(() =>
      items.value.reduce(
        (sum, item) => sum + effectiveUnitPrice(item) * item.quantity,
        0,
      ),
    )

    const setItems = (newItems: ICartItem[]) => {
      items.value = newItems
    }

    const updateItem = (variantId: number, quantity: number) => {
      const item = items.value.find((i) => i.variantId === variantId)
      if (item) item.quantity = quantity
    }

    const removeItem = (variantId: number) => {
      items.value = items.value.filter((i) => i.variantId !== variantId)
    }

    const addItem = (item: ICartItem) => {
      const existing = items.value.find((i) => i.variantId === item.variantId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        items.value.push(item)
      }
    }

    return {
      items,
      isLoading,
      error,
      cartCount,
      cartTotal,
      setItems,
      updateItem,
      removeItem,
      addItem,
      setLoading: (val: boolean) => {
        isLoading.value = val
      },
      setError: (val: string | null) => {
        error.value = val
      },
      clearStore: () => {
        items.value = []
        isLoading.value = false
        error.value = null
      },
    }
  },
  { persist: true },
)
