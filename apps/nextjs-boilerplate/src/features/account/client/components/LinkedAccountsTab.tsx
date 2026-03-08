'use client'

import { Card, CardContent } from '@/components/molecules'
import {
  SUPPORTED_OAUTH_PROVIDERS,
  type SupportedOAuthProvider
} from '@/features/auth/constants/oAuthProviders'

import { AccountCard } from './AccountCard'

interface LinkedAccountsTabProps {
  // accounts: Awaited<ReturnType<typeof listUserAccounts>>[number][]
  accounts: {
    id: string
    providerId: string
    providerAccountId: string
    createdAt: Date
  }[] // TODO: Replace with actual type when auth is implemented
}

export const LinkedAccountsTab = ({ accounts }: LinkedAccountsTabProps) => {
  const availableProviders = SUPPORTED_OAUTH_PROVIDERS.filter(
    (provider) => !accounts.some((acc) => acc.providerId === provider)
  )

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="font-medium text-2xl">Linked Accounts</h2>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-secondary-muted">
              No linked accounts found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <AccountCard
                account={account}
                key={account.id}
                provider={account.providerId as SupportedOAuthProvider}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-medium text-2xl">Link Other Accounts</h2>
        {availableProviders.length > 0 ? (
          <div className="grid gap-3">
            {availableProviders.map((provider) => (
              <AccountCard key={provider} provider={provider} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center text-secondary-muted">
              All available OAuth providers are already linked :)
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
