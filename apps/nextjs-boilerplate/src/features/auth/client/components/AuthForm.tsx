'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button, Input, Separator } from '@/components/atoms'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  LoadingSwap
} from '@/components/molecules'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldTitle
} from '@/components/organisms/Field'
import { PasswordInput } from '@/components/organisms/PasswordInput'

import { PUBLIC_AUTH_ROUTES } from '../../constants/routes'
import {
  AuthFormModel,
  type ForgotPasswordSchema,
  type LoginSchema,
  type RegisterSchema,
  type ResetPasswordSchema
} from '../../schemas/authForm.schema'
import { SocialAuthButtons } from './SocialAuthButton'

type AuthFormSchema =
  | LoginSchema
  | RegisterSchema
  | ForgotPasswordSchema
  | ResetPasswordSchema
type AuthFormMode = 'login' | 'register' | 'forgot-password' | 'reset-password'

export interface FieldConfig {
  name: 'name' | 'email' | 'password' | 'confirmPassword'
  label: string
  description: string
}

export interface AuthFormConfig {
  title: string
  description: string
  fields: FieldConfig[]
  submitLabel: string
  defaultValues: AuthFormSchema
}

interface AuthFormProps {
  mode: AuthFormMode
  config: AuthFormConfig
}

const getSchemaByMode = (
  mode: AuthFormMode
):
  | typeof AuthFormModel.login
  | typeof AuthFormModel.register
  | typeof AuthFormModel.forgotPassword
  | typeof AuthFormModel.resetPassword => {
  switch (mode) {
    case 'login':
      return AuthFormModel.login
    case 'register':
      return AuthFormModel.register
    case 'forgot-password':
      return AuthFormModel.forgotPassword
    case 'reset-password':
      return AuthFormModel.resetPassword
  }
}

export const AuthForm = ({ mode, config }: Readonly<AuthFormProps>) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthFormSchema>({
    resolver: zodResolver(getSchemaByMode(mode)),
    defaultValues: config.defaultValues
  })
  // const {
  //   handleRegister,
  //   handleLogin,
  //   handleForgotPassword,
  //   handleResetPassword
  // } = useAuthActions()

  const renderFieldInput = (field: FieldConfig) => {
    const fieldError = errors[field.name as keyof typeof errors]

    switch (field.name) {
      case 'password':
      case 'confirmPassword':
        return (
          <PasswordInput
            id={field.name}
            placeholder={field.description}
            {...register(field.name)}
            aria-invalid={!!fieldError}
          />
        )
      default:
        return (
          <Input
            id={field.name}
            placeholder={field.description}
            type={field.name === 'email' ? 'email' : 'text'}
            {...register(field.name)}
            aria-invalid={!!fieldError}
          />
        )
    }
  }

  const onSubmit = async (data: AuthFormSchema) => {
    switch (mode) {
      case 'login':
        // await handleLogin(data as LoginSchema)
        break
      case 'register':
        // await handleRegister(data as RegisterSchema)
        break
      case 'forgot-password':
        // await handleForgotPassword(data as ForgotPasswordSchema)
        break
      case 'reset-password':
        // await handleResetPassword(data as ResetPasswordSchema)
        break
    }
  }

  return (
    <Card className="w-full sm:max-w-96">
      <CardHeader className="font-bold text-2xl">
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {config.fields.map((field) => {
            const fieldError = errors[field.name as keyof typeof errors]

            return (
              <Field key={field.name}>
                <FieldLabel
                  className="flex items-center justify-between"
                  htmlFor={field.name}
                >
                  <FieldTitle>{field.label}</FieldTitle>
                  {mode === 'login' && field.name === 'password' && (
                    <Link
                      className="text-muted-foreground text-xs hover:underline hover:underline-offset-4"
                      href={PUBLIC_AUTH_ROUTES.FORGOT_PASSWORD}
                    >
                      Forgot Password?
                    </Link>
                  )}
                </FieldLabel>
                <FieldContent>
                  {renderFieldInput(field)}
                  <FieldError errors={fieldError ? [fieldError] : []} />
                </FieldContent>
              </Field>
            )
          })}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            <LoadingSwap isLoading={isSubmitting}>
              {config.submitLabel}
            </LoadingSwap>
          </Button>
        </form>
      </CardContent>

      {mode === 'login' && (
        <>
          <Separator />
          <CardFooter className="grid grid-cols-2 gap-3">
            <SocialAuthButtons />
          </CardFooter>
        </>
      )}
    </Card>
  )
}
