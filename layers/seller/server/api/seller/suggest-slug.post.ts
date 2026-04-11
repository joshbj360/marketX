// FILE PATH: server/layers/seller/api/suggest-slug.post.ts

import { defineEventHandler, readBody } from 'h3'
import { ZodError } from 'zod'
import { suggestSlugSchema } from '../../schemas/seller.schema'
import { sellerService } from '../../services/seller.services'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = suggestSlugSchema.parse(body)

    // Get slug suggestions
    const suggestions = await sellerService.suggestSlug(validatedData.baseName)

    return {
      success: true,
      suggestions: suggestions,
      message: 'Slug suggestions generated successfully',
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
      statusMessage: 'Failed to generate slug suggestions',
    })
  }
})
