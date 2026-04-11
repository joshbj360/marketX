// POST /api/commerce/products/[id]/comments

import { notificationService } from '~~/layers/profile/server/services/notification.service'
import { auditService } from '~~/server/layers/shared/audit/audit.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })

  const body = await readBody(event)
  if (!body?.text?.trim())
    throw createError({
      statusCode: 400,
      statusMessage: 'Comment text is required',
    })

  const product = await prisma.products.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      seller: { select: { profile: { select: { userId: true } } } },
    },
  })
  if (!product)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  const comment = await prisma.comment.create({
    data: {
      id: crypto.randomUUID(),
      text: body.text.trim(),
      authorId: user.id,
      productId: id,
      parentId: body.parentId || null,
    },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      _count: { select: { likes: true, replies: true } },
    },
  })

  // Notify product owner (non-blocking, skip self-notifications)
  const ownerId = product.seller?.profile?.userId
  if (ownerId && ownerId !== user.id) {
    notificationService
      .createNotification({
        userId: ownerId,
        type: 'PRODUCT_COMMENT',
        actorId: user.id,
        message: `${user.username} commented on your product "${product.title}"`,
        commentId: comment.id,
      })
      .catch(() => {})
  }

  // Audit log (non-blocking)
  auditService
    .logUserAction({
      userId: user.id,
      action: 'PRODUCT_COMMENT_CREATED',
      resource: 'ProductComment',
      resourceId: comment.id,
      reason: `Comment on product ${id}`,
    })
    .catch(() => {})

  return { success: true, data: comment }
})
