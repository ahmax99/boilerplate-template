import { PageTemplate } from '@/components/layout'
import {
  AccountForm,
  type FieldConfig
} from '@/features/account/client/components/AccountForm'
import { PROTECTED_ROUTES } from '@/features/auth/constants/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Edit Profile',
  description: 'Update your profile information',
  urlPath: 'account/edit'
})

export default async function EditAccountPage() {
  // const data = await getCurrentSession()
  const data = {
    user: {
      id: '',
      name: '',
      email: ''
    }
  } // TODO: Replace with actual user data when auth is implemented

  const updateProfileConfig = {
    title: 'Update Profile',
    description: 'Update your profile information',
    submitLabel: 'Update Profile',
    defaultValues: {
      name: data?.user.name ?? '',
      email: data?.user.email ?? ''
    },
    fields: [
      {
        name: 'name' as FieldConfig['name'],
        label: 'Name',
        description: 'Enter your name'
      },
      {
        name: 'email' as FieldConfig['name'],
        label: 'Email',
        description: 'Enter your email address'
      }
    ]
  }
  return (
    <PageTemplate
      back={{ href: PROTECTED_ROUTES.ACCOUNT, label: 'Back to Account' }}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <AccountForm
          config={updateProfileConfig}
          mode="update-profile"
          user={data?.user ?? null}
        />
      </div>
    </PageTemplate>
  )
}
