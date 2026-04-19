// GET /api/squares — browse all active Squares
import { z } from 'zod'
import { squareService } from '../../services/square.service'

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
  const { squares, total, limit, offset } = await squareService.listSquares(query)
  return {
    success: true,
    data: squares,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + squares.length < total,
    },
  }
})
