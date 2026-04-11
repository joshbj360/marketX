// FILE PATH: server/layers/seller/api/check-slug.post.ts

import { defineEventHandler, readBody } from 'h3'
import { ZodError } from 'zod'
import { checkSlugAvailabilitySchema } from '../../schemas/seller.schema'
import { sellerService } from '../../services/seller.services'


export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = checkSlugAvailabilitySchema.parse(body)

    // Check slug availability
    const result = await sellerService.checkSlugAvailability(validatedData.slug)

    return {
      success: true,
      available: result.available,
      slug: validatedData.slug,
      message: result.available ? 'Slug is available' : 'Slug is already taken',
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check slug availability',
    })
  }
})
