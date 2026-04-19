// GET /api/squares/:slug/members — officer views pending and active memberships
import { z } from 'zod'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

const querySchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']).default('PENDING'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  const square = await prisma.square.findUnique({ where: { slug }, select: { id: true } })
  if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

  // Must be an officer of this Square
  const officer = await prisma.squareOfficer.findFirst({
    where: { squareId: square.id, profileId: user.id },
  })
  if (!officer)
    throw createError({ statusCode: 403, statusMessage: 'Officers only' })

  const query = await getValidatedQuery(event, (d) => querySchema.parse(d))

  const [memberships, total] = await Promise.all([
    prisma.squareMembership.findMany({
      where: { squareId: square.id, status: query.status },
      select: {
        id: true,
        isPrimary: true,
        status: true,
        joinedAt: true,
        suspendReason: true,
        seller: {
          select: {
            id: true,
            store_name: true,
            store_slug: true,
            store_logo: true,
            store_phone: true,
            store_location: true,
            is_verified: true,
            profile: { select: { email: true } },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
      take: query.limit,
      skip: query.offset,
    }),
    prisma.squareMembership.count({
      where: { squareId: square.id, status: query.status },
    }),
  ])

  return { success: true, data: { memberships, total } }
})
