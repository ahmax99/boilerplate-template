'use client'

import { ActionButton } from '@repo/ui/components/organisms'

interface AuthActionButtonProps
  extends Omit<React.ComponentProps<typeof ActionButton>, 'action'> {
  action: () => Promise<{ error: null | { message?: string } }>
  successMessage?: string
}

export function AuthActionButton({
  action,
  successMessage,
  ...props
}: Readonly<AuthActionButtonProps>) {
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

    return { error: false, message: successMessage }
  }

  return (
    <ActionButton
      {...props}
      action={async () => handleAuthAction(action, successMessage)}
    />
  )
}
