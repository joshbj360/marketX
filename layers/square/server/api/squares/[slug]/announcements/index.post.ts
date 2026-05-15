// POST /api/squares/:slug/announcements
// Officers only (CHAIRMAN, SECRETARY, MODERATOR)

import { prisma } from '~~/server/utils/db'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { z } from 'zod'

const bodySchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(2000),
  isPinned: z.boolean().optional().default(false),
})

const OFFICER_ROLES = ['CHAIRMAN', 'SECRETARY', 'MODERATOR']

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')
  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'Slug required' })

  const body = await readValidatedBody(event, (b) => bodySchema.parse(b))

  // Load square + verify officer status
  const square = await prisma.square.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
      name: true,
      officers: {
        where: { profileId: user.id },
        select: { role: true },
      },
    },
  })

  if (!square || square.status !== 'ACTIVE')
    throw createError({ statusCode: 404, statusMessage: 'Square not found' })

  const officerRole = square.officers[0]?.role
  if (!officerRole || !OFFICER_ROLES.includes(officerRole))
    throw createError({
      statusCode: 403,
      statusMessage: 'Only square officers can post announcements',
    })

  // Create announcement
  const announcement = await prisma.squareAnnouncement.create({
    data: {
      squareId: square.id,
      authorId: user.id,
      title: body.title,
      body: body.body,
      isPinned: body.isPinned,
    },
    select: {
      id: true,
      title: true,
      body: true,
      isPinned: true,
      created_at: true,
      author: { select: { id: true, username: true, avatar: true } },
    },
  })

  // Notify all followers via queue (enables SSE push; cap at 500)
  const followers = await prisma.userSquareFollow.findMany({
    where: { squareId: square.id },
    select: { userId: true },
    take: 500,
  })

  for (const f of followers) {
    notificationQueue.enqueue({
      userId: f.userId,
      type: 'SQUARE_ANNOUNCEMENT',
      actorId: user.id,
      message: `📢 ${square.name}: ${body.title}`,
    })
  }

  return { success: true, data: announcement }
})
