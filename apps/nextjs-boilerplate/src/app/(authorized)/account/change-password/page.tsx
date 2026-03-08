import { PageTemplate } from '@/components/layout'
import {
  AccountForm,
  type FieldConfig
} from '@/features/account/client/components/AccountForm'
import { PROTECTED_ROUTES } from '@/features/auth/constants/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Change Password',
  description: 'Update your password',
  urlPath: 'account/change-password'
})

export default async function ChangePasswordPage() {
  // const data = await getCurrentSession()
  const data = {
    user: null
  } // TODO: Replace with actual user data when auth is implemented

  const changePasswordConfig = {
    title: 'Change Password',
    description: 'Update your password',
    submitLabel: 'Update Password',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      revokeOtherSessions: false
    },
    fields: [
      {
        name: 'currentPassword' as FieldConfig['name'],
        label: 'Current Password',
        description: 'Enter your current password'
      },
      {
        name: 'newPassword' as FieldConfig['name'],
        label: 'New Password',
        description: 'Enter your new password (min. 6 characters)'
      },
      {
        name: 'revokeOtherSessions' as FieldConfig['name'],
        label: 'Revoke Other Sessions',
        description: 'Sign out from all other devices'
      }
    ]
  }

  return (
    <PageTemplate
      back={{ href: PROTECTED_ROUTES.ACCOUNT, label: 'Back to Account' }}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <AccountForm
          config={changePasswordConfig}
          mode="change-password"
          user={data?.user ?? null}
        />
      </div>
    </PageTemplate>
  )
}
