import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bold, Italic, Underline } from 'lucide-react'

const meta = {
  title: 'organisms/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  argTypes: {
    type: {
      options: ['multiple', 'single'],
      control: { type: 'radio' }
    }
  },
  args: {
    variant: 'default',
    size: 'default',
    type: 'multiple',
    disabled: false
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof ToggleGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: {
    variant: 'outline'
  }
}

export const Single: Story = {
  args: {
    type: 'single'
  }
}

export const Small: Story = {
  args: {
    size: 'sm'
  }
}

export const Large: Story = {
  args: {
    size: 'lg'
  }
}

export const Disabled: Story = {
  args: {
    disabled: true
  }
}
