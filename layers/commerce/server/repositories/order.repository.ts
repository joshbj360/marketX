
const orderInclude = {
  orderItem: {
    include: {
      variant: {
        select: {
          id: true,
          size: true,
          price: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              seller: { select: { store_slug: true, store_name: true } },
              media: {
                take: 1,
                where: { isBgMusic: false },
                select: { id: true, url: true, type: true },
              },
            },
          },
        },
      },
    },
  },
}

export const orderRepository = {
  async createOrder(userId: string, data: any) {
    return prisma.orders.create({
      data: {
        userId,
        stripeId: data.stripeId || `order_${Date.now()}_${userId.slice(0, 8)}`,
        name: data.name,
        address: data.address,
        zipcode: data.zipcode,
        county: data.county || '',
        country: data.country,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod || 'card',
        ...(data.affiliateUserId
          ? { affiliateUserId: data.affiliateUserId }
          : {}),
        ...(data.affiliateCut ? { affiliateCut: data.affiliateCut } : {}),
        orderItem: {
          create: data.items.map((item: any) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price ?? 0,
            affiliateCut: item.affiliateCut ?? 0,
          })),
        },
      },
      include: orderInclude,
    })
  },

  async getUserOrders(userId: string, limit: number, offset: number) {
    return prisma.orders.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    })
  },

  async getOrderById(id: number) {
    return prisma.orders.findUnique({ where: { id }, include: orderInclude })
  },

  async updateOrderStatus(id: number, status: string) {
    return prisma.orders.update({
      where: { id },
      data: { status: status as any },
      include: orderInclude,
    })
  },

  async countUserOrders(userId: string) {
    return prisma.orders.count({ where: { userId } })
  },
}
