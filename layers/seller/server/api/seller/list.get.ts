// FILE PATH: server/layers/seller/api/list.get.ts

import { defineEventHandler } from 'h3'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { sellerService } from '../../services/seller.services'

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    // Initialize service

    // Get user's seller profiles
    const sellers = await sellerService.getUserSellerProfiles(user.id)

    return {
      success: true,
      message: 'Seller profiles retrieved successfully',
      data: sellers,
      total: sellers.length,
    }
  } catch (error: any) {
    if (error.name === 'SellerError') {
      throw createError({
        statusCode: error.statusCode || 404,
        statusMessage: error.message,
      })
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve seller profiles',
    })
  }
})
