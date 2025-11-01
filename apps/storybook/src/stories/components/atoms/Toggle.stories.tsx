import { Toggle } from '@repo/ui/components/atoms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bold, Italic } from 'lucide-react'

const meta: Meta<typeof Toggle> = {
  title: 'atoms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: { disable: true }
    }
  },
  args: {
    children: <Bold className="h-4 w-4" />,
    'aria-label': 'Toggle bold'
  },
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof Toggle>

export const Default: Story = {}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: <Italic className="h-4 w-4" />,
    'aria-label': 'Toggle italic'
  }
}

export const WithText: Story = {
  render: (args) => (
    <Toggle {...args}>
      <Italic className="mr-2 h-4 w-4" />
      Italic
    </Toggle>
  ),
  args: { ...Outline.args }
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
