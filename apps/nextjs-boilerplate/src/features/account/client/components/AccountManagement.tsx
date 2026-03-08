'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { LinkIcon, User } from 'lucide-react'

import { Button } from '@/components/atoms'
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/molecules'
import { PROTECTED_ROUTES } from '@/features/auth/constants/routes'

import { DeleteAccountButton } from './DeleteAccountButton'
import { LinkedAccountsTab } from './LinkedAccountsTab'

interface AccountManagementProps {
  // accounts: Awaited<ReturnType<typeof listUserAccounts>>
  accounts: {
    id: string
    providerId: string
    providerAccountId: string
    createdAt: Date
  }[] // TODO: Replace with proper type when auth is implemented
}

export const AccountManagement = ({ accounts }: AccountManagementProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  // const { data } = authClient.useSession()

  const hasPasswordAccounts = accounts.some(
    (a) => a.providerId === 'credential'
  )
  const nonCredentialAccounts = accounts.filter(
    (a) => a.providerId !== 'credential'
  )

  const tabParam = searchParams.get('tab')
  const activeTab = tabParam === 'accounts' ? 'accounts' : 'profile'

  const updateTabParam = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleTabChange = (value: string) => updateTabParam(value)

  // biome-ignore lint/correctness/useExhaustiveDependencies: updateTabParam is stable
  useEffect(() => {
    if (!tabParam) updateTabParam('profile')
  }, [tabParam])

  return (
    <Tabs onValueChange={handleTabChange} value={activeTab}>
      <TabsList className="grid h-fit w-full grid-cols-2">
        <TabsTrigger value="profile">
          <User />
          <span className="max-sm:hidden">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="accounts">
          <LinkIcon />
          <span className="max-sm:hidden">Accounts</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        className="flex flex-col justify-center gap-4"
        value="profile"
      >
        <h2 className="font-medium text-2xl">Settings</h2>
        <Card className="flex flex-row items-center justify-between">
          <CardContent>
            <h3 className="font-medium text-lg">Update Profile</h3>
            <p>
              You can update your account name and request for email address
              change.
            </p>
          </CardContent>
          <CardContent>
            <Button onClick={() => router.push(PROTECTED_ROUTES.ACCOUNT_EDIT)}>
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {hasPasswordAccounts ? (
          <Card className="flex flex-row items-center justify-between">
            <CardContent>
              <h3 className="font-medium text-lg">Change Password</h3>
              <p>Update your password for improved security.</p>
            </CardContent>
            <CardContent>
              <Button
                onClick={() =>
                  router.push(PROTECTED_ROUTES.ACCOUNT_CHANGE_PASSWORD)
                }
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-row items-center justify-between">
            <CardContent>
              <h3 className="font-medium text-lg">Set Password</h3>
              <p>
                We will send you a password reset email to set up a password.
              </p>
            </CardContent>
            {/* <CardContent>
              <SetPasswordButton email={data?.user.email ?? ''} />
            </CardContent> */}
          </Card>
        )}

        <h2 className="font-medium text-2xl">Danger Zone</h2>
        <Card className="flex flex-row items-center justify-between border-destructive">
          <CardContent>
            <h3 className="font-medium text-lg">Delete this account</h3>
            <p>
              Once you delete this account, there is no going back. Please be
              certain.
            </p>
          </CardContent>
          <CardContent>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent className="flex justify-center" value="accounts">
        <LinkedAccountsTab accounts={nonCredentialAccounts} />
      </TabsContent>
    </Tabs>
  )
}
