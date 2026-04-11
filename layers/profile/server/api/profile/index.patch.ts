// FILE PATH: server/layers/user/api/profile.patch.ts

import { defineEventHandler, readBody } from 'h3'

import { ZodError } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { updateProfileSchema } from '../../schemas/profile.schema'
import { profileService } from '../../services/profile.service'
import { UserError } from '../../types/user.types'
export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = updateProfileSchema.parse(body)

    // Get client info
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    // Initialize service
    // Update profile
    const updated = await profileService.updateProfile(
      user.id,
      validatedData,
      ipAddress,
      userAgent,
    )

    return {
      success: true,
      data: updated,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error' + error, // TODO: remove in production
        data: error.errors,
      })
    }

    if (error instanceof UserError && error.message.includes('UserError')) {
      const userError = error as any
      throw createError({
        statusCode: userError.statusCode || 400,
        statusMessage: error.message + error, // TODO: remove in production
      })
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message + error, // TODO: remove in production
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error' + error, // TODO: remove in production
    })
  }
})
