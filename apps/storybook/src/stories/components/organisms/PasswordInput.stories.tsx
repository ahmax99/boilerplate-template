import { useState } from 'react'
import { Button, Label } from '@repo/ui/components/atoms'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@repo/ui/components/molecules'
import {
  PasswordInput,
  PasswordInputStrengthChecker
} from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InfoIcon } from 'lucide-react'

const meta: Meta<typeof PasswordInput> = {
  title: 'organisms/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

const BasicDemo = () => {
  const [value, setValue] = useState('')

  return (
    <div className="w-80 space-y-4">
      <PasswordInput
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter password"
        value={value}
      />
      <PasswordInputStrengthChecker />
    </div>
  )
}

const WithStatesDemo = () => {
  const [value, setValue] = useState('')

  return (
    <div className="w-80 space-y-4">
      <PasswordInput
        onChange={(e) => setValue(e.target.value)}
        placeholder="Default state"
        value={value}
      />

      <PasswordInput
        disabled
        onChange={(e) => setValue(e.target.value)}
        placeholder="Disabled state"
        value={value}
      />

      <PasswordInput
        aria-invalid="true"
        onChange={(e) => setValue(e.target.value)}
        placeholder="Error state"
        value={value}
      />

      <PasswordInput
        data-disabled
        onChange={(e) => setValue(e.target.value)}
        placeholder="Loading state"
        value={value}
      >
        <div className="flex items-center gap-2 text-sm">
          <span>Verifying password...</span>
        </div>
      </PasswordInput>
    </div>
  )
}

const WithCustomChildrenDemo = () => {
  const [value, setValue] = useState('')

  return (
    <div className="w-80 space-y-4">
      <PasswordInput
        onChange={(e) => setValue(e.target.value)}
        placeholder="With tooltip"
        value={value}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost">
              <InfoIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Password must contain at least 8 characters
          </TooltipContent>
        </Tooltip>
      </PasswordInput>

      <PasswordInput
        onChange={(e) => setValue(e.target.value)}
        placeholder="With custom label"
        value={value}
      >
        <Label className="text-sm">Your secure password</Label>
      </PasswordInput>
    </div>
  )
}

export const Basic: Story = {
  render: () => <BasicDemo />
}

export const States: Story = {
  render: () => <WithStatesDemo />
}

export const WithCustomChildren: Story = {
  render: () => <WithCustomChildrenDemo />
}

export const EdgeCases: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <PasswordInput placeholder="Empty password" value="" />

      <PasswordInput
        placeholder="Long password"
        value="this-is-a-very-long-password-that-exceeds-typical-limits"
      />

      <PasswordInput placeholder="Special characters" value="P@ssw0rd!123$" />
    </div>
  )
}
