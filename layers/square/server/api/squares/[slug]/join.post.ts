// POST /api/squares/:slug/join — seller applies to join a Square
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { squareService } from '../../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  // Resolve the caller's SellerProfile
  const seller = await prisma.sellerProfile.findFirst({
    where: { profileId: user.id },
    select: { id: true },
  })
  if (!seller)
    throw createError({ statusCode: 403, statusMessage: 'Only sellers can join a Square' })

  const result = await squareService.joinSquare(seller.id, slug)
  return {
    success: true,
    message: 'Application submitted — awaiting officer approval',
    data: result,
  }
})
