const cartInclude = {
  variant: {
    select: {
      id: true,
      size: true,
      stock: true,
      price: true,
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          discount: true,
          seller: { select: { store_slug: true, store_name: true } },
          media: {
            take: 1,
            where: { isBgMusic: false },
            select: { id: true, url: true, type: true },
          },
          offers: {
            where: { isActive: true },
            orderBy: { minQuantity: 'desc' as const },
            select: {
              id: true,
              minQuantity: true,
              discount: true,
              label: true,
            },
          },
        },
      },
    },
  },
}

export const cartRepository = {
  async getCartItems(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: cartInclude,
      orderBy: { created_at: 'desc' },
    })
  },

  async addToCart(userId: string, variantId: number, quantity: number) {
    return prisma.cartItem.upsert({
      where: { userId_variantId: { userId, variantId } },
      update: { quantity: { increment: quantity } },
      create: { userId, variantId, quantity },
      include: cartInclude,
    })
  },

  async updateCartItem(userId: string, variantId: number, quantity: number) {
    return prisma.cartItem.update({
      where: { userId_variantId: { userId, variantId } },
      data: { quantity },
      include: cartInclude,
    })
  },

  async removeFromCart(userId: string, variantId: number) {
    return prisma.cartItem.delete({
      where: { userId_variantId: { userId, variantId } },
    })
  },

  async clearCart(userId: string) {
    return prisma.cartItem.deleteMany({ where: { userId } })
  },

  async getCartItem(userId: string, variantId: number) {
    return prisma.cartItem.findUnique({
      where: { userId_variantId: { userId, variantId } },
      include: cartInclude,
    })
  },
}
