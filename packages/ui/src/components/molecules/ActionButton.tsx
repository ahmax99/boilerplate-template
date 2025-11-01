'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '../atoms'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './AlertDialog'
import { LoadingSwap } from './LoadingSwap'

function ActionButton({
  action,
  requireAreYouSure = false,
  areYouSureDescription = 'This action cannot be undone.',
  ...props
}: React.ComponentProps<typeof Button> & {
  action: () => Promise<{ error: boolean; message?: string }>
  requireAreYouSure?: boolean
  areYouSureDescription?: React.ReactNode
}) {
  const [isLoading, startTransition] = useTransition()

  const performAction = () =>
    startTransition(async () => {
      const data = await action()
      if (data.error) toast.error(data.message ?? 'Error')
    })

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              <LoadingSwap isLoading={isLoading}>Yes</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Button
      {...props}
      disabled={props.disabled ?? isLoading}
      onClick={(e) => {
        performAction()
        props.onClick?.(e)
      }}
    >
      <LoadingSwap
        className="inline-flex items-center gap-2"
        isLoading={isLoading}
      >
        {props.children}
      </LoadingSwap>
    </Button>
  )
}

export { ActionButton }
