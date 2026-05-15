/**
 * Slim include for feed/list views — only what a card needs.
 * No offers, no tags, no category, only the first image.
 * Detail pages use productInclude (full data).
 */
const productFeedInclude = {
  seller: {
    select: {
      store_slug: true,
      store_logo: true,
      store_name: true,
      default_currency: true,
    },
  },
  media: {
    where: { isBgMusic: false },
    select: { id: true, url: true, type: true, isBgMusic: true },
    take: 1,
    orderBy: { created_at: 'asc' as const },
  },
  variants: {
    select: { id: true, size: true, stock: true, price: true },
    take: 1,
    orderBy: { price: 'asc' as const },
  },
  _count: { select: { likes: true, comments: true, shares: true } },
} as const

const productInclude = {
  seller: {
    select: {
      store_slug: true,
      store_logo: true,
      store_name: true,
      default_currency: true,
    },
  },
  media: {
    select: { id: true, url: true, type: true, isBgMusic: true },
    orderBy: { created_at: 'asc' as const },
  },
  variants: {
    select: { id: true, size: true, stock: true, price: true },
    orderBy: { price: 'asc' as const },
  },
  offers: {
    where: { isActive: true },
    orderBy: { minQuantity: 'asc' as const },
  },
  _count: {
    select: { likes: true, comments: true, shares: true },
  },
  category: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  },
  tags: {
    include: {
      tag: { select: { id: true, name: true } },
    },
  },
}

import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema'

// Upsert tags by name and sync the product→tag join table
async function upsertProductTags(productId: number, tagNames: string[]) {
  const cleaned = tagNames
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 50)

  if (!cleaned.length) {
    // Remove all existing tags if empty array passed
    await prisma.productTags.deleteMany({ where: { productId } })
    return
  }

  // Upsert each tag by name
  const tags = await Promise.all(
    cleaned.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      }),
    ),
  )

  const tagIds = tags.map((t) => t.id)

  // Replace all existing tags for this product
  await prisma.productTags.deleteMany({ where: { productId } })
  await prisma.productTags.createMany({
    data: tagIds.map((tagId) => ({ productId, tagId })),
    skipDuplicates: true,
  })
}

export const productRepository = {
  async createProduct(
    sellerId: string,
    storeSlug: string,
    data: CreateProductInput & { slug: string },
    authorId?: string,
  ) {
    // Inherit squareId from the seller's primary Square
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      select: { primarySquareId: true },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productData: any = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      price: data.price,
      status: data.status || 'DRAFT',
      sellerId,
      store_slug: storeSlug,
      isFeatured: data.isFeatured ?? false,
      isAccessory: data.isAccessory ?? false,
      isThrift: data.isThrift ?? false,
      ...(sellerProfile?.primarySquareId && { squareId: sellerProfile.primarySquareId }),
    }

    if (data.discount !== undefined) productData.discount = data.discount
    if (data.SKU) productData.SKU = data.SKU
    if (data.bannerImageUrl) productData.bannerImageUrl = data.bannerImageUrl
    if (data.affiliateCommission !== undefined)
      productData.affiliateCommission = data.affiliateCommission
    if (data.socialCaptions !== undefined)
      productData.socialCaptions = data.socialCaptions
    if (data.showInFeed) productData.showInFeed = true
    if (data.showInReels) productData.showInReels = true

    if (data.categoryIds?.length) {
      productData.category = {
        create: data.categoryIds.map((catId: number) => ({
          categoryId: catId,
        })),
      }
    }

    if (data.mediaId) {
      productData.media = { connect: [{ id: data.mediaId }] }
    }

    if (data.variants && data.variants.length > 0) {
      productData.variants = {
        create: data.variants.map((v: any) => ({
          size: v.size,
          stock: v.stock,
          price: v.price,
        })),
      }
    }

    if (data.offers && data.offers.length > 0) {
      productData.offers = {
        create: data.offers.map((o: any) => ({
          minQuantity: o.minQuantity,
          discount: o.discount,
          label: o.label || null,
        })),
      }
    }

    // ── Unified Product Post: create linked Post first so we can reference its id ──
    let linkedPostId: string | undefined
    if ((data.showInFeed || data.showInReels) && authorId) {
      const caption =
        (data.socialCaptions as any)?.feedCaption || data.description || null
      const post = await prisma.post.create({
        data: {
          authorId,
          caption,
          contentType: 'COMMERCE',
          isProductPost: true,
          visibility: 'PUBLIC',
        },
        select: { id: true },
      })
      linkedPostId = post.id
      productData.linkedPostId = linkedPostId
    }

    // Inline media creation (images + background music)
    // When linked to a Post, each media record also gets postId so it appears in the feed
    const mediaToCreate: any[] = []
    if (authorId && data.mediaItems?.length) {
      for (const m of data.mediaItems) {
        mediaToCreate.push({
          url: m.url,
          public_id: m.public_id,
          type: m.type || 'IMAGE',
          isBgMusic: false,
          authorId,
          ...(linkedPostId ? { postId: linkedPostId } : {}),
        })
      }
    }
    if (authorId && data.bgMusic?.url) {
      mediaToCreate.push({
        url: data.bgMusic.url,
        public_id: data.bgMusic.public_id || '',
        type: 'AUDIO',
        isBgMusic: true,
        authorId,
        ...(linkedPostId ? { postId: linkedPostId } : {}),
      })
    }
    if (mediaToCreate.length) {
      productData.media = { create: mediaToCreate }
    }

    // Set first image as bannerImageUrl if none provided
    if (!productData.bannerImageUrl && data.mediaItems?.[0]?.url) {
      productData.bannerImageUrl = data.mediaItems[0].url
    }

    const product = await prisma.products.create({
      data: productData,
      include: productInclude,
    })

    // Upsert and connect tags after creation
    if (data.tagNames?.length) {
      await upsertProductTags(product.id, data.tagNames)
    }

    // Auto-tag the product in its linked post so it appears in the shop strip
    if (linkedPostId) {
      await prisma.productPostTag.create({
        data: { postId: linkedPostId, productId: product.id },
      })
    }

    return product
  },

  async getProducts(
    filters: {
      status?: string
      sellerId?: string
      search?: string
      storeSlug?: string
      isThrift?: boolean
      categorySlug?: string
      minDiscount?: number
      minPrice?: number
      maxPrice?: number
      sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
    },
    pagination: { limit: number; offset: number },
  ) {
    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.sellerId) where.sellerId = filters.sellerId
    if (filters.storeSlug) where.store_slug = filters.storeSlug
    if (filters.isThrift !== undefined) where.isThrift = filters.isThrift
    if (filters.categorySlug) {
      where.category = { some: { category: { slug: filters.categorySlug } } }
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    if (filters.minDiscount && filters.minDiscount > 0) {
      where.discount = { gte: filters.minDiscount }
    }
    if (filters.minPrice != null || filters.maxPrice != null) {
      where.price = {}
      if (filters.minPrice != null) where.price.gte = filters.minPrice
      if (filters.maxPrice != null) where.price.lte = filters.maxPrice
    }

    const orderByMap = {
      newest:    { created_at: 'desc' as const },
      price_asc: { price: 'asc' as const },
      price_desc: { price: 'desc' as const },
      // popular sorts by like count — Prisma orderBy on _count relation
      popular:   { likes: { _count: 'desc' as const } },
    }
    const orderBy = orderByMap[filters.sortBy ?? 'newest']

    return prisma.products.findMany({
      where,
      include: productFeedInclude,
      take: pagination.limit,
      skip: pagination.offset,
      orderBy,
    })
  },

  async getProductById(id: number) {
    return prisma.products.findUnique({
      where: { id },
      include: productInclude,
    })
  },

  async getProductBySlug(slug: string) {
    return prisma.products.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    })
  },

  async getProductBySlugFull(slug: string) {
    return prisma.products.findUnique({
      where: { slug },
      include: productInclude,
    })
  },

  async getProductsBySellerSlug(
    storeSlug: string,
    pagination: { limit: number; offset: number },
    status?: string,
    search?: string,
  ) {
    const where: any = { store_slug: storeSlug }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    return prisma.products.findMany({
      where,
      include: productInclude,
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { created_at: 'desc' },
    })
  },

  async updateProduct(id: number, data: UpdateProductInput, authorId?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined)
      updateData.description = data.description
    if (data.price !== undefined) updateData.price = data.price
    if (data.discount !== undefined) updateData.discount = data.discount
    if (data.status !== undefined) updateData.status = data.status
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    if (data.isAccessory !== undefined)
      updateData.isAccessory = data.isAccessory
    if (data.isThrift !== undefined) updateData.isThrift = data.isThrift
    if (data.SKU !== undefined) updateData.SKU = data.SKU
    if (data.bannerImageUrl !== undefined)
      updateData.bannerImageUrl = data.bannerImageUrl
    if (data.affiliateCommission !== undefined)
      updateData.affiliateCommission = data.affiliateCommission
    if (data.socialCaptions !== undefined)
      updateData.socialCaptions = data.socialCaptions
    if (data.categoryIds !== undefined) {
      updateData.category = {
        deleteMany: {},
        create: data.categoryIds.map((catId: number) => ({
          categoryId: catId,
        })),
      }
    }
    if (data.mediaId) {
      updateData.media = { connect: [{ id: data.mediaId }] }
    }

    // Sync variants if provided — upsert by size to avoid the unique constraint
    // on (productId, size) when a protected variant (in an order/cart) can't be deleted.
    if (data.variants !== undefined) {
      // Current variants by size — used for upsert lookup
      const currentVariants = await prisma.productVariant.findMany({
        where: { productId: id },
        select: { id: true, size: true },
      })

      // Find protected variant IDs (referenced by orders or active carts)
      const [orderedVariants, cartedVariants] = await Promise.all([
        prisma.orderItem.findMany({
          where: { variant: { productId: id } },
          select: { variantId: true },
          distinct: ['variantId'],
        }),
        prisma.cartItem.findMany({
          where: { variant: { productId: id } },
          select: { variantId: true },
          distinct: ['variantId'],
        }),
      ])

      const protectedIds = new Set([
        ...orderedVariants.map((o) => o.variantId),
        ...cartedVariants.map((c) => c.variantId),
      ].filter(Boolean) as number[])

      const existingBySize = new Map(currentVariants.map((v) => [v.size ?? '', v.id]))
      const submittedSizes = new Set((data.variants as any[]).map((v) => v.size ?? ''))

      // Delete unprotected variants whose sizes were removed from the submitted form
      const toDelete = currentVariants
        .filter((v) => !protectedIds.has(v.id) && !submittedSizes.has(v.size ?? ''))
        .map((v) => v.id)
      if (toDelete.length) {
        await prisma.productVariant.deleteMany({ where: { id: { in: toDelete } } })
      }

      // Upsert each submitted variant: update if the size already exists, create if new
      await Promise.all(
        (data.variants as any[]).map((v) => {
          const existingId = existingBySize.get(v.size ?? '')
          if (existingId) {
            return prisma.productVariant.update({
              where: { id: existingId },
              data: { stock: v.stock, price: v.price },
            })
          }
          return prisma.productVariant.create({
            data: { productId: id, size: v.size, stock: v.stock, price: v.price },
          })
        }),
      )
      // Variants are handled above — do not include in the main Products.update call
    }

    // Replace offers if provided (delete all, create new)
    if (data.offers !== undefined) {
      await prisma.productOffer.deleteMany({ where: { productId: id } })
      if (data.offers.length > 0) {
        updateData.offers = {
          create: data.offers.map((o: any) => ({
            minQuantity: o.minQuantity,
            discount: o.discount,
            label: o.label || null,
          })),
        }
      }
    }

    // Remove individual media items
    if (data.removeMediaIds?.length) {
      await prisma.media.deleteMany({
        where: { id: { in: data.removeMediaIds } },
      })
    }

    // Remove bg music
    if (data.removeBgMusic) {
      await prisma.media.deleteMany({
        where: { productId: id, isBgMusic: true },
      })
    }

    // Add new media items
    if (authorId && data.mediaItems?.length) {
      updateData.media = updateData.media || {}
      updateData.media.create = data.mediaItems.map((m: any) => ({
        url: m.url,
        public_id: m.public_id,
        type: m.type || 'IMAGE',
        isBgMusic: false,
        authorId,
      }))
      // Update cover if no explicit bannerImageUrl
      if (!data.bannerImageUrl) {
        updateData.bannerImageUrl = data.mediaItems[0].url
      }
    }

    // Add new bg music
    if (authorId && data.bgMusic?.url) {
      // Remove existing bg music first
      await prisma.media.deleteMany({
        where: { productId: id, isBgMusic: true },
      })
      const bgMediaCreate = {
        url: data.bgMusic.url,
        public_id: data.bgMusic.public_id || '',
        type: 'AUDIO',
        isBgMusic: true,
        authorId,
      }
      if (updateData.media?.create) {
        updateData.media.create.push(bgMediaCreate)
      } else {
        updateData.media = {
          ...(updateData.media || {}),
          create: [bgMediaCreate],
        }
      }
    }

    const product = await prisma.products.update({
      where: { id },
      data: updateData,
      include: productInclude,
    })

    // Sync tags if provided
    if (data.tagNames !== undefined) {
      await upsertProductTags(id, data.tagNames)
    }

    return product
  },

  async archiveProduct(id: number) {
    return prisma.products.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: productInclude,
    })
  },

  async countProducts(filters: {
    status?: string
    sellerId?: string
    search?: string
    storeSlug?: string
    isThrift?: boolean
    categorySlug?: string
  }) {
    const where: any = {}
    if (filters.status) where.status = filters.status
    if (filters.sellerId) where.sellerId = filters.sellerId
    if (filters.storeSlug) where.store_slug = filters.storeSlug
    if (filters.isThrift !== undefined) where.isThrift = filters.isThrift
    if (filters.categorySlug) {
      where.category = { some: { category: { slug: filters.categorySlug } } }
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }
    return prisma.products.count({ where })
  },

  async checkOwnership(id: number, userId: string): Promise<boolean> {
    const product = await prisma.products.findFirst({
      where: { id, seller: { profileId: userId } },
      select: { id: true },
    })
    return !!product
  },

  // ── Likes ─────────────────────────────────────────────────────────────────

  async likeProduct(userId: string, productId: number) {
    await prisma.like.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    })
    return prisma.like.count({ where: { productId } })
  },

  async unlikeProduct(userId: string, productId: number) {
    await prisma.like.deleteMany({ where: { userId, productId } })
    return prisma.like.count({ where: { productId } })
  },

  async isLikedByUser(userId: string, productId: number): Promise<boolean> {
    const like = await prisma.like.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { userId: true },
    })
    return !!like
  },

  // ── Comments ──────────────────────────────────────────────────────────────

  async getComments(productId: number, limit: number, offset: number) {
    return prisma.comment.findMany({
      where: { productId, parentId: null },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, replies: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    })
  },

  async countComments(productId: number): Promise<number> {
    return prisma.comment.count({ where: { productId, parentId: null } })
  },

  async getProductWithOwner(productId: number) {
    return prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        seller: { select: { profile: { select: { userId: true } } } },
      },
    })
  },

  async createComment(data: {
    text: string
    authorId: string
    productId: number
    parentId?: string | null
  }) {
    return prisma.comment.create({
      data: {
        id: crypto.randomUUID(),
        text: data.text,
        authorId: data.authorId,
        productId: data.productId,
        parentId: data.parentId ?? null,
      },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, replies: true } },
      },
    })
  },

  // ── Reviews ───────────────────────────────────────────────────────────────

  async getReviews(productId: number, limit: number, offset: number) {
    return prisma.review.findMany({
      where: { productId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        verified: true,
        created_at: true,
        author: { select: { username: true, avatar: true } },
      },
    })
  },

  async countReviews(productId: number): Promise<number> {
    return prisma.review.count({ where: { productId } })
  },

  async getReviewAggregate(productId: number) {
    const [agg, grouped] = await Promise.all([
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { rating: true },
      }),
    ])
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const g of grouped) distribution[g.rating] = g._count.rating
    return { ...agg, distribution }
  },

  async upsertReview(data: {
    productId: number
    authorId: string
    rating: number
    title?: string
    body?: string
    orderId?: number
    verified?: boolean
  }) {
    return prisma.review.upsert({
      where: { productId_authorId: { productId: data.productId, authorId: data.authorId } },
      create: {
        productId: data.productId,
        authorId: data.authorId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        orderId: data.orderId,
        verified: data.verified ?? false,
      },
      update: { rating: data.rating, title: data.title, body: data.body },
      select: { id: true, rating: true, title: true, body: true, verified: true, created_at: true },
    })
  },

  async updateProductRating(productId: number, averageRating: number, totalReviews: number) {
    return prisma.products.update({
      where: { id: productId },
      data: { averageRating, totalReviews },
    })
  },

  // ── Categories ────────────────────────────────────────────────────────────

  async getCategories() {
    return prisma.category.findMany({
      select: { id: true, name: true, slug: true, thumbnailCatUrl: true },
      orderBy: { name: 'asc' },
    })
  },
}
