// server/plugins/monitoring.ts
/**
 * Auth Monitoring Plugin
 *
 * Starts monitoring checks on server boot
 * Collects metrics and sends alerts
 */

import { startMonitoring } from '../utils/monitoring/authMonitoring'

export default defineNitroPlugin(() => {
  // Only run in production or if explicitly enabled
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_MONITORING === 'true'
  ) {
    // Start monitoring with 5-minute interval checks
    const intervalMinutes = process.env.MONITORING_INTERVAL_MINUTES
      ? parseInt(process.env.MONITORING_INTERVAL_MINUTES, 10)
      : 5

    console.log(
      `🔍 Starting auth monitoring (checks every ${intervalMinutes} minutes)`,
    )

    startMonitoring(intervalMinutes)
  } else {
    console.log(
      'ℹ️  Auth monitoring disabled (set NODE_ENV=production or ENABLE_MONITORING=true to enable)',
    )
  }
})
