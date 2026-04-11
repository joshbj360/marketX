/**
 * SSE endpoint: GET /api/notifications/stream
 *
 * What SSE is:
 *   A normal HTTP connection that never closes.
 *   The server keeps writing "events" to it whenever something happens.
 *   The browser's EventSource API handles reconnecting automatically if it drops.
 *
 * Flow:
 *   1. User opens the app → browser connects here
 *   2. We verify their token and register the open stream
 *   3. Any time a notification is created for this user (like, follow, order, message),
 *      notification.service.ts calls sseConnections.send(userId, ...) → arrives here
 *      → browser receives it instantly without polling
 *   4. Browser disconnects (tab close, network drop) → we clean up
 *
 * Auth: token passed as ?token=xxx query param
 */

import { sseConnections } from '~~/server/utils/connections'
import { jwtVerify } from '~~/server/utils/auth/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = String(query.token || '')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'No token provided' })
  }

  let userId: string
  try {
    const payload = jwtVerify(token)
    userId = payload.userId as string
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const res = event.node.res

  // ── Set SSE headers ───────────────────────────────────────────────────────
  // These tell the browser: "keep this connection open, I will keep sending data"
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering if behind proxy
  res.flushHeaders()

  // ── Register the stream ───────────────────────────────────────────────────
  sseConnections.add(userId, event)

  // Swallow ECONNRESET and similar errors on the socket itself
  res.socket?.on('error', () => {
    sseConnections.remove(userId)
  })

  // Send a welcome event so the client knows the stream is live
  try {
    res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`)
  } catch {
    sseConnections.remove(userId)
    return
  }

  // ── Keepalive ping every 25 seconds ──────────────────────────────────────
  const keepAlive = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(keepAlive)
      sseConnections.remove(userId)
      return
    }
    try {
      res.write(': ping\n\n')
    } catch {
      clearInterval(keepAlive)
      sseConnections.remove(userId)
    }
  }, 25_000)

  // ── Cleanup when the client disconnects ───────────────────────────────────
  event.node.req.on('close', () => {
    clearInterval(keepAlive)
    sseConnections.remove(userId)
  })

  // Keep the handler alive — do not return until connection closes
  await new Promise<void>((resolve) => {
    event.node.req.on('close', resolve)
    event.node.req.on('error', resolve)
  })
})
