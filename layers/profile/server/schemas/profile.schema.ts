import { z } from 'zod'

// Update user profile
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens',
    )
    .optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  location: z.string().max(100).optional(),
  links: z
    .array(
      z.object({
        type: z.enum([
          'website',
          'twitter',
          'instagram',
          'linkedin',
          'facebook',
        ]),
        url: z.string().url('Invalid URL'),
      }),
    )
    .optional(),
  phone: z.string().optional(),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Update account settings
export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  privateProfile: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  language: z.enum(['en', 'fr', 'es']).optional(),
})
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

// Update email (with verification)
export const updateEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required for email change'),
})
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>

// Update password (while logged in)
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

// Delete account
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE MY ACCOUNT', {
    errorMap: () => ({
      message: 'You must type "DELETE MY ACCOUNT" to confirm',
    }),
  }),
})
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
