// FILE PATH: server/layers/user/schemas/content.schema.ts

/**
 * Content Schema
 * Validation for posts, comments, likes, shares
 */

import { z } from 'zod'

// ==================== POSTS ====================

const mediaItemSchema = z.object({
  url: z.string().url(),
  public_id: z.string(),
  type: z.enum(['IMAGE', 'VIDEO', 'AUDIO']),
})

export const createPostSchema = z
  .object({
    caption: z.string().max(2000).optional(),
    content: z.string().max(10000).optional(),
    mediaData: z.array(mediaItemSchema).max(10).optional(),
    musicData: mediaItemSchema.extend({ name: z.string().optional() }).optional(),
    taggedProducts: z.array(z.number()).optional(),
    contentType: z
      .enum([
        'COMMERCE',
        'EXPERIENCE',
        'INSPIRATION',
        'EDUCATIONAL',
        'ENTERTAINMENT',
      ])
      .default('COMMERCE'),
    visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).default('PUBLIC'),
    allowComments: z.boolean().default(true),
  })
  .refine(
    (data) =>
      (data.mediaData && data.mediaData.length > 0) ||
      !!data.content ||
      !!data.caption,
    { message: 'Post must have at least a caption, content, or media.' },
  )

export const updatePostSchema = z.object({
  caption: z.string().max(2000).optional(),
  content: z.string().max(10000).optional(),
  contentType: z
    .enum([
      'COMMERCE',
      'EXPERIENCE',
      'INSPIRATION',
      'EDUCATIONAL',
      'ENTERTAINMENT',
    ])
    .optional(),
})

// ==================== COMMENTS ====================

export const createCommentSchema = z.object({
  text: z.string().min(1).max(500),
  parentId: z.string().uuid().optional(),
})

export const updateCommentSchema = z.object({
  text: z.string().min(1).max(500),
})

// ==================== SHARES ====================

export const createShareSchema = z.object({
  platform: z.string().optional(),
  shareUrl: z.string().url().optional(),
})

// ==================== PAGINATION ====================

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})
