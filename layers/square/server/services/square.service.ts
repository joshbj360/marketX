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

    const [squares, total] = await Promise.all([
      prisma.square.findMany({
        where,
        select: SQUARE_PUBLIC_SELECT,
        orderBy: [{ type: 'asc' }, { memberCount: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.square.count({ where }),
    ])

    return { squares, total, limit, offset }
  },

  async getSquareBySlug(slug: string, userId?: string) {
    const square = await prisma.square.findUnique({
      where: { slug },
      select: {
        ...SQUARE_PUBLIC_SELECT,
        physicalAddress: true,
        officers: { select: OFFICER_SELECT },
        memberships: {
          where: { status: 'ACTIVE' },
          select: {
            isPrimary: true,
            joinedAt: true,
            seller: {
              select: {
                id: true,
                store_name: true,
                store_slug: true,
                store_logo: true,
                is_verified: true,
                isPremium: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
          take: 20,
        },
      },
    })

    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })
    if (square.status !== 'ACTIVE')
      throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    // Is the requesting user following this Square?
    const isFollowing = userId
      ? !!(await prisma.userSquareFollow.findUnique({
          where: { userId_squareId: { userId, squareId: square.id } },
        }))
      : false

    return { ...square, isFollowing }
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

    return prisma.square.update({
      where: { slug },
      data,
      select: SQUARE_PUBLIC_SELECT,
    })
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
  ) {
    const square = await prisma.square.findUnique({ where: { slug: squareSlug } })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    // Verify the caller is an officer with sufficient role
    const officer = await prisma.squareOfficer.findFirst({
      where: {
        squareId: square.id,
        profileId: officerProfileId,
        role: { in: ['CHAIRMAN', 'SECRETARY'] },
      },
    })
    if (!officer)
      throw createError({ statusCode: 403, statusMessage: 'Only a Chairman or Secretary can manage memberships' })

    const membership = await prisma.squareMembership.findUnique({
      where: { squareId_sellerId: { squareId: square.id, sellerId } },
    })
    if (!membership)
      throw createError({ statusCode: 404, statusMessage: 'Membership not found' })

    const newStatus =
      input.action === 'APPROVE'
        ? 'ACTIVE'
        : input.action === 'REJECT'
          ? 'SUSPENDED'
          : 'SUSPENDED'

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

        // Notify the seller
        const sellerProfile = await tx.sellerProfile.findUnique({
          where: { id: sellerId },
          select: { profileId: true },
        })
        if (sellerProfile) {
          await tx.notification.create({
            data: {
              userId: sellerProfile.profileId,
              type: 'SQUARE_MEMBERSHIP_APPROVED',
              message: `Your application to join ${square.name} has been approved.`,
            },
          })
        }
      }

      if (input.action === 'REJECT') {
        const sellerProfile = await tx.sellerProfile.findUnique({
          where: { id: sellerId },
          select: { profileId: true },
        })
        if (sellerProfile) {
          await tx.notification.create({
            data: {
              userId: sellerProfile.profileId,
              type: 'SQUARE_MEMBERSHIP_REJECTED',
              message: `Your application to join ${square.name} was not approved.${input.reason ? ` Reason: ${input.reason}` : ''}`,
            },
          })
        }
      }

      return [updated]
    })

    return updated
  },

  // ── User follow ─────────────────────────────────────────────────────────────

  async followSquare(userId: string, squareSlug: string) {
    const square = await prisma.square.findUnique({
      where: { slug: squareSlug, status: 'ACTIVE' },
    })
    if (!square) throw createError({ statusCode: 404, statusMessage: 'Square not found' })

    await prisma.$transaction([
      prisma.userSquareFollow.upsert({
        where: { userId_squareId: { userId, squareId: square.id } },
        create: { userId, squareId: square.id },
        update: {}, // already following — no-op
      }),
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
