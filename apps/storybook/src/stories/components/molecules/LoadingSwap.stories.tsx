import { useState } from 'react'
import { Button } from '@repo/ui/components/atoms'
import { LoadingSwap } from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LoadingSwap> = {
  title: 'molecules/LoadingSwap',
  component: LoadingSwap,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

const Content = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center rounded border border-dashed bg-card px-8 py-6">
    <p className="text-sm text-muted-foreground">{children}</p>
  </div>
)

export const StaticLoading: Story = {
  args: {
    isLoading: true,
    children: <Content>Content area hidden while loading…</Content>
  }
}

export const StaticContent: Story = {
  args: {
    isLoading: false,
    children: <Content>Content shown when not loading.</Content>
  }
}

const InteractiveSwap = () => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="flex flex-col items-stretch gap-4">
      <LoadingSwap isLoading={isLoading}>
        <Content>Toggle the state to reveal or hide content.</Content>
      </LoadingSwap>
      <Button onClick={() => setIsLoading((previous) => !previous)}>
        {isLoading ? 'Show Content' : 'Show Spinner'}
      </Button>
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveSwap />
}
