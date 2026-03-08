'use client'

import { Shield } from 'lucide-react'

import { Card, CardContent } from '@/components/molecules'
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  type SupportedOAuthProvider
} from '@/features/auth/constants/oAuthProviders'

interface AccountCardProps {
  provider: SupportedOAuthProvider
  // account?: Awaited<ReturnType<typeof listUserAccounts>>[number]
  account?: {
    id: string
    providerAccountId: string
    createdAt: Date
  } // TODO: Replace with proper type when auth is implemented
}

export const AccountCard = ({ provider, account }: AccountCardProps) => {
  // const { handleLinkAccount, handleUnlinkAccount } = useAccountActions()

  const providerDetails = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider] ?? {
    name: provider,
    Icon: Shield
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {<providerDetails.Icon className="size-5" />}
            <div>
              <p className="font-medium">{providerDetails.name}</p>
              {account == null ? (
                <p className="text-muted-foreground text-sm">
                  Connect {providerDetails.name} account for easier sign-in
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Linked on {new Date(account.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {/* {account == null ? (
            <AuthActionButton
              action={() => handleLinkAccount(provider)}
              size="sm"
              variant="outline"
            >
              <Plus />
              Link
            </AuthActionButton>
          ) : (
            <AuthActionButton
              action={() => handleUnlinkAccount(account, provider)}
              size="sm"
              variant="destructive"
            >
              <Trash2 />
              Unlink
            </AuthActionButton>
          )} */}
        </div>
      </CardContent>
    </Card>
  )
}
