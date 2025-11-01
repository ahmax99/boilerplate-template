import { Label } from '@repo/ui/components/atoms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Label> = {
  title: 'atoms/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: { type: 'text' }
    }
  },
  args: {
    children: 'Your email address',
    htmlFor: 'email'
  }
}

export default meta

type Story = StoryObj<typeof Label>

export const Default: Story = {}
