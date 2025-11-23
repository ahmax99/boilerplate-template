'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/components/atoms'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingSwap
} from '@repo/ui/components/molecules'
import { useAppForm } from '@repo/ui/hooks'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth/auth.client'

import { protectedRoutes, publicAuthRoutes } from '../../consts/routes'
import type {
  ForgotPasswordSchema,
  LoginSchema,
  SignupSchema
} from '../../schemas/authForm.schema'

export interface FieldConfig {
  readonly name: 'email' | 'password' | 'confirmPassword'
  readonly label: string
  readonly description: string
}

interface AuthFormConfig {
  readonly title: string
  readonly description: string
  readonly fields: FieldConfig[]
  readonly submitLabel: string
  readonly defaultValues: LoginSchema | SignupSchema | ForgotPasswordSchema
}

interface AuthFormProps {
  readonly mode: 'login' | 'signup' | 'forgotPassword'
  readonly config: AuthFormConfig
}

export const AuthForm = ({ mode, config }: AuthFormProps) => {
  const router = useRouter()

  const form = useAppForm({
    defaultValues: config.defaultValues,
    onSubmit: async ({ value }) => {
      if (mode === 'login') {
        const loginValue = value as LoginSchema
        await authClient.signIn.email(
          { ...loginValue, callbackURL: protectedRoutes.home },
          {
            onError: (error) => {
              toast.error(error.error.message || 'Failed to sign in')
            },
            onSuccess: () => router.push(protectedRoutes.home)
          }
        )
      } else if (mode === 'signup') {
        const signupValue = value as SignupSchema
        await authClient.signUp.email(
          {
            name: signupValue.name,
            email: signupValue.email,
            password: signupValue.password,
            callbackURL: protectedRoutes.home
          },
          {
            onError: (error) => {
              toast.error(error.error.message || 'Failed to sign up')
            },
            onSuccess: () => router.push(protectedRoutes.home)
          }
        )
      } else if (mode === 'forgotPassword') {
        const forgotPasswordValue = value as ForgotPasswordSchema
        await authClient.forgetPassword(
          {
            email: forgotPasswordValue.email,
            redirectTo: publicAuthRoutes.resetPassword
          },
          {
            onError: (error) => {
              toast.error(error.error.message || 'Failed to send reset email')
            },
            onSuccess: () => {
              toast.success('Password reset email sent! Check your inbox.')
            }
          }
        )
      }
    }
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          {config.fields.map((field) => (
            <form.AppField key={field.label} name={field.name}>
              {(formField) => (
                <formField.Input
                  description={field.description}
                  label={field.label}
                />
              )}
            </form.AppField>
          ))}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button className="w-full" disabled={!canSubmit} type="submit">
                <LoadingSwap isLoading={isSubmitting ?? false}>
                  {config.submitLabel}
                </LoadingSwap>
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}
