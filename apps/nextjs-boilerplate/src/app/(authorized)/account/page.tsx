import { PageTemplate } from '@/components/layout'
import { AccountManagement } from '@/features/account/client/components/AccountManagement'
import { UserInfo } from '@/features/account/server/components/UserInfo'
import { PUBLIC_ROUTES } from '@/features/auth/constants/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Account',
  description: 'Manage your account settings',
  urlPath: 'account'
})

export default async function AccountPage() {
  // const accounts = await listUserAccounts()
  const accounts: {
    id: string
    name: string
    email: string
    providerId: string
    providerAccountId: string
    createdAt: Date
  }[] = [] // TODO: Replace with actual accounts data when auth is implemented

  return (
    <PageTemplate back={{ href: PUBLIC_ROUTES.HOME, label: 'Back to Home' }}>
      <div className="flex flex-col gap-8">
        <UserInfo />
        <AccountManagement accounts={accounts} />
      </div>
    </PageTemplate>
  )
}
