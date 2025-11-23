import { Suspense } from 'react'
import { Spinner } from '@repo/ui/components/atoms'

import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'

export default function Signup() {
  const signupConfig = {
    title: 'Sign Up',
    description: 'Create a new account to get started',
    submitLabel: 'Sign Up',
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <AuthForm config={signupConfig} mode="signup" />
      </Suspense>
    </div>
  )
}
