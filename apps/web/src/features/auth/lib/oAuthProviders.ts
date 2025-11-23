import { GitHubIcon, GoogleIcon } from '@/assets/icon'

export const SUPPORTED_OAUTH_PROVIDERS = ['google', 'github'] as const
export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number]

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  { name: string; Icon: React.ElementType<React.ComponentProps<'svg'>> }
> = {
  google: { name: 'Google', Icon: GoogleIcon },
  github: { name: 'GitHub', Icon: GitHubIcon }
}
