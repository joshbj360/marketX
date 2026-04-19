// PATCH /api/squares/:slug — admin updates a Square
import { ZodError } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { updateSquareSchema } from '../../../schemas/square.schema'
import { squareService } from '../../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  try {
    const body = await readBody(event)
    const data = updateSquareSchema.parse(body)
    const square = await squareService.updateSquare(slug, data)
    return { success: true, data: square }
  } catch (e) {
    if (e instanceof ZodError)
      throw createError({ statusCode: 400, statusMessage: 'Validation error', data: e.errors })
    throw e
  }
})
