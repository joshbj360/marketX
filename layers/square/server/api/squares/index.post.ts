// POST /api/squares — admin creates a Square (seeds Computer Village, Balogun, etc.)
import { ZodError } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { createSquareSchema } from '../../schemas/square.schema'
import { squareService } from '../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  if (user.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })

  try {
    const body = await readBody(event)
    const data = createSquareSchema.parse(body)
    const square = await squareService.createSquare(data)
    return { success: true, data: square }
  } catch (e) {
    if (e instanceof ZodError)
      throw createError({ statusCode: 400, statusMessage: 'Validation error', data: e.errors })
    throw e
  }
})
