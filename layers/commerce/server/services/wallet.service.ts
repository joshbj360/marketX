import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditQueue } from '~~/server/queues/audit.queue'
import { walletRepository } from '../repositories/wallet.repository'

export const walletService = {
  /**
   * Called when payment is confirmed (PAID).
   * Credits each seller's pending_balance. Stores transactions as 'CREDIT_PENDING'
   * so the exact same amounts can be released on delivery without recalculation.
   */
  async creditSellersOnPayment(orderId: number) {
    // Idempotency guard — skip if already credited for this order
    const existing = await prisma.transaction.findFirst({
      where: { orderId, type: { in: ['CREDIT_PENDING', 'CREDIT'] } },
    })
    if (existing) return

    const items = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                price: true,
                discount: true,
                seller: { select: { id: true } },
              },
            },
          },
        },
      },
    })

    const sellerAmounts = new Map<string, number>()
    for (const item of items) {
      const product = item.variant.product
      const sellerId = product.seller?.id
      if (!sellerId) continue
      const price = item.variant.price ?? product.price
      const discount = product.discount ?? 0
      const amountKobo = Math.round(
        price * (1 - discount / 100) * item.quantity * 100,
      )
      sellerAmounts.set(
        sellerId,
        (sellerAmounts.get(sellerId) ?? 0) + amountKobo,
      )
    }

    for (const [sellerId, amount] of sellerAmounts) {
      if (amount <= 0) continue
      const wallet = await walletRepository.getOrCreateWallet(sellerId)
      await walletRepository.incrementPendingBalance(wallet.id, amount)
      // Store as CREDIT_PENDING — this exact record is used for the release
      await walletRepository.createTransaction(wallet.id, {
        amount,
        type: 'CREDIT_PENDING',
        description: `Order #${orderId} — payment held pending delivery`,
        orderId,
      })
    }
  },

  /**
   * Called when order status moves to DELIVERED.
   * Finds the CREDIT_PENDING transactions for this order and releases the
   * exact same amounts — no recalculation, no floating-point drift.
   * Also credits the affiliate wallet if this order had a referral.
   */
  async releaseFundsOnDelivery(orderId: number) {
    // Idempotency guard — skip if already released
    const alreadyReleased = await prisma.transaction.findFirst({
      where: { orderId, type: 'CREDIT_RELEASED' },
    })
    if (alreadyReleased) return

    // Find the pending credits that were created at payment time
    const pendingCredits = await prisma.transaction.findMany({
      where: { orderId, type: 'CREDIT_PENDING' },
    })

    if (!pendingCredits.length) {
      console.warn(
        `[wallet] No CREDIT_PENDING transactions found for order #${orderId} — skipping release`,
      )
      return
    }

    // Group by wallet
    const byWallet = new Map<string, { total: number; ids: string[] }>()
    for (const tx of pendingCredits) {
      const entry = byWallet.get(tx.walletId) ?? { total: 0, ids: [] }
      entry.total += tx.amount
      entry.ids.push(tx.id)
      byWallet.set(tx.walletId, entry)
    }

    for (const [walletId, { total, ids }] of byWallet) {
      if (total <= 0) continue
      // Move exact amount from pending → available
      await walletRepository.releasePendingToBalance(walletId, total)
      // Promote the transactions from CREDIT_PENDING → CREDIT_RELEASED
      // so they show as earned in stats and history
      await prisma.transaction.updateMany({
        where: { id: { in: ids } },
        data: {
          type: 'CREDIT_RELEASED',
          description: `Order #${orderId} — delivered, funds released to balance`,
        },
      })
    }

    // Credit affiliate wallet if this order had a referral
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: { affiliateUserId: true, affiliateCut: true },
    })

    if (order?.affiliateUserId && order.affiliateCut > 0) {
      // Affiliate must have a seller profile to receive a wallet credit
      const sellerProfile = await prisma.sellerProfile.findFirst({
        where: { profileId: order.affiliateUserId },
        select: { id: true },
      })

      if (sellerProfile) {
        const wallet = await walletRepository.getOrCreateWallet(
          sellerProfile.id,
        )
        // Idempotency: don't double-credit if called again
        const existingAffiliate = await prisma.transaction.findFirst({
          where: { walletId: wallet.id, orderId, type: 'AFFILIATE_CREDIT' },
        })
        if (!existingAffiliate) {
          await walletRepository.incrementBalance(wallet.id, order.affiliateCut)
          await walletRepository.createTransaction(wallet.id, {
            amount: order.affiliateCut,
            type: 'AFFILIATE_CREDIT',
            description: `Affiliate commission — Order #${orderId}`,
            orderId,
          })
        }
      } else {
        // Non-seller affiliate: store as a buyer-wallet credit using a lightweight transaction log
        // (for now, log it — a dedicated buyer wallet can be added later)
        console.info(
          `[affiliate] Non-seller affiliate ${order.affiliateUserId} earned ${order.affiliateCut} kobo on order #${orderId} — buyer wallet not yet implemented`,
        )
      }
    }
  },

  async getWallet(sellerId: string) {
    const wallet = await walletRepository.getOrCreateWallet(sellerId)
    const stats = await walletRepository.getWalletStats(wallet.id)
    return { wallet, stats }
  },

  async getTransactions(sellerId: string, limit = 20, offset = 0) {
    const wallet = await walletRepository.getOrCreateWallet(sellerId)
    const [transactions, total] = await Promise.all([
      walletRepository.getTransactions(wallet.id, limit, offset),
      walletRepository.countTransactions(wallet.id),
    ])
    return { transactions, total, limit, offset }
  },

  async addFunds(
    sellerId: string,
    amount: number,
    ipAddress: string,
    userAgent: string,
  ) {
    if (amount <= 0)
      throw new UserError(
        'INVALID_AMOUNT',
        'Amount must be greater than 0',
        400,
      )

    const wallet = await walletRepository.getOrCreateWallet(sellerId)
    await walletRepository.incrementBalance(wallet.id, amount)
    await walletRepository.createTransaction(wallet.id, {
      amount,
      type: 'CREDIT',
      description: 'Funds added to wallet',
    })

    auditQueue.enqueue({
      userId: sellerId,
      action: 'WALLET_FUNDED',
      resource: 'SellerWallet',
      resourceId: wallet.id,
      reason: 'Added funds',
      changes: { amount },
      ipAddress,
      userAgent,
    })

    return walletRepository.getWalletBySellerId(sellerId)
  },

  async withdraw(
    sellerId: string,
    amount: number,
    bankAccount: any,
    ipAddress: string,
    userAgent: string,
  ) {
    if (amount <= 0)
      throw new UserError(
        'INVALID_AMOUNT',
        'Amount must be greater than 0',
        400,
      )

    const wallet = await walletRepository.getOrCreateWallet(sellerId)
    if (wallet.balance < amount) {
      throw new UserError(
        'INSUFFICIENT_BALANCE',
        'Insufficient wallet balance',
        400,
      )
    }

    await walletRepository.decrementBalance(wallet.id, amount)
    const payout = await walletRepository.createPayout(wallet.id, {
      amount,
      bank_account: bankAccount,
    })
    await walletRepository.createTransaction(wallet.id, {
      amount,
      type: 'DEBIT',
      description: `Withdrawal request #${payout.id.slice(0, 8)}`,
    })

    auditQueue.enqueue({
      userId: sellerId,
      action: 'WALLET_WITHDRAWAL',
      resource: 'SellerWallet',
      resourceId: wallet.id,
      reason: 'Withdrawal requested',
      changes: { amount },
      ipAddress,
      userAgent,
    })

    return {
      payout,
      wallet: await walletRepository.getWalletBySellerId(sellerId),
    }
  },
}
