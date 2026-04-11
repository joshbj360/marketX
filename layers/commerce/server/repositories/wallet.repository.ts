export const walletRepository = {
  async getWalletBySellerId(sellerId: string) {
    return prisma.sellerWallet.findUnique({
      where: { sellerId },
      include: { seller: { select: { store_name: true, store_slug: true } } },
    })
  },

  async getOrCreateWallet(sellerId: string) {
    const existing = await prisma.sellerWallet.findUnique({
      where: { sellerId },
    })
    if (existing) return existing
    return prisma.sellerWallet.create({
      data: { sellerId, balance: 0, pending_balance: 0 },
    })
  },

  async getTransactions(walletId: string, limit: number, offset: number) {
    return prisma.transaction.findMany({
      where: { walletId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    })
  },

  async countTransactions(walletId: string) {
    return prisma.transaction.count({ where: { walletId } })
  },

  async createTransaction(
    walletId: string,
    data: {
      amount: number
      type: string
      description: string
      orderId?: number
    },
  ) {
    return prisma.transaction.create({
      data: { walletId, ...data },
    })
  },

  async incrementBalance(walletId: string, amount: number) {
    return prisma.sellerWallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } },
    })
  },

  async decrementBalance(walletId: string, amount: number) {
    return prisma.sellerWallet.update({
      where: { id: walletId },
      data: { balance: { decrement: amount } },
    })
  },

  async incrementPendingBalance(walletId: string, amount: number) {
    return prisma.sellerWallet.update({
      where: { id: walletId },
      data: { pending_balance: { increment: amount } },
    })
  },

  /** Move amount from pending_balance to available balance (on delivery) */
  async releasePendingToBalance(walletId: string, amount: number) {
    return prisma.sellerWallet.update({
      where: { id: walletId },
      data: {
        pending_balance: { decrement: amount },
        balance: { increment: amount },
      },
    })
  },

  async getWalletStats(walletId: string) {
    const [credits, debits] = await Promise.all([
      // Only count CREDIT and CREDIT_RELEASED — not CREDIT_PENDING (not yet earned)
      prisma.transaction.aggregate({
        where: { walletId, type: { in: ['CREDIT', 'CREDIT_RELEASED'] } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { walletId, type: 'DEBIT' },
        _sum: { amount: true },
      }),
    ])
    return {
      totalEarned: credits._sum.amount ?? 0,
      totalSpent: debits._sum.amount ?? 0,
    }
  },

  async createPayout(
    walletId: string,
    data: {
      amount: number
      bank_account: any
      transaction_ref?: string
    },
  ) {
    return prisma.payout.create({
      data: {
        walletId,
        amount: data.amount,
        status: 'PENDING',
        bank_account: data.bank_account,
        transaction_ref: data.transaction_ref,
      },
    })
  },
}
