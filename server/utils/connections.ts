/**
 * In-memory connection registry
 *
 * Think of this as a reception desk:
 *   - When a user opens the app → they "check in" and we note their desk number
 *   - When someone sends them a message → we look up their desk and deliver it instantly
 *   - When they close the app → they "check out" and we remove the entry
 *
 * WebSocket peers  → used for chat (two-way)
 * SSE responses    → used for notifications (server → client only)
 */

import type { H3Event } from 'h3'

// ─── Chat: one WebSocket peer per user ───────────────────────────────────────
const chatPeers = new Map<string, any>()

export const chatConnections = {
  add(userId: string, peer: any) {
    chatPeers.set(userId, peer)
  },
  remove(userId: string) {
    chatPeers.delete(userId)
  },
  get(userId: string): any {
    return chatPeers.get(userId)
  },
  /** Send a JSON payload to a specific user if they are online */
  send(userId: string, payload: object) {
    const peer = chatPeers.get(userId)
    if (peer) peer.send(JSON.stringify(payload))
  },
}

// ─── Notifications: one SSE write-stream per user ────────────────────────────
// We store the raw Node.js ServerResponse so we can write SSE frames to it
const sseStreams = new Map<string, H3Event>()

export const sseConnections = {
  add(userId: string, event: H3Event) {
    sseStreams.set(userId, event)
  },
  remove(userId: string) {
    sseStreams.delete(userId)
  },
  /** Push a named SSE event with a JSON payload to a specific user */
  send(userId: string, eventName: string, payload: object) {
    const event = sseStreams.get(userId)
    if (!event) return

    try {
      if (event.node.res.writableEnded) {
        sseStreams.delete(userId)
        return
      }
      const data = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`
      event.node.res.write(data)
    } catch {
      // Client disconnected — remove stale entry so we stop trying
      sseStreams.delete(userId)
    }
  },
}
