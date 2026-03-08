// import { useRouter } from 'next/navigation'
// import { toast } from 'sonner'

// import { useErrorHandler } from '@/features/error/client/hooks/useErrorHandler'
// import { handleClientAuthError } from '@/features/error/client/lib/handleError'

// import type { SupportedOAuthProvider } from '../../constants/oAuthProviders'
// import { PUBLIC_AUTH_ROUTES, PUBLIC_ROUTES } from '../../constants/routes'
// import { authClient } from '../../lib/authClient'
// import type {
//   EmailVerificationSchema,
//   ForgotPasswordSchema,
//   LoginSchema,
//   RegisterSchema,
//   ResetPasswordSchema
// } from '../../schemas/authForm.schema'
// import { getSearchParam } from '../utils/getSearchParam'

// export const useAuthActions = () => {
//   const router = useRouter()
//   const handleError = useErrorHandler()

//   const callbackURL = getSearchParam('callbackUrl') ?? PUBLIC_ROUTES.HOME
//   const token = getSearchParam('token')

//   const handleRegister = (registerData: RegisterSchema) =>
//     handleClientAuthError(
//       authClient.signUp.email({ ...registerData, callbackURL }),
//       handleError,
//       () => {
//         toast.success(
//           'Registration successful! Please check your email to verify your account.'
//         )
//         router.push(
//           `${PUBLIC_AUTH_ROUTES.EMAIL_VERIFY}?email=${encodeURIComponent(registerData.email)}`
//         )
//       }
//     )

//   const handleLogin = (loginData: LoginSchema) =>
//     handleClientAuthError(
//       authClient.signIn.email({ ...loginData, callbackURL }),
//       handleError,
//       () => router.replace(callbackURL)
//     )

//   const handleSocialLogin = (provider: SupportedOAuthProvider) =>
//     handleClientAuthError(
//       authClient.signIn.social({ provider, callbackURL }),
//       handleError
//     )

//   const handleForgotPassword = (forgotPasswordData: ForgotPasswordSchema) =>
//     handleClientAuthError(
//       authClient.requestPasswordReset({
//         ...forgotPasswordData,
//         redirectTo: PUBLIC_AUTH_ROUTES.RESET_PASSWORD
//       }),
//       handleError,
//       () => {
//         toast.success('Password reset email sent.', {
//           description: 'Please check your email to reset your password.'
//         })
//         router.replace(PUBLIC_AUTH_ROUTES.LOGIN)
//       }
//     )

//   const handleResetPassword = (resetPasswordData: ResetPasswordSchema) => {
//     if (token == null)
//       return Promise.resolve({ error: { message: 'Missing reset token' } })

//     return handleClientAuthError(
//       authClient.resetPassword({
//         newPassword: resetPasswordData.password,
//         token
//       }),
//       handleError,
//       () => {
//         toast.success('Password reset successful')
//         router.replace(PUBLIC_AUTH_ROUTES.LOGIN)
//       }
//     )
//   }

//   const handleLogout = () =>
//     handleClientAuthError(authClient.signOut(), handleError, () =>
//       router.replace(PUBLIC_ROUTES.HOME)
//     )

//   const handleEmailVerification = (email: EmailVerificationSchema['email']) =>
//     handleClientAuthError(
//       authClient.sendVerificationEmail({ email, callbackURL }),
//       handleError,
//       () =>
//         toast.success('Verification email sent.', {
//           description: 'Please check your email to verify your account.'
//         })
//     )

//   return {
//     handleRegister,
//     handleLogin,
//     handleSocialLogin,
//     handleForgotPassword,
//     handleResetPassword,
//     handleLogout,
//     handleEmailVerification
//   }
// }
