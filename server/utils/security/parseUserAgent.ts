// server/utils/security/parseUserAgent.ts
/**
 * Parse User Agent
 *
 * Extracts device name from user agent string
 * Used for device identification and tracking
 *
 * Example outputs:
 * - "Chrome on Windows"
 * - "Safari on iOS"
 * - "Firefox on Linux"
 * - "Chrome on Android"
 */

interface UserAgentInfo {
  browser: string
  os: string
  device: string
}

/**
 * Parse user agent string
 * Returns browser name, OS, and device string
 */
export function parseUserAgent(userAgent: string): string {
  if (!userAgent) return 'Unknown Device'

  const ua = userAgent.toLowerCase()
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'

  // Detect Browser
  if (
    ua.includes('chrome') &&
    !ua.includes('chromium') &&
    !ua.includes('edg')
  ) {
    browser = 'Chrome'
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari'
  } else if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('edge') || ua.includes('edg')) {
    browser = 'Edge'
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera'
  } else if (ua.includes('trident')) {
    browser = 'Internet Explorer'
  }

  // Detect Operating System
  if (ua.includes('win')) {
    os = 'Windows'
  } else if (ua.includes('mac')) {
    if (ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS'
    } else {
      os = 'macOS'
    }
  } else if (ua.includes('linux')) {
    if (ua.includes('android')) {
      os = 'Android'
    } else {
      os = 'Linux'
    }
  } else if (ua.includes('android')) {
    os = 'Android'
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS'
  }

  return `${browser} on ${os}`
}

/**
 * Detect if device is mobile
 */
export function isMobileDevice(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return /mobile|android|iphone|ipad|blackberry|windows phone/i.test(ua)
}

/**
 * Detect if device is tablet
 */
export function isTabletDevice(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return /tablet|ipad|kindle|playbook/i.test(ua)
}

/**
 * Get device type: 'mobile', 'tablet', or 'desktop'
 */
export function getDeviceType(
  userAgent: string,
): 'mobile' | 'tablet' | 'desktop' {
  if (isTabletDevice(userAgent)) return 'tablet'
  if (isMobileDevice(userAgent)) return 'mobile'
  return 'desktop'
}

/**
 * Extract browser version
 */
export function getBrowserVersion(userAgent: string): string {
  const ua = userAgent.toLowerCase()

  // Chrome
  if (ua.includes('chrome')) {
    const match = ua.match(/chrome\/(\d+)/)
    if (match) return match[1]
  }

  // Firefox
  if (ua.includes('firefox')) {
    const match = ua.match(/firefox\/(\d+)/)
    if (match) return match[1]
  }

  // Safari
  if (ua.includes('safari')) {
    const match = ua.match(/version\/(\d+)/)
    if (match) return match[1]
  }

  // Edge
  if (ua.includes('edg')) {
    const match = ua.match(/edg\/(\d+)/)
    if (match) return match[1]
  }

  return 'Unknown'
}

/**
 * Get full device info
 */
export function getDeviceInfo(userAgent: string): UserAgentInfo {
  return {
    browser: parseUserAgent(userAgent).split(' on ')[0],
    os: parseUserAgent(userAgent).split(' on ')[1],
    device: parseUserAgent(userAgent),
  }
}
