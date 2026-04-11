// server/utils/monitoring/authMonitoring.ts
/**
 * Auth Layer Monitoring & Alerting
 * Tracks security metrics and triggers alerts
 */

import { prisma } from '../db'

export interface AuthMetrics {
  failedLogins24h: number
  accountLockouts24h: number
  registrations24h: number
  passwordResets24h: number
  suspiciousActivities24h: number
  averageLoginTime: number
  authEndpointErrors: number
}

export interface AlertThreshold {
  failedLoginsPerHour: number // Alert if exceeded
  accountLockoutsPerDay: number
  suspiciousActivitiesPerDay: number
  errorRatePercent: number
  loginLatencyMs: number
}

// Default alert thresholds (adjust based on your app size)
export const defaultThresholds: AlertThreshold = {
  failedLoginsPerHour: 20,
  accountLockoutsPerDay: 50,
  suspiciousActivitiesPerDay: 10,
  errorRatePercent: 5,
  loginLatencyMs: 150,
}

/**
 * Get auth metrics for the last 24 hours
 */
export async function getAuthMetrics(): Promise<AuthMetrics> {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Get failed logins
  const failedLogins = await prisma.auditLog.count({
    where: {
      event_type: 'LOGIN_FAILED',
      created_at: { gte: last24h },
    },
  })

  // Get account lockouts
  const accountLockouts = await prisma.auditLog.count({
    where: {
      event_type: 'ACCOUNT_LOCKED',
      created_at: { gte: last24h },
    },
  })

  // Get registrations
  const registrations = await prisma.auditLog.count({
    where: {
      event_type: 'REGISTER_SUCCESS',
      created_at: { gte: last24h },
    },
  })

  // Get password resets
  const passwordResets = await prisma.auditLog.count({
    where: {
      event_type: 'PASSWORD_RESET_SUCCESS',
      created_at: { gte: last24h },
    },
  })

  // Get suspicious activities
  const suspiciousActivities = await prisma.auditLog.count({
    where: {
      event_type: 'SUSPICIOUS_ACTIVITY',
      created_at: { gte: last24h },
    },
  })

  return {
    failedLogins24h: failedLogins,
    accountLockouts24h: accountLockouts,
    registrations24h: registrations,
    passwordResets24h: passwordResets,
    suspiciousActivities24h: suspiciousActivities,
    averageLoginTime: 75, // Would come from tracing/monitoring service
    authEndpointErrors: 0, // Would come from error tracking service
  }
}

/**
 * Check if metrics exceed thresholds and trigger alerts
 */
export async function checkAlerts(
  thresholds: AlertThreshold = defaultThresholds,
): Promise<string[]> {
  const alerts: string[] = []
  const metrics = await getAuthMetrics()
  const now = new Date()

  // Check failed logins
  const failedLoginsPerHour = Math.ceil(metrics.failedLogins24h / 24)
  if (failedLoginsPerHour > thresholds.failedLoginsPerHour) {
    alerts.push(
      `🚨 HIGH FAILED LOGINS: ${failedLoginsPerHour}/hour (threshold: ${thresholds.failedLoginsPerHour})`,
    )
  }

  // Check account lockouts
  if (metrics.accountLockouts24h > thresholds.accountLockoutsPerDay) {
    alerts.push(
      `🚨 EXCESSIVE LOCKOUTS: ${metrics.accountLockouts24h}/day (threshold: ${thresholds.accountLockoutsPerDay})`,
    )
  }

  // Check suspicious activities
  if (metrics.suspiciousActivities24h > thresholds.suspiciousActivitiesPerDay) {
    alerts.push(
      `🔴 SUSPICIOUS ACTIVITY: ${metrics.suspiciousActivities24h}/day (threshold: ${thresholds.suspiciousActivitiesPerDay})`,
    )
  }

  // Check login latency
  if (metrics.averageLoginTime > thresholds.loginLatencyMs) {
    alerts.push(
      `⚠️ HIGH LATENCY: ${metrics.averageLoginTime}ms (threshold: ${thresholds.loginLatencyMs}ms)`,
    )
  }

  return alerts
}

/**
 * Get detailed suspicious activity report
 */
export async function getSuspiciousActivityReport(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  // Multiple failed logins from same IP
  const suspiciousIPs = (await prisma.$queryRaw`
    SELECT 
      ip_address,
      COUNT(*) as attempt_count,
      COUNT(DISTINCT email) as unique_emails,
      MAX(created_at) as last_attempt
    FROM "AuditLog"
    WHERE 
      event_type = 'LOGIN_FAILED'
      AND created_at >= $1
      AND ip_address IS NOT NULL
    GROUP BY ip_address
    HAVING COUNT(*) > 10
    ORDER BY attempt_count DESC
    LIMIT 20
  `) as any[]

  // Multiple account lockouts
  const frequentLockouts = (await prisma.$queryRaw`
    SELECT 
      email,
      COUNT(*) as lockout_count,
      MAX(created_at) as last_lockout
    FROM "AuditLog"
    WHERE 
      event_type = 'ACCOUNT_LOCKED'
      AND created_at >= $1
    GROUP BY email
    HAVING COUNT(*) > 2
    ORDER BY lockout_count DESC
    LIMIT 10
  `) as any[]

  // Multiple emails from same IP
  const emailSpamming = (await prisma.$queryRaw`
    SELECT 
      ip_address,
      COUNT(DISTINCT email) as unique_emails,
      COUNT(*) as total_attempts,
      MAX(created_at) as last_attempt
    FROM "AuditLog"
    WHERE 
      event_type IN ('REGISTER_FAILED', 'LOGIN_FAILED')
      AND created_at >= $1
      AND ip_address IS NOT NULL
    GROUP BY ip_address
    HAVING COUNT(DISTINCT email) > 5
    ORDER BY unique_emails DESC
    LIMIT 10
  `) as any[]

  return {
    reportTime: new Date(),
    timeframe: `${hours} hours`,
    suspiciousIPs,
    frequentLockouts,
    emailSpamming,
  }
}

/**
 * Send alert to monitoring service
 * Integrate with: DataDog, Splunk, PagerDuty, Slack, etc.
 */
export async function sendAlert(
  message: string,
  severity: 'info' | 'warning' | 'critical',
) {
  // Integration examples below

  // Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const color = {
        info: '#36a64f',
        warning: '#ff9900',
        critical: '#ff0000',
      }[severity]

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [
            {
              color,
              title: `Auth Security Alert - ${severity.toUpperCase()}`,
              text: message,
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }),
      })
    } catch (error) {
      console.error('Failed to send Slack alert:', error)
    }
  }

  // DataDog
  if (process.env.DATADOG_API_KEY) {
    try {
      await fetch('https://api.datadoghq.com/api/v1/events', {
        method: 'POST',
        headers: {
          'DD-API-KEY': process.env.DATADOG_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Auth Security Alert',
          text: message,
          priority: severity === 'critical' ? 'high' : 'normal',
          alert_type: severity === 'critical' ? 'error' : 'info',
          tags: ['auth', 'security'],
        }),
      })
    } catch (error) {
      console.error('Failed to send DataDog alert:', error)
    }
  }

  // PagerDuty
  if (process.env.PAGERDUTY_INTEGRATION_KEY) {
    try {
      await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routing_key: process.env.PAGERDUTY_INTEGRATION_KEY,
          event_action: severity === 'critical' ? 'trigger' : 'info',
          payload: {
            summary: 'Auth Security Alert',
            severity,
            source: 'auth-layer',
            custom_details: { message },
          },
        }),
      })
    } catch (error) {
      console.error('Failed to send PagerDuty alert:', error)
    }
  }

  // Console log as fallback
  console.error(`[${severity.toUpperCase()}] ${message}`)
}

/**
 * Run periodic monitoring checks
 * Call this every 5 minutes in a scheduled job
 */
export async function runMonitoringChecks() {
  try {
    const alerts = await checkAlerts()

    // Send alerts
    for (const alert of alerts) {
      const severity = alert.includes('🔴')
        ? 'critical'
        : alert.includes('🚨')
          ? 'warning'
          : 'info'
      await sendAlert(alert, severity as any)
    }

    // Get suspicious activity report if there are critical alerts
    if (alerts.some((a) => a.includes('🔴'))) {
      const report = await getSuspiciousActivityReport(1) // Last hour
      console.log(
        'Suspicious Activity Report:',
        JSON.stringify(report, null, 2),
      )
    }
  } catch (error) {
    console.error('Monitoring check failed:', error)
  }
}

/**
 * Setup scheduled monitoring
 * Add to your app initialization
 */
export function startMonitoring(intervalMinutes: number = 5) {
  // Run immediately
  runMonitoringChecks()

  // Run periodically
  setInterval(runMonitoringChecks, intervalMinutes * 60 * 1000)

  console.log(
    `✅ Auth monitoring started (checks every ${intervalMinutes} min)`,
  )
}
