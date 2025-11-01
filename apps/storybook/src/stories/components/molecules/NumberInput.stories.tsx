import { useState } from 'react'
import { Button } from '@repo/ui/components/atoms'
import {
  InputGroupNumberInput,
  NumberInput
} from '@repo/ui/components/molecules'
import { InputGroup, InputGroupAddon } from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof NumberInput> = {
  title: 'molecules/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

type NumberInputProps = React.ComponentProps<typeof NumberInput>

type ControlledNumberInputProps = Omit<
  NumberInputProps,
  'onChange' | 'value'
> & {
  readonly initialValue?: number | null
}

const ControlledNumberInput = ({
  initialValue = 0,
  ...props
}: ControlledNumberInputProps) => {
  const [value, setValue] = useState<number | null>(initialValue)

  return (
    <div className="flex w-64 flex-col gap-2">
      <NumberInput {...props} onChange={setValue} value={value} />
      <p className="text-sm text-muted-foreground">
        Current value: <span className="font-medium">{value ?? '—'}</span>
      </p>
    </div>
  )
}

export const Basic: Story = {
  args: {
    placeholder: 'Enter a number',
    min: 0,
    max: 10,
    step: 1
  },
  render: (args) => <ControlledNumberInput {...args} initialValue={2} />
}

const InputGroupExample = () => {
  const [value, setValue] = useState<number | null>(5)

  const adjust = (delta: number) => {
    setValue((previous) => {
      const next = (previous ?? 0) + delta
      return next
    })
  }

  return (
    <div className="flex w-72 flex-col gap-3">
      <InputGroup>
        <InputGroupAddon>
          <Button
            aria-label="Decrease value"
            onClick={() => adjust(-1)}
            type="button"
            variant="outline"
          >
            −
          </Button>
        </InputGroupAddon>
        <InputGroupNumberInput
          aria-label="Quantity"
          max={10}
          min={0}
          onChange={setValue}
          value={value}
        />
        <InputGroupAddon>
          <Button
            aria-label="Increase value"
            onClick={() => adjust(1)}
            type="button"
            variant="outline"
          >
            +
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <p className="text-sm text-muted-foreground">
        Selected quantity: <span className="font-medium">{value ?? '—'}</span>
      </p>
    </div>
  )
}

export const WithInputGroup: Story = {
  render: () => <InputGroupExample />
}
