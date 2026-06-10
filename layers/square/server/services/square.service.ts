/**
 * Square Service
 *
 * Business logic for the Square feature — MarketX's community-based market
 * model where sellers cluster under named Squares (Computer Village, Balogun,
 * Bodija, etc.) mirroring how Nigerian physical markets are organised.
 *
 * Responsibilities:
 *  - Square CRUD (admin)
 *  - Seller membership (apply, approve, reject, suspend)
 *  - User follow / unfollow
 *  - Officer management
 *  - Association wallet crediting (called from order completion)
 */

import { prisma } from '~~/server/utils/db'
import { bust } from '~~/server/utils/cache'
import { notificationQueue } from '~~/server/queues/notification.queue'

// Bust stale list cache on deploy — followerCount shape changed
bust('squares:list:*').catch(() => {})
import { entityEmbedder } from '~~/layers/ai/server/services/entity-embedder.service'
import type {
  CreateSquareInput,
  UpdateSquareInput,
  MembershipActionInput,
  AddOfficerInput,
} from '../schemas/square.schema'

// ── Selects ───────────────────────────────────────────────────────────────────

const SQUARE_PUBLIC_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  status: true,
  bannerUrl: true,
  iconUrl: true,
  accentColor: true,
  city: true,
  state: true,
  country: true,
  latitude: true,
  longitude: true,
  memberCount: true,
  followerCount: true,
  postCount: true,
  associationCutPercent: true,
  created_at: true,
} as const

// Minimal fields for card/shelf rendering — subset of SQUARE_PUBLIC_SELECT
const SQUARE_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  bannerUrl: true,
  iconUrl: true,
  accentColor: true,
  memberCount: true,
  city: true,
  state: true,
  type: true,
} as const

const OFFICER_SELECT = {
  id: true,
  role: true,
  appointedAt: true,
  profile: {
    select: { id: true, username: true, avatar: true },
  },
} as const

// ── Service ───────────────────────────────────────────────────────────────────

export const squareService = {
  // ── Browse & fetch ──────────────────────────────────────────────────────────

  async listSquares(opts: {
    type?: 'GEOGRAPHIC' | 'CATEGORY'
    city?: string
    state?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    const { type, city, state, search, limit = 30, offset = 0 } = opts

    const where = {
      status: 'ACTIVE' as const,
      ...(type && { type }),
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
      ...(state && { state: { contains: state, mode: 'insensitive' as const } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { city: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const rows = await prisma.square.findMany({
      where,
      select: { ...SQUARE_CARD_SELECT, _count: { select: { followers: true } } },
      orderBy: [{ type: 'asc' }, { memberCount: 'desc' }],
      take: limit + 1,
      skip: offset,
    })

    const hasMore = rows.length > limit
    const squares = (hasMore ? rows.slice(0, limit) : rows).map(({ _count, ...s }) => ({
      ...s,
      followerCount: _count.followers,
    }))

    return { squares, hasMore, limit, offset }
  },

  async getSquareBySlug(slug: string, userId?: string) {
    const square = await prisma.square.findUnique({
      where: { slug },
      select: {
        ...SQUARE_PUBLIC_SELECT,
        physicalAddress: true,
        officers: { select: OFFICER_SELECT },
        _count: { select: { followers: true, posts: true } },
      },
    })

    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })
    if (square.status !== 'ACTIVE')
      throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    const [followRow, officerRow] = await Promise.all([
      userId
        ? prisma.userSquareFollow.findUnique({
            where: { userId_squareId: { userId, squareId: square.id } },
          })
        : null,
      userId
        ? prisma.squareOfficer.findUnique({
            where: { squareId_profileId: { squareId: square.id, profileId: userId } },
            select: { role: true },
          })
        : null,
    ])

    const { _count, ...squareData } = square
    return {
      ...squareData,
      followerCount: _count.followers,
      postCount: _count.posts,
      isFollowing: !!followRow,
      isOfficer: !!officerRow,
      officerRole: officerRow?.role ?? null,
    }
  },

  // ── Admin: create / update ──────────────────────────────────────────────────

  async createSquare(data: CreateSquareInput) {
    const exists = await prisma.square.findFirst({
      where: { OR: [{ slug: data.slug }, { name: data.name }] },
    })
    if (exists)
      throw createError({ statusCode: 409, statusMessage: 'A Square with that name or slug already exists' })

    const square = await prisma.square.create({
      data: {
        ...data,
        status: 'PENDING',
        wallet: { create: {} }, // provision wallet immediately
      },
      select: SQUARE_PUBLIC_SELECT,
    })

    entityEmbedder.embedSquare(square.id)

    return square
  },

  async activateSquare(slug: string) {
    return prisma.square.update({
      where: { slug },
      data: { status: 'ACTIVE' },
      select: SQUARE_PUBLIC_SELECT,
    })
  },

  async updateSquare(slug: string, data: UpdateSquareInput) {
    const square = await prisma.square.findUnique({ where: { slug } })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    const updated = await prisma.square.update({
      where: { slug },
      data,
      select: SQUARE_PUBLIC_SELECT,
    })

    entityEmbedder.embedSquare(updated.id)
    await bust('squares:list:*')

    return updated
  },

  // ── Seller membership ───────────────────────────────────────────────────────

  /**
   * A seller applies to join a Square.
   * Rules:
   *  - One primary Square per seller (GEOGRAPHIC or CATEGORY)
   *  - Max two secondary Squares, and they must be CATEGORY type
   *  - Cannot join a Square they're already in
   */
  async joinSquare(sellerId: string, squareSlug: string) {
    const square = await prisma.square.findUnique({ where: { slug: squareSlug } })
    if (!square || square.status !== 'ACTIVE')
      throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    // Check existing memberships
    const existing = await prisma.squareMembership.findUnique({
      where: { squareId_sellerId: { squareId: square.id, sellerId } },
    })
    if (existing)
      throw createError({ statusCode: 409, statusMessage: 'Already a member of this Square' })

    const allMemberships = await prisma.squareMembership.findMany({
      where: { sellerId, status: { in: ['ACTIVE', 'PENDING'] } },
      include: { square: { select: { type: true } } },
    })

    const hasPrimary = allMemberships.some((m) => m.isPrimary)
    const secondaryCount = allMemberships.filter((m) => !m.isPrimary).length

    // Determine if this will be primary or secondary
    const isPrimary = !hasPrimary

    if (!isPrimary) {
      // Secondary rules: must be CATEGORY, max 2
      if (square.type === 'GEOGRAPHIC')
        throw createError({
          statusCode: 400,
          statusMessage: 'You can only join a Geographic Square as your primary Square',
        })
      if (secondaryCount >= 2)
        throw createError({
          statusCode: 400,
          statusMessage: 'You can belong to a maximum of 2 secondary Squares',
        })
    }

    const membership = await prisma.squareMembership.create({
      data: {
        squareId: square.id,
        sellerId,
        isPrimary,
        status: 'PENDING',
      },
    })

    return { membership, square: { id: square.id, name: square.name, slug: square.slug } }
  },

  /**
   * Officer approves, rejects, or suspends a membership.
   * On approval: update SellerProfile.primarySquareId if isPrimary,
   * increment Square.memberCount, and propagate squareId to existing products/posts.
   */
  async actOnMembership(
    officerProfileId: string,
    squareSlug: string,
    sellerId: string,
    input: MembershipActionInput,
    isPlatformAdmin = false,
  ) {
    const square = await prisma.square.findUnique({ where: { slug: squareSlug } })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    // Platform admins bypass the officer check
    if (!isPlatformAdmin) {
      const officer = await prisma.squareOfficer.findFirst({
        where: {
          squareId: square.id,
          profileId: officerProfileId,
          role: { in: ['CHAIRMAN', 'SECRETARY'] },
        },
      })
      if (!officer)
        throw createError({ statusCode: 403, statusMessage: 'Only a Chairman or Secretary can manage memberships' })
    }

    const membership = await prisma.squareMembership.findUnique({
      where: { squareId_sellerId: { squareId: square.id, sellerId } },
    })
    if (!membership)
      throw createError({ statusCode: 404, statusMessage: 'Membership not found' })

    const newStatus =
      input.action === 'APPROVE'
        ? ('ACTIVE' as const)
        : input.action === 'REJECT'
          ? ('REJECTED' as const)
          : ('SUSPENDED' as const)

    const [updated] = await prisma.$transaction(async (tx) => {
      const updated = await tx.squareMembership.update({
        where: { id: membership.id },
        data: {
          status: newStatus,
          verifiedById: officerProfileId,
          ...(input.action === 'SUSPEND' && {
            suspendedAt: new Date(),
            suspendReason: input.reason,
          }),
        },
      })

      if (input.action === 'APPROVE') {
        // Increment member counter
        await tx.square.update({
          where: { id: square.id },
          data: { memberCount: { increment: 1 } },
        })

        // Update seller's primarySquareId if this is their primary
        if (membership.isPrimary) {
          await tx.sellerProfile.update({
            where: { id: sellerId },
            data: { primarySquareId: square.id },
          })

          // Back-fill existing products and posts with this squareId
          await tx.products.updateMany({
            where: { sellerId },
            data: { squareId: square.id },
          })
          await tx.post.updateMany({
            where: { authorId: (await tx.sellerProfile.findUnique({ where: { id: sellerId }, select: { profileId: true } }))!.profileId },
            data: { squareId: square.id },
          })
        }

      }

      return [updated]
    })

    // Notify seller after the transaction so SSE push fires correctly
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      select: { profileId: true },
    })
    if (sellerProfile) {
      if (input.action === 'APPROVE') {
        notificationQueue.enqueue({
          userId: sellerProfile.profileId,
          type: 'SQUARE_MEMBERSHIP_APPROVED',
          actorId: officerProfileId,
          message: `Your application to join ${square.name} has been approved.`,
        })
      } else if (input.action === 'REJECT') {
        notificationQueue.enqueue({
          userId: sellerProfile.profileId,
          type: 'SQUARE_MEMBERSHIP_REJECTED',
          actorId: officerProfileId,
          message: `Your application to join ${square.name} was not approved.${input.reason ? ` Reason: ${input.reason}` : ''}`,
        })
      }
    }

    return updated
  },

  // ── User follow ─────────────────────────────────────────────────────────────

  async followSquare(userId: string, squareSlug: string) {
    const square = await prisma.square.findUnique({
      where: { slug: squareSlug, status: 'ACTIVE' },
    })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    // Idempotent — only increment counter on a new follow
    const existing = await prisma.userSquareFollow.findUnique({
      where: { userId_squareId: { userId, squareId: square.id } },
    })
    if (existing) return { following: true, squareId: square.id }

    await prisma.$transaction([
      prisma.userSquareFollow.create({ data: { userId, squareId: square.id } }),
      prisma.square.update({
        where: { id: square.id },
        data: { followerCount: { increment: 1 } },
      }),
    ])

    return { following: true, squareId: square.id }
  },

  async unfollowSquare(userId: string, squareSlug: string) {
    const square = await prisma.square.findUnique({ where: { slug: squareSlug } })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    const existing = await prisma.userSquareFollow.findUnique({
      where: { userId_squareId: { userId, squareId: square.id } },
    })
    if (!existing) return { following: false, squareId: square.id }

    await prisma.$transaction([
      prisma.userSquareFollow.delete({
        where: { userId_squareId: { userId, squareId: square.id } },
      }),
      prisma.square.update({
        where: { id: square.id },
        data: { followerCount: { decrement: 1 } },
      }),
    ])

    return { following: false, squareId: square.id }
  },

  // ── Officers ────────────────────────────────────────────────────────────────

  async addOfficer(callerProfileId: string, squareSlug: string, input: AddOfficerInput) {
    const square = await prisma.square.findUnique({ where: { slug: squareSlug } })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    // Only Chairman can appoint officers
    const caller = await prisma.squareOfficer.findFirst({
      where: { squareId: square.id, profileId: callerProfileId, role: 'CHAIRMAN' },
    })
    if (!caller)
      throw createError({ statusCode: 403, statusMessage: 'Only the Chairman can appoint officers' })

    const officer = await prisma.squareOfficer.upsert({
      where: { squareId_profileId: { squareId: square.id, profileId: input.profileId } },
      create: {
        squareId: square.id,
        profileId: input.profileId,
        role: input.role,
        appointedBy: callerProfileId,
      },
      update: { role: input.role, appointedBy: callerProfileId },
      select: OFFICER_SELECT,
    })

    return officer
  },

  async listOfficers(squareSlug: string) {
    const square = await prisma.square.findUnique({
      where: { slug: squareSlug },
      select: { id: true },
    })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    return prisma.squareOfficer.findMany({
      where: { squareId: square.id },
      select: {
        ...OFFICER_SELECT,
        appointedBy: true,
        appointedAt: true,
      },
      orderBy: { appointedAt: 'asc' },
    })
  },

  async removeOfficer(callerProfileId: string, squareSlug: string, targetProfileId: string) {
    const square = await prisma.square.findUnique({ where: { slug: squareSlug }, select: { id: true } })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    const caller = await prisma.squareOfficer.findFirst({
      where: { squareId: square.id, profileId: callerProfileId, role: 'CHAIRMAN' },
    })
    if (!caller)
      throw createError({ statusCode: 403, statusMessage: 'Only the Chairman can remove officers' })

    const target = await prisma.squareOfficer.findUnique({
      where: { squareId_profileId: { squareId: square.id, profileId: targetProfileId } },
    })
    if (!target) throw createError({ statusCode: 404, statusMessage: 'Officer not found' })
    if (target.role === 'CHAIRMAN')
      throw createError({ statusCode: 400, statusMessage: 'Cannot remove the Chairman' })

    await prisma.squareOfficer.delete({
      where: { squareId_profileId: { squareId: square.id, profileId: targetProfileId } },
    })

    return { removed: true }
  },

  // ── Association wallet ──────────────────────────────────────────────────────

  /**
   * Iterates every seller in an order and calls creditAssociation for each.
   * Mirrors the same seller-amount computation used by walletService.creditSellersOnPayment.
   * Call this non-blocking after walletService.creditSellersOnPayment.
   */
  async creditAssociationsForOrder(orderId: number) {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                price: true,
                discount: true,
                seller: { select: { id: true } },
              },
            },
          },
        },
      },
    })

    const sellerAmounts = new Map<string, number>()
    for (const item of items) {
      const product = item.variant?.product
      const sellerId = product?.seller?.id
      if (!sellerId) continue
      const price = item.variant.price ?? product.price
      const discount = product.discount ?? 0
      // Amount in kobo to match walletService units
      const amountKobo = Math.round(price * (1 - discount / 100) * item.quantity * 100)
      sellerAmounts.set(sellerId, (sellerAmounts.get(sellerId) ?? 0) + amountKobo)
    }

    await Promise.allSettled(
      Array.from(sellerAmounts.entries())
        .filter(([, amount]) => amount > 0)
        .map(([sellerId, orderAmount]) =>
          squareService.creditAssociation({ sellerId, orderId, orderAmount }),
        ),
    )
  },

  /**
   * Called from the order completion flow.
   * Credits the primary Square's wallet with the association's cut.
   */
  async creditAssociation(opts: {
    sellerId: string
    orderId: number
    orderAmount: number // in same currency unit as the order
  }) {
    const { sellerId, orderId, orderAmount } = opts

    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      select: { primarySquareId: true },
    })
    if (!seller?.primarySquareId) return null // seller not in a Square

    const square = await prisma.square.findUnique({
      where: { id: seller.primarySquareId },
      select: { id: true, associationCutPercent: true, wallet: { select: { id: true } } },
    })
    if (!square?.wallet) return null

    const cutAmount = (orderAmount * square.associationCutPercent) / 100

    await prisma.$transaction([
      prisma.squareTransaction.create({
        data: {
          squareId: square.id,
          walletId: square.wallet.id,
          orderId,
          sellerAmount: orderAmount,
          cutPercent: square.associationCutPercent,
          cutAmount,
        },
      }),
      prisma.squareWallet.update({
        where: { id: square.wallet.id },
        data: {
          balance: { increment: cutAmount },
          totalEarned: { increment: cutAmount },
        },
      }),
    ])

    return { squareId: square.id, cutAmount }
  },
}
