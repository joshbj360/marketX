// FILE PATH: server/layers/user/schemas/social.schema.ts

/**
 * Social Schema
 * Validation for follows
 */

import { z } from 'zod'

export const followSchema = z.object({
  username: z.string().min(3).max(20),
})

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})
