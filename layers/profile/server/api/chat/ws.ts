/**
 * WebSocket endpoint: /api/chat/ws
 *
 * What this file does:
 *   1. A user opens the app → browser connects here with their auth token
 *   2. We verify the token and register their connection: "User X is online"
 *   3. When someone sends them a message (via HTTP POST), that handler calls
 *      chatConnections.send(recipientId, message) → arrives here → forwarded to browser
 *   4. When user closes the tab → we remove their registration
 *
 * Auth: token is sent as a query param ?token=xxx because browsers cannot
 * set custom headers on WebSocket connections.
 */

import { chatConnections } from '~~/server/utils/connections'
import { jwtVerify } from '~~/server/utils/auth/auth'

export default defineWebSocketHandler({
  /**
   * OPEN — fires when a browser connects
   * Like a user walking through the door and checking in at reception
   */
  async open(peer) {
    // The token arrives as ?token=xxx in the URL
    // peer.request.url is the full URL string
    const url = new URL(peer.request?.url ?? '', 'http://localhost')
    const token = url.searchParams.get('token')

    if (!token) {
      peer.send(JSON.stringify({ type: 'error', message: 'No token provided' }))
      peer.close(4001, 'Unauthorized')
      return
    }

    try {
      const payload = jwtVerify(token)
      const userId = payload.userId as string

      // Store this peer so we can find them later when a message arrives for them
      chatConnections.add(userId, peer)

      // Attach userId to the peer object so we can look it up on close/error
      // crossws lets you store arbitrary data on the peer
      ;(peer as any)._userId = userId

      peer.send(JSON.stringify({ type: 'connected', userId }))
    } catch {
      peer.send(JSON.stringify({ type: 'error', message: 'Invalid token' }))
      peer.close(4001, 'Unauthorized')
    }
  },

  /**
   * MESSAGE — fires when the browser sends data over the socket
   * We use this only for a "ping" keepalive to prevent idle disconnects.
   * Actual messages are sent via HTTP POST (more reliable on bad connections).
   */
  message(peer, message) {
    try {
      const data = JSON.parse(message.text())
      if (data.type === 'ping') {
        peer.send(JSON.stringify({ type: 'pong' }))
      }
    } catch {
      // Ignore malformed frames
    }
  },

  /**
   * CLOSE — fires when the browser disconnects (tab closed, network drop, etc.)
   * Remove them from the registry — they are no longer reachable
   */
  close(peer) {
    const userId = (peer as any)._userId
    if (userId) chatConnections.remove(userId)
  },

  /**
   * ERROR — fires on unexpected socket errors
   * Same cleanup as close
   */
  error(peer) {
    const userId = (peer as any)._userId
    if (userId) chatConnections.remove(userId)
  },
})
