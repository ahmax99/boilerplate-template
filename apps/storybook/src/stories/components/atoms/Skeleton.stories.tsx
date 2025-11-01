import { Skeleton } from '@repo/ui/components/atoms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Skeleton> = {
  title: 'atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center space-x-4">
      <Skeleton {...args} className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton {...args} className="h-4 w-[250px]" />
        <Skeleton {...args} className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
