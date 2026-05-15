// POST /api/seller/:slug/reviews — verified buyer only (completed order from this seller)
import { z } from 'zod'
import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { emailQueue } from '~~/server/queues/email.queue'
import { buildReviewReceivedEmail } from '~~/server/utils/email/emailService'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'id')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  const seller = await prisma.sellerProfile.findUnique({
    where: { store_slug: slug },
    select: { id: true, profileId: true, store_name: true },
  })
  if (!seller) throw createError({ statusCode: 404, statusMessage: 'Seller not found' })

  // Cannot review your own store
  const ownStore = await prisma.sellerProfile.findFirst({
    where: { store_slug: slug, profileId: user.id },
    select: { id: true },
  })
  if (ownStore) throw createError({ statusCode: 403, statusMessage: 'You cannot review your own store' })

  // Must have at least one delivered order from this seller
  const deliveredOrder = await prisma.orders.findFirst({
    where: {
      profileId: user.id,
      status: 'DELIVERED',
      orderItem: {
        some: {
          variant: { product: { sellerId: seller.id } },
        },
      },
    },
    select: { id: true },
  })

  if (!deliveredOrder) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only review sellers you have purchased from.',
    })
  }

  const body = reviewSchema.parse(await readBody(event))

  // Upsert — one review per buyer per seller
  const review = await prisma.sellerReview.upsert({
    where: { sellerId_authorId: { sellerId: seller.id, authorId: user.id } },
    create: {
      sellerId: seller.id,
      authorId: user.id,
      orderId: deliveredOrder.id,
      rating: body.rating,
      title: body.title,
      body: body.body,
      verified: true,
    },
    update: { rating: body.rating, title: body.title, body: body.body },
    select: { id: true, rating: true, title: true, body: true, verified: true, created_at: true },
  })

  // Recalculate seller rating
  const agg = await prisma.sellerReview.aggregate({
    where: { sellerId: seller.id },
    _avg: { rating: true },
    _count: true,
  })
  await prisma.sellerProfile.update({
    where: { id: seller.id },
    data: {
      averageRating: agg._avg.rating ?? 0,
      totalReviews: agg._count,
    },
  })

  // Notify + email seller (non-blocking, skip self-review)
  if (seller.profileId && seller.profileId !== user.id) {
    const storeName = seller.store_name || 'your store'
    notificationQueue.enqueue({
      userId: seller.profileId,
      type: 'PRODUCT_REVIEW',
      actorId: user.id,
      message: `You received a ${body.rating}-star review on ${storeName}.`,
    })
    prisma.user.findUnique({ where: { id: seller.profileId }, select: { email: true } })
      .then((su) => {
        if (!su?.email) return
        const { subject, html, text } = buildReviewReceivedEmail(storeName, body.rating, body.title)
        emailQueue.enqueue({ to: su.email, subject, html, text, type: 'GENERAL' })
      })
      .catch(() => {})
  }

  return { success: true, data: review }
})
