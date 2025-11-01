import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Avatar> = {
  title: 'molecules/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {},
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
