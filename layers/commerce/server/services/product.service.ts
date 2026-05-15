import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditQueue } from '~~/server/queues/audit.queue'
import { notificationService } from '~~/layers/profile/server/services/notification.service'
import { notificationQueue } from '~~/server/queues/notification.queue'
import { emailQueue } from '~~/server/queues/email.queue'
import { buildReviewReceivedEmail } from '~~/server/utils/email/emailService'
import { auditService } from '~~/server/layers/shared/audit/audit.service'
import { productRepository } from '../repositories/product.repository'
import { prisma } from '~~/server/utils/db'
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '../schemas/product.schema'

export interface ProductFilters {
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
}

export interface ReviewInput {
  rating: number
  title?: string
  body?: string
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const existing = await productRepository.getProductBySlug(base)
  if (!existing) return base
  let counter = 1
  while (true) {
    const candidate = `${base}-${counter}`
    const taken = await productRepository.getProductBySlug(candidate)
    if (!taken) return candidate
    counter++
  }
}

export const productService = {
  async createProduct(
    sellerId: string,
    storeSlug: string,
    data: CreateProductInput,
    ipAddress: string,
    userAgent: string,
    authorId?: string,
  ) {
    const validated = createProductSchema.parse(data)
    const slug = await generateUniqueSlug(validated.title)
    const product = await productRepository.createProduct(
      sellerId,
      storeSlug,
      { ...validated, slug },
      authorId,
    )

    if (authorId) {
      auditQueue.enqueue({
        userId: authorId,
        action: 'PRODUCT_CREATED',
        resource: 'Products',
        resourceId: String(product.id),
        reason: 'Created new product',
        changes: { title: validated.title, status: validated.status },
        ipAddress,
        userAgent,
      })
    }

    return product
  },

  async getProducts(
    filters: ProductFilters,
    pagination: { limit?: number; offset?: number },
  ) {
    const { limit, offset, status, search, sellerId, isThrift, categorySlug } =
      listProductsSchema.parse({
        limit: pagination?.limit,
        offset: pagination?.offset,
        status: filters?.status,
        search: filters?.search,
        sellerId: filters?.sellerId,
        isThrift: filters?.isThrift,
        categorySlug: filters?.categorySlug,
      })

    const repoFilters = {
      status, search, sellerId, isThrift, categorySlug,
      minDiscount: filters?.minDiscount,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      sortBy: filters?.sortBy,
    }

    const [products, total] = await Promise.all([
      productRepository.getProducts(repoFilters, { limit, offset }),
      productRepository.countProducts({ status, search, sellerId, isThrift, categorySlug }),
    ])

    return { products, total, limit, offset }
  },

  async getProductById(id: number) {
    const product = await productRepository.getProductById(id)
    if (!product)
      throw new UserError('PRODUCT_NOT_FOUND', 'Product not found', 404)
    return product
  },

  async getProductBySlug(slug: string) {
    const product = await productRepository.getProductBySlugFull(slug)
    if (!product)
      throw new UserError('PRODUCT_NOT_FOUND', 'Product not found', 404)
    return product
  },

  async getSellerProducts(
    storeSlug: string,
    pagination: { limit: number; offset: number },
    status?: string,
    search?: string,
  ) {
    const [products, total] = await Promise.all([
      productRepository.getProductsBySellerSlug(storeSlug, pagination, status, search),
      productRepository.countProducts({ storeSlug, status, search }),
    ])
    return {
      products,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
    }
  },

  async updateProduct(
    id: number,
    sellerId: string,
    data: UpdateProductInput,
    ipAddress: string,
    userAgent: string,
    authorId?: string,
  ) {
    // Check ownership by userId (works across multiple stores owned by same user)
    const userId = authorId || sellerId
    const isOwner = await productRepository.checkOwnership(id, userId)
    if (!isOwner)
      throw new UserError(
        'FORBIDDEN',
        'You can only edit your own products',
        403,
      )

    const validated = updateProductSchema.parse(data)
    const updated = await productRepository.updateProduct(
      id,
      validated,
      authorId,
    )

    if (authorId)
      auditQueue.enqueue({
        userId: authorId,
        action: 'PRODUCT_UPDATED',
        resource: 'Products',
        resourceId: String(id),
        reason: 'Updated product',
        changes: validated,
        ipAddress,
        userAgent,
      })

    return updated
  },

  // ── Likes ──────────────────────────────────────────────────────────────────

  async likeProduct(userId: string, productId: number) {
    const product = await productRepository.getProductById(productId)
    if (!product) throw new UserError('PRODUCT_NOT_FOUND', 'Product not found', 404)
    const likeCount = await productRepository.likeProduct(userId, productId)
    return { liked: true, likeCount }
  },

  async unlikeProduct(userId: string, productId: number) {
    const likeCount = await productRepository.unlikeProduct(userId, productId)
    return { liked: false, likeCount }
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  async getProductComments(productId: number, limit: number, offset: number) {
    const [comments, total] = await Promise.all([
      productRepository.getComments(productId, limit, offset),
      productRepository.countComments(productId),
    ])
    return { comments, total, limit, offset, hasMore: offset + comments.length < total }
  },

  async createProductComment(
    userId: string,
    username: string,
    productId: number,
    text: string,
    parentId?: string | null,
  ) {
    const product = await productRepository.getProductWithOwner(productId)
    if (!product) throw new UserError('PRODUCT_NOT_FOUND', 'Product not found', 404)

    const comment = await productRepository.createComment({ text, authorId: userId, productId, parentId })

    // Notify product owner (non-blocking, skip self-notifications)
    const ownerId = product.seller?.profile?.userId
    if (ownerId && ownerId !== userId) {
      notificationService
        .createNotification({
          userId: ownerId,
          type: 'PRODUCT_COMMENT',
          actorId: userId,
          message: `${username} commented on your product "${product.title}"`,
          commentId: comment.id,
        })
        .catch(() => {})
    }

    auditService
      .logUserAction({
        userId,
        action: 'PRODUCT_COMMENT_CREATED',
        resource: 'ProductComment',
        resourceId: comment.id,
        reason: `Comment on product ${productId}`,
      })
      .catch(() => {})

    return comment
  },

  // ── Reviews ────────────────────────────────────────────────────────────────

  async getProductReviews(productId: number, limit: number, offset: number) {
    const [reviews, total, agg] = await Promise.all([
      productRepository.getReviews(productId, limit, offset),
      productRepository.countReviews(productId),
      productRepository.getReviewAggregate(productId),
    ])
    return {
      reviews,
      meta: {
        total,
        averageRating: agg._avg.rating,
        distribution: agg.distribution,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }
  },

  async submitProductReview(userId: string, productId: number, data: ReviewInput) {
    // Must have at least one delivered order containing this product
    const deliveredOrder = await prisma.orders.findFirst({
      where: {
        profileId: userId,
        status: 'DELIVERED',
        orderItem: {
          some: {
            variant: { product: { id: productId } },
          },
        },
      },
      select: { id: true },
    })

    if (!deliveredOrder) {
      throw new UserError(
        'PURCHASE_REQUIRED',
        'You can only review products you have purchased and received.',
        403,
      )
    }

    const review = await productRepository.upsertReview({
      productId,
      authorId: userId,
      orderId: deliveredOrder.id,
      verified: true,
      ...data,
    })

    // Recalculate average rating on the product
    const agg = await productRepository.getReviewAggregate(productId)
    await productRepository.updateProductRating(
      productId,
      agg._avg.rating ?? 0,
      agg._count,
    )

    // Notify + email the seller (non-blocking, skip self-reviews)
    prisma.products.findUnique({
      where: { id: productId },
      select: { title: true, seller: { select: { profileId: true } } },
    }).then(async (product) => {
      const sellerProfileId = product?.seller?.profileId
      if (!sellerProfileId || sellerProfileId === userId) return
      notificationQueue.enqueue({
        userId: sellerProfileId,
        type: 'PRODUCT_REVIEW',
        actorId: userId,
        productId,
        message: `You received a ${data.rating}-star review on "${product?.title}".`,
      })
      const sellerUser = await prisma.user.findUnique({
        where: { id: sellerProfileId },
        select: { email: true },
      })
      if (sellerUser?.email) {
        const { subject, html, text } = buildReviewReceivedEmail(
          product!.title,
          data.rating,
          data.title,
        )
        emailQueue.enqueue({ to: sellerUser.email, subject, html, text, type: 'GENERAL' })
      }
    }).catch(() => {})

    return review
  },

  async archiveProduct(
    id: number,
    sellerId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const isOwner = await productRepository.checkOwnership(id, sellerId)
    if (!isOwner)
      throw new UserError(
        'FORBIDDEN',
        'You can only archive your own products',
        403,
      )

    const product = await productRepository.archiveProduct(id)

    auditQueue.enqueue({
      userId: sellerId,
      action: 'PRODUCT_ARCHIVED',
      resource: 'Products',
      resourceId: String(id),
      reason: 'Archived product',
      ipAddress,
      userAgent,
    })

    return product
  },
}
