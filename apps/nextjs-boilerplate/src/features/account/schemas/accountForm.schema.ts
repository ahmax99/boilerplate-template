import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address').min(1, 'Email is required')
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    revokeOtherSessions: z.boolean().optional()
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword']
  })

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

export const setPasswordSchema = z.object({
  email: z.email('Invalid email address').min(1, 'Email is required')
})

export type SetPasswordSchema = z.infer<typeof setPasswordSchema>
