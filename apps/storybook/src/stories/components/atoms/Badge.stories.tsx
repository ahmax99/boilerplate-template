import { Badge } from '@repo/ui/components/atoms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Badge> = {
  title: 'atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline']
    },
    children: {
      control: 'text',
      description: 'Badge content'
    }
  },
  args: {
    variant: 'default',
    children: 'Badge'
  },
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary'
  }
}

export const Destructive: Story = {
  args: {
    variant: 'destructive'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline'
  }
}
