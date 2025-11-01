import type { ComponentProps } from 'react'
import { useId } from 'react'
import { Button, Label, Textarea } from '@repo/ui/components/atoms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Textarea> = {
  title: 'atoms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    placeholder: 'Type your message here.',
    disabled: false
  }
}

export default meta

type Story = StoryObj<typeof meta>

type TextareaStoryProps = ComponentProps<typeof Textarea>

const WithLabelContent = (args: TextareaStoryProps) => {
  const id = useId()

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor={id}>Your message</Label>
      <Textarea {...args} id={id} />
    </div>
  )
}

const WithTextContent = (args: TextareaStoryProps) => {
  const id = useId()

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor={id}>Your Message</Label>
      <Textarea {...args} id={id} />
      <p className="text-sm text-slate-500">
        Your message will be copied to the support team.
      </p>
    </div>
  )
}

export const Default: Story = {}

export const Disabled: Story = {
  args: {
    disabled: true
  }
}

export const WithLabel: Story = {
  render: (args) => <WithLabelContent {...args} />
}

export const WithText: Story = {
  render: (args) => <WithTextContent {...args} />
}

export const WithButton: Story = {
  render: (args) => (
    <div className="grid w-full gap-2">
      <Textarea {...args} />
      <Button type="submit">Send Message</Button>
    </div>
  )
}
