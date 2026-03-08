import Link from 'next/link'

import { PageTemplate } from '@/components/layout'
import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'
import { PUBLIC_AUTH_ROUTES } from '@/features/auth/constants/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Register',
  description: 'Create a new account to get started',
  urlPath: 'auth/register'
})

export default function RegisterPage() {
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
    <PageTemplate alignment="center" fullHeight>
      <div className="flex w-full flex-col items-center gap-4">
        <AuthForm config={registerConfig} mode="register" />
        <p className="flex gap-2 text-center text-muted-foreground text-sm">
          <span>Already have an account?</span>
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={PUBLIC_AUTH_ROUTES.LOGIN}
          >
            Sign in
          </Link>
        </p>
      </div>
    </PageTemplate>
  )
}
