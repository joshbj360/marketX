// GET /api/squares — browse all active Squares
import { z } from 'zod'
import { squareService } from '../../services/square.service'
import { remember, bust } from '~~/server/utils/cache'

const querySchema = z.object({
  type: z.enum(['GEOGRAPHIC', 'CATEGORY']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  search: z.string().max(80).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (d) => querySchema.parse(d))
  const cacheKey = `squares:list:${query.limit}:${query.offset}:${query.type ?? ''}:${query.city ?? ''}:${query.state ?? ''}:${query.search ?? ''}`

  const result = await remember(cacheKey, 60, () => squareService.listSquares(query))

  setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
  return {
    success: true,
    data: result.squares,
    meta: {
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore,
    },
  }
})
