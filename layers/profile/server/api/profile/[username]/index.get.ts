// GET /api/profile/[username] - Get public profile

import { profileRepository } from '../../../repositories/profile.repository'
import { UserError } from '../../../types/user.types'

function extractWebsiteUrl(links: any): string | null {
  if (!links || !Array.isArray(links)) return null
  const website = links.find((l: any) => l.type === 'website')
  return website?.url ?? null
}

export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    if (!username) {
      throw new UserError('INVALID_USERNAME', 'Username is required', 400)
    }
    const profile = await profileRepository.findByUsername(username)

    if (!profile) {
      throw new UserError('USER_NOT_FOUND', `User @${username} not found`, 404)
    }

    // Return a sanitized public profile (no password_hash, email, etc.)
    const publicProfile = {
      id: profile.id,
      username: profile.username,
      bio: profile.bio,
      avatar: profile.avatar,
      role: profile.role,
      location: profile.location,
      stateOfResidence: profile.location, // alias used by ProfileHeader
      links: profile.links,
      profileUrl: extractWebsiteUrl(profile.links),
      sellerProfile: profile.sellerProfile?.[0] ?? null,
      created_at: profile.created_at,
    }

    return { success: true, data: publicProfile }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({
        statusCode: error.status,
        statusMessage: error.message,
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
