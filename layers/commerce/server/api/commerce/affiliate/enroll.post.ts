// POST /api/commerce/affiliate/enroll
import { randomBytes } from 'node:crypto'
import { UserError } from '~~/layers/profile/server/types/user.types'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true, username: true, affiliateCode: true },
    })

    if (!profile) throw new UserError('NOT_FOUND', 'Profile not found', 404)

    // Already enrolled — return existing code
    if (profile.affiliateCode) {
      return {
        success: true,
        data: { isEnrolled: true, affiliateCode: profile.affiliateCode },
      }
    }

    // Generate unique code: username prefix + 6-char hex
    const base = (profile.username ?? 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 12)
    const suffix = randomBytes(3).toString('hex')
    let code = `${base}_${suffix}`

    // Ensure uniqueness (retry once if collision)
    const exists = await prisma.profile.findUnique({
      where: { affiliateCode: code },
    })
    if (exists) code = `${base}_${randomBytes(3).toString('hex')}`

    await prisma.profile.update({
      where: { id: user.id },
      data: { affiliateCode: code },
    })

    return {
      success: true,
      data: { isEnrolled: true, affiliateCode: code },
    }
  } catch (error: any) {
    if (error instanceof UserError)
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
