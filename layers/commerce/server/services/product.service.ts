import { UserError } from '~~/layers/profile/server/types/user.types'
import { auditQueue } from '~~/server/queues/audit.queue'
import { productRepository } from '../repositories/product.repository'
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
} from '../schemas/product.schema'

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
    data: any,
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

  async getProducts(filters: any, pagination: any) {
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

    const [products, total] = await Promise.all([
      productRepository.getProducts(
        { status, search, sellerId, isThrift, categorySlug },
        { limit, offset },
      ),
      productRepository.countProducts({
        status,
        search,
        sellerId,
        isThrift,
        categorySlug,
      }),
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
    data: any,
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
