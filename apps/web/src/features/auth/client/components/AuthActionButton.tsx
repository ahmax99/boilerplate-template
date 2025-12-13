'use client'

import { useRouter } from 'next/navigation'
import { ActionButton } from '@repo/ui/components/organisms'

interface AuthActionButtonProps
  extends Omit<React.ComponentProps<typeof ActionButton>, 'action'> {
  action: () => Promise<{ error: null | { message?: string } }>
  successMessage?: string
  redirectTo?: string
}

export const AuthActionButton = ({
  action,
  successMessage,
  redirectTo,
  ...props
}: AuthActionButtonProps) => {
  const router = useRouter()

  const handleAuthAction = async (
    action: AuthActionButtonProps['action'],
    successMessage?: string
  ) => {
    const result = await action()

    if (result.error)
      return {
        error: true,
        message: result.error.message || 'Action failed'
      }

    if (redirectTo) router.push(redirectTo)

    return { error: false, message: successMessage }
  }

  return (
    <ActionButton
      {...props}
      action={async () => handleAuthAction(action, successMessage)}
    />
  )
}
