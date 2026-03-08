import { z } from 'zod'

export const AuthFormModel = {
  register: z
    .object({
      name: z.string().min(1, 'Name is required'),
      email: z.email('Invalid email address').min(1, 'Email is required'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password')
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }),
  login: z.object({
    email: z.email('Invalid email address').min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required')
  }),
  forgotPassword: z.object({
    email: z.email('Invalid email address').min(1, 'Email is required')
  }),
  resetPassword: z
    .object({
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password')
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }),
  emailVerification: z.object({
    email: z.email('Invalid email address').min(1, 'Email is required')
  })
}

export type RegisterSchema = z.infer<typeof AuthFormModel.register>
export type LoginSchema = z.infer<typeof AuthFormModel.login>
export type ForgotPasswordSchema = z.infer<typeof AuthFormModel.forgotPassword>
export type ResetPasswordSchema = z.infer<typeof AuthFormModel.resetPassword>
export type EmailVerificationSchema = z.infer<
  typeof AuthFormModel.emailVerification
>
