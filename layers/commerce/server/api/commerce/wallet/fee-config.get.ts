// GET /api/commerce/wallet/fee-config
// Returns the platform fee config for display in the payout UI.
// Safe to call unauthenticated — no secrets exposed.

export default defineEventHandler(() => {
  const config = getPublicFeeConfig()
  // Example breakdown for ₦10,000 so the UI can show a sample
  const example = calculatePayout(1_000_000) // ₦10,000 in kobo
  return { success: true, data: { ...config, example } }
})
