import { PageTemplate } from '@/components/layout'
import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Forgot Password',
  description: 'Enter your email address to reset your password',
  urlPath: 'auth/forgot-password'
})

export default function ForgotPasswordPage() {
  const forgotPasswordConfig = {
    title: 'Forgot Password',
    description: 'Enter your email address to reset your password',
    submitLabel: 'Send Reset Password Link',
    defaultValues: {
      email: ''
    },
    fields: [
      {
        name: 'email' as FieldConfig['name'],
        label: 'Email',
        description: 'Enter your email address'
      }
    ]
  }

  return (
    <PageTemplate alignment="center" fullHeight>
      <AuthForm config={forgotPasswordConfig} mode="forgot-password" />
    </PageTemplate>
  )
}
