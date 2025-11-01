import { useState } from 'react'
import { Button } from '@repo/ui/components/atoms'
import { ActionButton } from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const WAIT_DURATION = 1200

const wait = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration)
  })

type Status = 'idle' | 'success' | 'error'

type ActionState = {
  readonly status: Status
  readonly shouldFail: boolean
}

const StatusMessage = ({ status }: { readonly status: Status }) => {
  if (status === 'idle') return null

  if (status === 'success') {
    return (
      <p className="text-sm text-emerald-600">Action completed successfully.</p>
    )
  }

  return (
    <p className="text-sm text-destructive">
      Action failed. Check the toast for details.
    </p>
  )
}

const BasicActionDemo = () => {
  const [{ status, shouldFail }, setActionState] = useState<ActionState>({
    status: 'idle',
    shouldFail: false
  })

  const action = async () => {
    await wait(WAIT_DURATION)

    if (shouldFail) {
      setActionState((previous) => ({ ...previous, status: 'error' }))
      return { error: true, message: 'Simulated failure' }
    }

    setActionState((previous) => ({ ...previous, status: 'success' }))
    return { error: false }
  }

  const toggleFailure = () => {
    setActionState((previous) => ({
      status: 'idle',
      shouldFail: !previous.shouldFail
    }))
  }

  return (
    <div className="flex w-72 flex-col gap-4">
      <ActionButton action={action}>Save changes</ActionButton>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Failure simulation:{' '}
          <span className="font-medium">{shouldFail ? 'On' : 'Off'}</span>
        </p>
        <Button
          onClick={toggleFailure}
          size="sm"
          type="button"
          variant="outline"
        >
          Toggle
        </Button>
      </div>
      <StatusMessage status={status} />
    </div>
  )
}

const ConfirmActionDemo = () => {
  const [status, setStatus] = useState<Status>('idle')

  const action = async () => {
    setStatus('idle')
    await wait(WAIT_DURATION)
    setStatus('success')
    return { error: false }
  }

  return (
    <div className="flex w-80 flex-col gap-4">
      <ActionButton
        action={action}
        areYouSureDescription="Deleting the record will remove all associated data."
        requireAreYouSure
        variant="destructive"
      >
        Delete record
      </ActionButton>
      <StatusMessage status={status} />
      <p className="text-xs text-muted-foreground">
        The confirmation dialog remains open while the async action runs,
        ensuring the user sees the loading state.
      </p>
    </div>
  )
}

const meta: Meta<typeof ActionButton> = {
  title: 'organisms/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <BasicActionDemo />
}

export const WithConfirmation: Story = {
  render: () => <ConfirmActionDemo />
}
