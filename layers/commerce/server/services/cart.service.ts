import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditService } from '~~/server/layers/shared/audit/audit.service'
import { cartRepository } from '../repositories/cart.repository'

export const cartService = {
  async getCart(userId: string) {
    const items = await cartRepository.getCartItems(userId)
    return { items }
  },

  async addToCart(userId: string, variantId: number, quantity: number = 1) {
    if (quantity < 1)
      throw new UserError(
        'INVALID_QUANTITY',
        'Quantity must be at least 1',
        400,
      )

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, stock: true },
    })
    if (!variant)
      throw new UserError('VARIANT_NOT_FOUND', 'Product variant not found', 404)
    if (variant.stock < quantity)
      throw new UserError(
        'INSUFFICIENT_STOCK',
        'Not enough stock available',
        400,
      )

    const item = await cartRepository.addToCart(userId, variantId, quantity)
    auditService
      .logUserAction({
        userId,
        action: 'CART_ITEM_ADDED',
        resource: 'CartItem',
        resourceId: String(variantId),
        reason: `Added variant ${variantId} x${quantity}`,
      })
      .catch((e: Error) => logger.warn('Audit log failed', { action: 'cart', error: e.message }))
    return item
  },

  async updateQuantity(userId: string, variantId: number, quantity: number) {
    if (quantity < 1)
      throw new UserError(
        'INVALID_QUANTITY',
        'Quantity must be at least 1',
        400,
      )

    const existing = await cartRepository.getCartItem(userId, variantId)
    if (!existing)
      throw new UserError('ITEM_NOT_FOUND', 'Cart item not found', 404)

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true },
    })
    if (!variant || variant.stock < quantity) {
      throw new UserError(
        'INSUFFICIENT_STOCK',
        'Not enough stock available',
        400,
      )
    }

    const item = await cartRepository.updateCartItem(
      userId,
      variantId,
      quantity,
    )
    auditService
      .logUserAction({
        userId,
        action: 'CART_ITEM_UPDATED',
        resource: 'CartItem',
        resourceId: String(variantId),
        reason: `Updated variant ${variantId} to qty ${quantity}`,
      })
      .catch((e: Error) => logger.warn('Audit log failed', { action: 'cart', error: e.message }))
    return item
  },

  async removeFromCart(userId: string, variantId: number) {
    const existing = await cartRepository.getCartItem(userId, variantId)
    if (!existing)
      throw new UserError('ITEM_NOT_FOUND', 'Cart item not found', 404)
    const result = await cartRepository.removeFromCart(userId, variantId)
    auditService
      .logUserAction({
        userId,
        action: 'CART_ITEM_REMOVED',
        resource: 'CartItem',
        resourceId: String(variantId),
        reason: `Removed variant ${variantId}`,
      })
      .catch((e: Error) => logger.warn('Audit log failed', { action: 'cart', error: e.message }))
    return result
  },

  async clearCart(userId: string) {
    const result = await cartRepository.clearCart(userId)
    auditService
      .logUserAction({
        userId,
        action: 'CART_CLEARED',
        resource: 'Cart',
        resourceId: userId,
        reason: 'Cart cleared',
      })
      .catch((e: Error) => logger.warn('Audit log failed', { action: 'cart', error: e.message }))
    return result
  },
}
