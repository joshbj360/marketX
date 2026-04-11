import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
})

/**
 * POST /api/products/:id/reviews
 * Authenticated. One review per user per product (enforced by @@unique).
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const userId = user.id
  const productId = parseInt(getRouterParam(event, 'id') || '0')
  const body = await readBody(event)
  const { rating, title, body: reviewBody } = reviewSchema.parse(body)

  const review = await prisma.review.upsert({
    where: { productId_authorId: { productId, authorId: userId } },
    create: { productId, authorId: userId, rating, title, body: reviewBody },
    update: { rating, title, body: reviewBody },
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      created_at: true,
    },
  })

  // Recalculate averageRating on product
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  })
  await prisma.products.update({
    where: { id: productId },
    data: {
      averageRating: agg._avg.rating ?? 0,
      totalReviews: agg._count,
    },
  })

  return { success: true, data: review }
})
