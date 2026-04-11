// PATCH /api/profile/settings — update one or more settings fields
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { prisma } from '~~/server/utils/db'

const ALLOWED = new Set([
  'email_notifications',
  'push_notifications',
  'private_profile',
  'language',
  'currency',
  'theme',
  'text_size',
  'auto_mute',
  'compact_feed',
  'show_captions',
  'show_like_counts',
  'show_near_me',
  'show_shop_today',
  'show_stories',
])

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const data: Record<string, any> = {}
  for (const key of Object.keys(body)) {
    if (ALLOWED.has(key)) data[key] = body[key]
  }

  if (Object.keys(data).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No valid fields provided',
    })
  }

  const settings = await prisma.userSettings.upsert({
    where: { user_id: user.id },
    create: { user_id: user.id, ...data },
    update: data,
  })

  return { success: true, data: settings }
})
