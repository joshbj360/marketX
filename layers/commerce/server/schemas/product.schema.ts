import { z } from 'zod'

const mediaItemSchema = z.object({
  url: z.string().url(),
  public_id: z.string(),
  type: z.enum(['IMAGE', 'VIDEO', 'AUDIO']).default('IMAGE'),
})

// Accept "size" or "name" (form alias) — normalized to size internally
export const productVariantSchema = z
  .object({
    size: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    stock: z.number().int().min(0),
    price: z.number().positive().optional(),
  })
  .transform((v) => ({
    size: v.size || v.name || '',
    stock: v.stock,
    price: v.price,
  }))

export const productOfferSchema = z.object({
  minQuantity: z.number().int().min(2),
  discount: z.number().min(1).max(100),
  label: z.string().max(80).optional(),
})

export const createProductSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().positive(),
  discount: z.number().min(0).max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isAccessory: z.boolean().default(false),
  isThrift: z.boolean().default(false),
  SKU: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  mediaId: z.string().uuid().optional(),
  variants: z.array(productVariantSchema).optional(),
  offers: z.array(productOfferSchema).optional(),
  // Multi-image + background music
  mediaItems: z.array(mediaItemSchema).optional(),
  bgMusic: z
    .object({ url: z.string().url(), public_id: z.string() })
    .optional(),
  affiliateCommission: z.number().min(0).optional(),
  categoryIds: z.array(z.number().int()).optional(),
  tagNames: z.array(z.string().max(50)).max(10).optional(),
  socialCaptions: z
    .object({
      feedCaption: z.string().max(2200).optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      pinterest: z.string().optional(),
    })
    .optional(),
  // Unified Product Post — distribute into feed / reels surfaces
  showInFeed: z.boolean().default(false),
  showInReels: z.boolean().default(false),
  // Deals
  isDeal: z.boolean().default(false),
  dealEndsAt: z.string().datetime().optional().nullable(),
  // Pre-loved condition
  condition: z.enum(['NEW_WITH_TAGS', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional().nullable(),
})

export const updateProductSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isFeatured: z.boolean().optional(),
  isAccessory: z.boolean().optional(),
  isThrift: z.boolean().optional(),
  SKU: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  mediaId: z.string().uuid().optional(),
  variants: z.array(productVariantSchema).optional(),
  offers: z.array(productOfferSchema).optional(),
  mediaItems: z.array(mediaItemSchema).optional(),
  bgMusic: z
    .object({ url: z.string().url(), public_id: z.string() })
    .optional(),
  affiliateCommission: z.number().min(0).nullable().optional(),
  categoryIds: z.array(z.number().int()).optional(),
  tagNames: z.array(z.string().max(50)).max(10).optional(),
  socialCaptions: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      pinterest: z.string().optional(),
    })
    .optional(),
  removeMediaIds: z.array(z.string()).optional(),
  removeBgMusic: z.boolean().optional(),
  showInFeed: z.boolean().optional(),
  showInReels: z.boolean().optional(),
  isDeal: z.boolean().optional(),
  dealEndsAt: z.string().datetime().optional().nullable(),
  condition: z.enum(['NEW_WITH_TAGS', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional().nullable(),
})

export const listProductsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  sellerId: z.string().uuid().optional(),
  isThrift: z.coerce.boolean().optional(),
  categorySlug: z.string().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ListProductsInput = z.infer<typeof listProductsSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
