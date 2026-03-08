export const PROTECTED_ROUTES = {
  ACCOUNT: '/account',
  ACCOUNT_EDIT: '/account/edit',
  ACCOUNT_CHANGE_PASSWORD: '/account/change-password'
} as const

export const PUBLIC_ROUTES = {
  HOME: '/',
  BLOG: '/blog',
  BLOG_POST: '/blog/create',
  CONTACT_US: '/contact'
} as const

export const PUBLIC_AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  EMAIL_VERIFY: '/auth/register/email-verify'
} as const
