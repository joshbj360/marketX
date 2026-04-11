import { defineEventHandler, getValidatedQuery, createError } from 'h3'
import { z, ZodError } from 'zod'
import { feedService } from '~~/layers/feed/server/services/feed.services'
import { remember, consumeCreatorBypass } from '~~/server/utils/cache'

// Safely parse and convert query strings to numbers
const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  type: z.enum(['all', 'posts', 'products']).default('all').optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // 1. Validate Query Params (Throws 400 automatically if invalid)
    const query = await getValidatedQuery(event, (data) =>
      querySchema.parse(data),
    )

    // 2. Extract Context (Optional User Auth)
    const userId = event.context.user?.id
    const page = Math.floor(query.offset / query.limit)
    const cacheKey = `feed:home:page:${page}:limit:${query.limit}`

    // Creator bypass — skip cache for 30s after they publish content
    const bypass = userId ? await consumeCreatorBypass(userId) : false

    // 3. Call feed service wrapped in cache
    const feed = await remember(cacheKey, bypass ? 0 : 120, () =>
      feedService.getHomeFeed({
        limit: query.limit,
        offset: query.offset,
        type: query.type,
      }),
    )

    // Let browsers/CDN cache for 60s (stale-while-revalidate for extra speed)
    if (!bypass) {
      setHeader(
        event,
        'Cache-Control',
        'public, max-age=60, stale-while-revalidate=120',
      )
    }

    return feed
  } catch (error: unknown) {
    // Handle Validation Errors safely
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters',
        data: error.errors,
      })
    }

    console.error('[Home Feed API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch feed',
    })
  }
})
