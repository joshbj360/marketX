// GET /api/posts/tagged?username=&limit=&offset=
import { UserError } from '~~/layers/profile/server/types/user.types'
import { optionalAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    await optionalAuth(event)
    const query = getQuery(event)
    const username = query.username as string
    const limit = Math.min(Number(query.limit) || 20, 100)
    const offset = Number(query.offset) || 0

    if (!username)
      throw new UserError('INVALID_INPUT', 'username is required', 400)

    const profile = await prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    })
    if (!profile)
      throw new UserError('NOT_FOUND', `User @${username} not found`, 404)

    // Get posts where the user's products are tagged
    const taggedPosts = await prisma.post.findMany({
      where: {
        taggedProducts: {
          some: {
            product: { sellerId: profile.id },
          },
        },
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        media: { select: { id: true, url: true, type: true } },
        taggedProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                bannerImageUrl: true,
              },
            },
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.post.count({
      where: {
        taggedProducts: {
          some: { product: { sellerId: profile.id } },
        },
      },
    })

    return {
      success: true,
      data: taggedPosts,
      meta: { total, limit, offset, hasMore: offset + limit < total },
    }
  } catch (error: any) {
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
