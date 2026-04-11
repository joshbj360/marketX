/**
 * Payout fee calculator.
 * All amounts are in kobo (1 NGN = 100 kobo).
 *
 * Fees:
 *  - Platform fee: PLATFORM_FEE_PERCENT % of gross (default 5%)
 *  - Transfer fee: PAYSTACK_TRANSFER_FEE_KOBO flat per transfer (default ₦50 = 5000 kobo)
 *
 * Both values are set in .env and can be changed without a code deploy.
 */
export function calculatePayout(grossKobo: number) {
  const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT ?? '5')
  const transferFeeKobo = parseInt(
    process.env.PAYSTACK_TRANSFER_FEE_KOBO ?? '5000',
  )

  const platformFee = Math.round(grossKobo * (platformFeePercent / 100))
  const transferFee = transferFeeKobo
  const totalFees = platformFee + transferFee
  const net = Math.max(0, grossKobo - totalFees)

  return {
    gross: grossKobo,
    platformFeePercent,
    platformFee,
    transferFee,
    totalFees,
    net,
  }
}

/** Expose fee config to the client (no secrets) */
export function getPublicFeeConfig() {
  return {
    platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT ?? '5'),
    transferFeeKobo: parseInt(process.env.PAYSTACK_TRANSFER_FEE_KOBO ?? '5000'),
  }
}
