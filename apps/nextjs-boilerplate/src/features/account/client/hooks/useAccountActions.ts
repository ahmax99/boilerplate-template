// import { useRouter } from 'next/navigation'
// import { toast } from 'sonner'

// import type { SupportedOAuthProvider } from '@/features/auth/constants/oAuthProviders'
// import {
//   PROTECTED_ROUTES,
//   PUBLIC_AUTH_ROUTES,
//   PUBLIC_ROUTES
// } from '@/features/auth/constants/routes'
// import { authClient } from '@/features/auth/lib/authClient'
// import { useErrorHandler } from '@/features/error/client/hooks/useErrorHandler'
// import { handleClientAuthError } from '@/features/error/client/lib/handleError'

// import type {
//   ChangePasswordSchema,
//   SetPasswordSchema,
//   UpdateProfileSchema
// } from '../../schemas/accountForm.schema'
// import type { listUserAccounts } from '../../server/api/listUserAccounts'

// export const useAccountActions = () => {
//   const router = useRouter()
//   const handleError = useErrorHandler()

//   const handleUpdateProfile = (
//     updateProfileData: UpdateProfileSchema,
//     user: UpdateProfileSchema
//   ) => {
//     const promises = [authClient.updateUser({ name: updateProfileData.name })]

//     if (updateProfileData.email !== user.email)
//       promises.push(
//         authClient.changeEmail({
//           newEmail: updateProfileData.email,
//           callbackURL: PROTECTED_ROUTES.ACCOUNT
//         })
//       )

//     return handleClientAuthError(Promise.all(promises), handleError, () => {
//       if (updateProfileData.email === user.email) {
//         toast.success('Profile updated successfully')
//       } else {
//         toast.success('Verify your new email address to complete the change.')
//       }

//       router.push(PROTECTED_ROUTES.ACCOUNT)
//     })
//   }

//   const handleChangePassword = (changePasswordData: ChangePasswordSchema) =>
//     handleClientAuthError(
//       authClient.changePassword(changePasswordData),
//       handleError,
//       () => {
//         toast.success('Password changed successfully')
//         router.push(PROTECTED_ROUTES.ACCOUNT)
//       }
//     )

//   const handleSetPassword = (email: SetPasswordSchema['email']) =>
//     handleClientAuthError(
//       authClient.requestPasswordReset({
//         email,
//         redirectTo: PUBLIC_AUTH_ROUTES.RESET_PASSWORD
//       }),
//       handleError,
//       Function.prototype as () => void
//     )

//   const handleLinkAccount = (provider: SupportedOAuthProvider) => {
//     const currentUrl = new URL(globalThis.location.href)
//     const callbackURL = `${PROTECTED_ROUTES.ACCOUNT}${currentUrl.search}`

//     return handleClientAuthError(
//       authClient.linkSocial({ provider, callbackURL }),
//       handleError,
//       () => {
//         toast.success(`${provider} account linked successfully`)
//         router.refresh()
//       }
//     )
//   }

//   const handleUnlinkAccount = (
//     account: Awaited<ReturnType<typeof listUserAccounts>>[number],
//     providerId: SupportedOAuthProvider
//   ) => {
//     if (account == null) {
//       handleError('Account not found')
//       return Promise.resolve({ error: { message: 'Account not found' } })
//     }

//     return handleClientAuthError(
//       authClient.unlinkAccount({ accountId: account.accountId, providerId }),
//       handleError,
//       () => router.refresh()
//     )
//   }

//   const handleDeleteAccount = () =>
//     handleClientAuthError(
//       authClient.deleteUser({ callbackURL: PUBLIC_AUTH_ROUTES.LOGIN }),
//       handleError,
//       () => {
//         toast.success('Account deleted successfully')
//         router.push(PUBLIC_ROUTES.HOME)
//       }
//     )

//   return {
//     handleUpdateProfile,
//     handleChangePassword,
//     handleSetPassword,
//     handleLinkAccount,
//     handleUnlinkAccount,
//     handleDeleteAccount
//   }
// }
