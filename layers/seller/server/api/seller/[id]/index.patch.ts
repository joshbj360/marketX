// FILE PATH: server/layers/seller/api/[id].patch.ts

import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { sellerService } from '../../../services/seller.services'
import { updateSellerProfileSchema } from '../../../schemas/seller.schema'

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    const sellerId = getRouterParam(event, 'id')

    if (!sellerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Seller ID is required',
      })
    }

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = updateSellerProfileSchema.parse(body)

    // Update seller profile
    const updated = await sellerService.updateSellerProfile(
      sellerId,
      user.id,
      validatedData,
    )

    return {
      success: true,
      message: 'Seller profile updated successfully',
      data: updated,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors,
      })
    }

    if ((error as any).name === 'SellerError') {
      logger.error('[PATCH /api/seller/:id] SellerError:', (error as any).data?.originalError ?? error)
      throw createError({
        statusCode: (error as any).statusCode || 400,
        statusMessage: (error as Error).message,
      })
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: error.message.includes('Cannot update') ? 403 : 401,
        statusMessage: error.message,
      })
    }

    logger.error('[PATCH /api/seller/:id]', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update seller profile: ${(error as Error).message}`,
    })
  }
})
