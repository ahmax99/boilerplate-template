'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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

import { PROTECTED_ROUTES } from '../../constants/routes'
import { authClient } from '../../lib/auth.client'
import {
  type LoginSchema,
  loginSchema,
  type SignupSchema,
  signupSchema
} from '../../schemas/authForm.schema'

export interface FieldConfig {
  readonly name: 'name' | 'email' | 'password' | 'confirmPassword'
  readonly label: string
  readonly description: string
}

interface AuthFormConfig {
  readonly title: string
  readonly description: string
  readonly fields: FieldConfig[]
  readonly submitLabel: string
  readonly defaultValues: LoginSchema | SignupSchema
}

interface AuthFormProps {
  readonly mode: 'login' | 'register'
  readonly config: AuthFormConfig
}

export const AuthForm = ({ mode, config }: AuthFormProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackURL = searchParams.get('callbackUrl') ?? PROTECTED_ROUTES.HOME

  const getValidationSchema = () => {
    if (mode === 'login') {
      return loginSchema
    } else if (mode === 'register') {
      return signupSchema
    }
  }

  const form = useAppForm({
    defaultValues: config.defaultValues,
    validators: {
      onSubmit: getValidationSchema()
    },
    onSubmit: async ({ value }) => {
      if (mode === 'login') {
        const loginValue = value as LoginSchema
        await authClient.signIn.email(
          { ...loginValue, callbackURL },
          {
            onError: () => {
              toast.error('Failed to login')
            },
            onSuccess: () => router.push(callbackURL)
          }
        )
      } else if (mode === 'register') {
        const signupValue = value as SignupSchema
        await authClient.signUp.email(
          {
            name: signupValue.name,
            email: signupValue.email,
            password: signupValue.password,
            callbackURL
          },
          {
            onError: () => {
              toast.error('Failed to sign up')
            },
            onSuccess: () => router.push(callbackURL)
          }
        )
      }
    }
  })

  return (
    <Card className="w-full sm:max-w-2xs">
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
