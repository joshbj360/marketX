import { defineEventHandler } from 'h3'
import { optionalAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { sellerService } from '../../../services/seller.services'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'id')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Seller slug is required',
      })
    }

    // Check if the requester owns this store — owners see it even when inactive
    const user = await optionalAuth(event)
    if (user) {
      const owned = await prisma.sellerProfile.findFirst({
        where: { store_slug: slug, profileId: user.id },
      })
      if (owned) {
        return {
          success: true,
          message: 'Seller profile retrieved successfully',
          data: owned,
        }
      }
    }

    // Public path: only active stores
    const seller = await sellerService.getSellerBySlug(slug)

    return {
      success: true,
      message: 'Seller profile retrieved successfully',
      data: seller,
    }
  } catch (error: any) {
    if (error.name === 'SellerError') {
      throw createError({
        statusCode: error.statusCode || 404,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve seller profile',
    })
  }
})
