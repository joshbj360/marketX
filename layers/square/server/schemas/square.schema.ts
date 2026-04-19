import { z } from 'zod'

export const createSquareSchema = z.object({
  name: z.string().min(3).max(80),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  description: z.string().max(500).optional(),
  type: z.enum(['GEOGRAPHIC', 'CATEGORY']).default('CATEGORY'),
  bannerUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  // Geographic fields
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  physicalAddress: z.string().max(255).optional(),
  associationCutPercent: z.number().min(0).max(5).default(0.5),
})

export const updateSquareSchema = createSquareSchema.partial().omit({ slug: true })

export const membershipActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'SUSPEND']),
  reason: z.string().max(300).optional(),
})

export const addOfficerSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum(['CHAIRMAN', 'SECRETARY', 'TREASURER', 'MODERATOR', 'GOVT_REP']),
})

export type CreateSquareInput = z.infer<typeof createSquareSchema>
export type UpdateSquareInput = z.infer<typeof updateSquareSchema>
export type MembershipActionInput = z.infer<typeof membershipActionSchema>
export type AddOfficerInput = z.infer<typeof addOfficerSchema>
