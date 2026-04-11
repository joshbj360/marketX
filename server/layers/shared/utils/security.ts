import type { H3Event } from 'h3'
import { UAParser } from 'ua-parser-js'

// ==================== CLIENT IP ====================

export function getClientIP(event: H3Event): string {
  // Check X-Forwarded-For header (for proxies)
  const forwarded = event.node.req.headers['x-forwarded-for']
  if (forwarded) {
    return Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0].trim()
  }

  // Check X-Real-IP header
  const realIP = event.node.req.headers['x-real-ip']
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP
  }

  // Fall back to socket remote address
  return event.node.req.socket.remoteAddress || '0.0.0.0'
}

// ==================== USER AGENT PARSING ====================

export interface ParsedUserAgent {
  browser: string
  os: string
  device: string
  raw: string
}

export function parseUserAgent(userAgentString: string): ParsedUserAgent {
  const parser = new UAParser(userAgentString)
  const result = parser.getResult()

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    device: result.device.type || 'desktop', // default to desktop if undefined
    raw: userAgentString,
  }
}
