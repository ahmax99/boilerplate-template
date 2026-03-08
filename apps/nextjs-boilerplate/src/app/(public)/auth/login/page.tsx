import Link from 'next/link'

import { PageTemplate } from '@/components/layout'
import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'
import { PUBLIC_AUTH_ROUTES } from '@/features/auth/constants/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Login',
  description: 'Enter your credentials to access your account',
  urlPath: 'auth/login'
})

export default function LoginPage() {
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
    <PageTemplate alignment="center" fullHeight>
      <div className="flex w-full flex-col items-center gap-4">
        <AuthForm config={loginConfig} mode="login" />
        <p className="flex gap-2 text-center text-muted-foreground text-sm">
          <span>Don't have an account?</span>
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href={PUBLIC_AUTH_ROUTES.REGISTER}
          >
            Register
          </Link>
        </p>
      </div>
    </PageTemplate>
  )
}
