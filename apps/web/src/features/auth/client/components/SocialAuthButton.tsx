'use client'

import { authClient } from '@/lib/auth/auth.client'

import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS
} from '../../lib/oAuthProviders'
import { AuthActionButton } from './AuthActionButton'

export function SocialAuthButtons() {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon

    return (
      <AuthActionButton
        action={() => authClient.signIn.social({ provider, callbackURL: '/' })}
        key={provider}
        variant="outline"
      >
        <Icon />
        {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
      </AuthActionButton>
    )
  })
}
