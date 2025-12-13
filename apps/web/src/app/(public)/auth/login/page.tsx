import Link from 'next/link'
import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'

import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'
import { PUBLIC_AUTH_ROUTES } from '@/features/auth/constants/routes'

export default function Login() {
  const loginConfig = {
    title: 'Login',
    description: 'Enter your credentials to access your account',
    submitLabel: 'Login',
    defaultValues: {
      email: '',
      password: ''
    },
    fields: [
      {
        name: 'email' as FieldConfig['name'],
        label: 'Email',
        description: 'Enter your email address'
      },
      {
        name: 'password' as FieldConfig['name'],
        label: 'Password',
        description: 'Enter your password'
      }
    ]
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <div className="flex flex-col gap-4 w-full items-center">
        <AuthForm config={loginConfig} mode="login" />
        <p className="flex gap-2 text-center text-sm text-muted-foreground">
          <span>Don't have an account?</span>
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={PUBLIC_AUTH_ROUTES.REGISTER}
          >
            Register
          </Link>
        </p>
      </div>
    </Suspense>
  )
}
