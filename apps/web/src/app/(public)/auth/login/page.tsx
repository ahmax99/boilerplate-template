import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'

import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'

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
      <AuthForm config={loginConfig} mode="login" />
    </Suspense>
  )
}
