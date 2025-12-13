import Link from 'next/link'
import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'

import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'
import { PUBLIC_AUTH_ROUTES } from '@/features/auth/constants/routes'

export default function Register() {
  const registerConfig = {
    title: 'Register',
    description: 'Create a new account to get started',
    submitLabel: 'Register',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    fields: [
      {
        name: 'name' as FieldConfig['name'],
        label: 'Name',
        description: 'Enter your full name'
      },
      {
        name: 'email' as FieldConfig['name'],
        label: 'Email',
        description: 'Enter your email address'
      },
      {
        name: 'password' as FieldConfig['name'],
        label: 'Password',
        description: 'Enter your password (min. 8 characters)'
      },
      {
        name: 'confirmPassword' as FieldConfig['name'],
        label: 'Confirm Password',
        description: 'Confirm your password'
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
        <AuthForm config={registerConfig} mode="register" />
        <p className="flex gap-2 text-center text-sm text-muted-foreground">
          <span>Already have an account?</span>
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={PUBLIC_AUTH_ROUTES.LOGIN}
          >
            Sign in
          </Link>
        </p>
      </div>
    </Suspense>
  )
}
