// GET /api/squares/:slug — Square profile with officers and featured sellers
import { squareService } from '../../../services/square.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  const userId = event.context.user?.id
  const data = await squareService.getSquareBySlug(slug, userId)
  return { success: true, data }
})
