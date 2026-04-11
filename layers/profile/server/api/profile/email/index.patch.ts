// FILE PATH: server/layers/user/api/email.patch.ts

import { defineEventHandler, readBody } from 'h3'
import { ZodError } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { updateEmailSchema } from '../../../schemas/profile.schema'
import { profileService } from '../../../services/profile.service'
import { UserError } from '../../../types/user.types'


export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = updateEmailSchema.parse(body)

    // Get client info
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    // Update email
    const result = await profileService.updateEmail(
      user.id,
      validatedData.newEmail,
      validatedData.password,
      ipAddress,
      userAgent,
    )

    return {
      success: true,
      message: result.message,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors,
      })
    }

    if (error instanceof UserError && error.message.includes('UserError')) {
      const userError = error as any
      throw createError({
        statusCode: userError.statusCode || 400,
        statusMessage: error.message,
      })
    }

    if (error instanceof UserError && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
