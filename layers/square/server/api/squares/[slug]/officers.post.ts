// POST /api/squares/:slug/officers — Chairman appoints an officer
import { ZodError } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { addOfficerSchema } from '../../../schemas/square.schema'
import { squareService } from '../../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  try {
    const body = await readBody(event)
    const input = addOfficerSchema.parse(body)
    const officer = await squareService.addOfficer(user.id, slug, input)
    return { success: true, data: officer }
  } catch (e) {
    if (e instanceof ZodError)
      throw createError({ statusCode: 400, statusMessage: 'Validation error', data: e.errors })
    throw e
  }
})
