import { Button } from '@repo/ui/components'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { Loader2, Mail } from 'lucide-react'

const meta = {
  title: 'ui/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text'
    }
  },
  parameters: {
    layout: 'centered'
  },
  args: {
    variant: 'default',
    size: 'default',
    children: 'Button'
  }
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: {
    variant: 'outline'
  }
}

export const Ghost: Story = {
  args: {
    variant: 'ghost'
  }
}

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

export const Link: Story = {
  args: {
    variant: 'link'
  }
}

export const Loading: Story = {
  render: (args) => (
    <Button {...args}>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Button
    </Button>
  ),
  args: {
    ...Outline.args,
    disabled: true
  }
}

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Mail className="mr-2 h-4 w-4" /> Login with Email Button
    </Button>
  ),
  args: {
    ...Secondary.args
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

export const Icon: Story = {
  args: {
    ...Secondary.args,
    size: 'icon',
    children: <Mail />
  }
}

export const Disabled: Story = {
  args: {
    disabled: true
  }
}
