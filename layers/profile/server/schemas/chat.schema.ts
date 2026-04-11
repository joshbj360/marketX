// FILE PATH: server/layers/user/schemas/chat.schema.ts

/**
 * Chat Schema
 * Validation for conversations and messages
 */

import { z } from 'zod'

// ==================== CONVERSATIONS ====================

export const createConversationSchema = z.object({
  targetId: z.string().uuid(),
  productId: z.number().optional(),
})

export const updateConversationSchema = z.object({
  productId: z.number().optional(),
})

// ==================== MESSAGES ====================

export const createMessageSchema = z.object({
  text: z.string().min(1).max(5000),
  type: z.string().default('text'),
})

// ==================== PAGINATION ====================

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})
