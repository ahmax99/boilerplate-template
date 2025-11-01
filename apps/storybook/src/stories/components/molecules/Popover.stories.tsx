import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

const meta: Meta<typeof Popover> = {
  title: 'molecules/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {},

  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
  ),
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ShouldOpenClose: Story = {
  name: 'when clicking the trigger, should open and close the popover',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body)

    await step('click the trigger to open the popover', async () => {
      await userEvent.click(
        await canvasBody.findByRole('button', { name: /open/i })
      )
      expect(await canvasBody.findByRole('dialog')).toBeInTheDocument()
    })

    await step('click the trigger to close the popover', async () => {
      await userEvent.click(
        await canvasBody.findByRole('button', { name: /open/i })
      )
      expect(await canvasBody.findByRole('dialog')).not.toBeInTheDocument()
    })
  }
}
