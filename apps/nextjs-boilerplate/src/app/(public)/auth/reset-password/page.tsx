import { PageTemplate } from '@/components/layout'
import {
  AuthForm,
  type FieldConfig
} from '@/features/auth/client/components/AuthForm'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Reset Password',
  urlPath: 'auth/reset-password'
})

export default function ResetPasswordPage() {
  const resetPasswordConfig = {
    title: 'Reset Password',
    description: 'Enter your new password',
    submitLabel: 'Reset Password',
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
    fields: [
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
        <AuthForm config={resetPasswordConfig} mode="reset-password" />
      </div>
    </PageTemplate>
  )
}
