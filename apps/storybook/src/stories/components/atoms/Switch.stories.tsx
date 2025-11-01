import { Label, Switch } from '@repo/ui/components/atoms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'

const meta: Meta<typeof Switch> = {
  title: 'atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    layout: 'centered'
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <Label htmlFor={args.id}>Airplane Mode</Label>
    </div>
  )
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'default-switch'
  }
}

export const Disabled: Story = {
  args: {
    id: 'disabled-switch',
    disabled: true
  }
}

export const ShouldToggle: Story = {
  name: 'when clicking the switch, should toggle it on and off',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, step }) => {
    const switchBtn = await canvas.findByRole('switch')

    await step('toggle the switch on', async () => {
      await userEvent.click(switchBtn)
      await expect(switchBtn).toBeChecked()
    })

    await step('toggle the switch off', async () => {
      await userEvent.click(switchBtn)
      await expect(switchBtn).not.toBeChecked()
    })
  }
}
