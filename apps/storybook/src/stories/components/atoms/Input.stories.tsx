import type { ComponentProps } from 'react'
import { useId } from 'react'
import { Button, Input, Label } from '@repo/ui/components/atoms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent } from 'storybook/test'

const meta: Meta<typeof Input> = {
  title: 'atoms/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    className: 'w-96',
    type: 'email',
    placeholder: 'Email',
    disabled: false
  },
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

type InputStoryProps = ComponentProps<typeof Input>

const WithLabelContent = (args: InputStoryProps) => {
  const id = useId()

  return (
    <div className="grid items-center gap-1.5">
      <Label htmlFor={id}>{args.placeholder}</Label>
      <Input {...args} id={id} />
    </div>
  )
}

const WithHelperTextContent = (args: InputStoryProps) => {
  const id = useId()

  return (
    <div className="grid items-center gap-1.5">
      <Label htmlFor={id}>{args.placeholder}</Label>
      <Input {...args} id={id} />
      <p className="text-foreground/60 text-sm">Enter your email address.</p>
    </div>
  )
}

export const Default: Story = {}

export const Disabled: Story = {
  args: { disabled: true }
}

export const WithLabel: Story = {
  render: (args) => <WithLabelContent {...args} />
}

export const WithHelperText: Story = {
  render: (args) => <WithHelperTextContent {...args} />
}

export const WithButton: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Input {...args} />
      <Button type="submit">Subscribe</Button>
    </div>
  )
}

export const ShouldEnterText: Story = {
  name: 'when user enters text, should see it in the input field',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, step }) => {
    const input = await canvas.findByPlaceholderText(/email/i)
    const mockedInput = 'mocked@shadcn.com'

    await step('focus and type into the input field', async () => {
      await userEvent.click(input)
      await userEvent.type(input, mockedInput)
    })

    expect(input).toHaveValue(mockedInput)
  }
}
