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
    data: any,
    authorId?: string,
  ) {
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
    return prisma.products.findMany({
      where,
      include: productFeedInclude,
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { created_at: 'desc' },
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

  async updateProduct(id: number, data: any, authorId?: string) {
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

    // Replace variants if provided (delete all, create new)
    if (data.variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } })
      if (data.variants.length > 0) {
        updateData.variants = {
          create: data.variants.map((v: any) => ({
            size: v.size,
            stock: v.stock,
            price: v.price,
          })),
        }
      }
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
      where: {
        id,
        seller: { profileId: userId },
      },
      select: { id: true },
    })
    return !!product
  },
}
