/**
 * Pusher / Soketi server client
 *
 * Soketi is a Pusher-compatible WebSocket server you self-host (Railway, fly.io, etc.)
 * This client lets the Nuxt server trigger events that Soketi delivers to browsers.
 *
 * How it fits in:
 *   Browser ←──────── Soketi ←── HTTP trigger ── this file ── chat.service.ts
 *   (pusher-js)     (your WS server)           (Pusher SDK)
 *
 * Channels:
 *   private-user-{userId}  → each user subscribes to receive messages sent to them
 */

import Pusher from 'pusher'

let _pusher: Pusher | null = null

export function getPusherServer(): Pusher {
  if (_pusher) return _pusher

  _pusher = new Pusher({
    appId: process.env.SOKETI_APP_ID || 'app-id',
    key: process.env.SOKETI_KEY || 'app-key',
    secret: process.env.SOKETI_SECRET || 'app-secret',
    host: process.env.SOKETI_HOST || '127.0.0.1',
    port: process.env.SOKETI_PORT || '6001',
    useTLS: process.env.SOKETI_USE_TLS === 'true',
    cluster: 'mt1', // required by SDK validation; overridden by host above
  })

  return _pusher
}

/**
 * Trigger an event on a user's private channel.
 * The browser will receive it via pusher-js.
 *
 * @param userId  - recipient user ID
 * @param event   - event name, e.g. 'new_message'
 * @param payload - any JSON-serializable data
 */
export async function triggerUserEvent(
  userId: string,
  event: string,
  payload: object,
): Promise<void> {
  const channel = `private-user-${userId}`
  try {
    await getPusherServer().trigger(channel, event, payload)
  } catch (err) {
    // Soketi not reachable — degrade gracefully (message is already saved to DB)
    console.error(`[Pusher] Failed to trigger ${event} on ${channel}:`, err)
  }
}
