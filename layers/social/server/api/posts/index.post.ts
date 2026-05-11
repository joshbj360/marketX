// POST /api/user/posts - Create post

import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { contentService } from '../../services/post.service'
import { createPostSchema } from '../../schemas/post.schema'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const rawBody = await readBody(event)

    const parsed = createPostSchema.safeParse(rawBody)
    if (!parsed.success) {
      const first = parsed.error.errors[0]
      throw createError({ statusCode: 400, statusMessage: first?.message ?? 'Invalid input' })
    }
    const body = parsed.data

    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'

    const result = await contentService.createPost(
      user.id,
      body,
      ipAddress,
      userAgent,
    )

    // Bust discover feed pages + set creator bypass so they see post immediately
    await Promise.all([
      bust('feed:home:page:*'),
      bust('feed:discover:page:*'),
      bust(`feed:following:user:${user.id}:page:*`),
      setCreatorBypass(user.id),
    ])

    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logger.error('[posts] createPost error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Internal server error',
    })
  }
})
