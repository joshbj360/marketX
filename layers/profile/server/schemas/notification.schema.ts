// FILE PATH: server/layers/user/schemas/notification.schema.ts

/**
 * Notification Schema
 * Validation for notifications
 */

import { z } from 'zod'

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})
