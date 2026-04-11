// FILE PATH: server/layers/user/api/account.delete.ts

import { defineEventHandler, readBody, deleteCookie } from 'h3'

import { ZodError } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { getClientIP } from '~~/server/layers/shared/utils/security'
import { deleteAccountSchema } from '../../schemas/profile.schema'
import { profileService } from '../../services/profile.service'
import { UserError } from '../../types/user.types'

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = deleteAccountSchema.parse(body)

    // Get client info
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    // Delete account
    const result = await profileService.deleteAccount(
      user.id,
      validatedData.password,
      ipAddress,
      userAgent,
    )

    // Clear cookies
    deleteCookie(event, 'accessToken')
    deleteCookie(event, 'refreshToken')

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
