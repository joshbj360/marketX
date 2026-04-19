// PATCH /api/squares/:slug/members/:sellerId — officer approves, rejects, or suspends
import { ZodError } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { membershipActionSchema } from '../../../../schemas/square.schema'
import { squareService } from '../../../../services/square.service'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  const sellerId = getRouterParam(event, 'sellerId')
  if (!slug || !sellerId)
    throw createError({ statusCode: 400, statusMessage: 'slug and sellerId required' })

  try {
    const body = await readBody(event)
    const input = membershipActionSchema.parse(body)
    const result = await squareService.actOnMembership(user.id, slug, sellerId, input)
    return { success: true, data: result }
  } catch (e) {
    if (e instanceof ZodError)
      throw createError({ statusCode: 400, statusMessage: 'Validation error', data: e.errors })
    throw e
  }
})
