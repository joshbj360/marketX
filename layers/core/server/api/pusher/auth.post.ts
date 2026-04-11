/**
 * POST /api/pusher/auth
 *
 * Soketi (Pusher) private-channel authentication endpoint.
 *
 * Flow:
 *   1. Browser (pusher-js) subscribes to  private-user-{userId}
 *   2. pusher-js automatically POSTs here with:
 *        socket_id    — the current WS connection ID from Soketi
 *        channel_name — e.g. "private-user-abc123"
 *   3. We verify the requesting user owns that channel
 *   4. We return a signed auth string — Soketi accepts the connection
 *
 * Security: a user can only authenticate for their own private channel.
 */

import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getPusherServer } from '~~/server/utils/pusher'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  const socketId: string = body.socket_id
  const channelName: string = body.channel_name

  if (!socketId || !channelName) {
    throw createError({
      statusCode: 400,
      message: 'socket_id and channel_name are required',
    })
  }

  // private-user-{userId} — only the owner may authenticate
  const expectedChannel = `private-user-${(await user).id}`
  if (channelName !== expectedChannel) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: channel mismatch',
    })
  }

  const authResponse = getPusherServer().authorizeChannel(socketId, channelName)
  return authResponse
})
