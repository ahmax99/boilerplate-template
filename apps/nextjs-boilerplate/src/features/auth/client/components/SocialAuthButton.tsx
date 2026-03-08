'use client'

import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS
} from '../../constants/oAuthProviders'

export const SocialAuthButtons = () => {
  // const { handleSocialLogin } = useAuthActions()

  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon

    return (
      // <AuthActionButton
      //   action={() => handleSocialLogin(provider)}
      //   key={provider}
      //   variant="outline"
      // >
      //   <Icon />
      //   {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
      // </AuthActionButton>
      <button key={provider} type="button">
        <Icon />
        {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
      </button> // TODO: implement social auth button
    )
  })
}
