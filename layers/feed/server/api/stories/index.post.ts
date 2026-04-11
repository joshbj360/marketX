// POST /api/stories - Create a story
import { UserError } from '~~/layers/profile/server/types/user.types'
import { storyService } from '~~/layers/social/server/services/story.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    const { mediaUrl, mediaPublicId, mediaType, productId } = body

    if (!mediaUrl)
      throw new UserError('INVALID_INPUT', 'mediaUrl is required', 400)

    // Create the Media record first, then attach to story
    const media = await prisma.media.create({
      data: {
        url: mediaUrl,
        public_id: mediaPublicId || null,
        type: mediaType || 'IMAGE',
        authorId: user.id,
      },
    })

    const ipAddress =
      getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    const story = await storyService.createStory(
      user.id,
      media.id,
      productId ? Number(productId) : undefined,
      ipAddress,
      userAgent,
    )
    return { success: true, data: story }
  } catch (error: unknown) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
