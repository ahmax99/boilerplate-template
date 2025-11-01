import { useId } from 'react'
import { Label } from '@repo/ui/components/atoms'
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor } from 'storybook/test'

const RadioGroupStoryContent = (
  args: React.ComponentProps<typeof RadioGroup>
) => {
  const baseId = useId()
  const ids = [
    `${baseId}-default`,
    `${baseId}-comfortable`,
    `${baseId}-compact`
  ]

  return (
    <RadioGroup {...args}>
      <RadioGroupItem id={ids[0]} value="default" />
      <Label htmlFor={ids[0]}>Default</Label>
      <RadioGroupItem id={ids[1]} value="comfortable" />
      <Label htmlFor={ids[1]}>Comfortable</Label>
      <RadioGroupItem id={ids[2]} value="compact" />
      <Label htmlFor={ids[2]}>Compact</Label>
    </RadioGroup>
  )
}

const meta: Meta<typeof RadioGroup> = {
  title: 'molecules/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    defaultValue: 'comfortable',
    className: 'grid gap-2 grid-cols-[1rem_1fr] items-center'
  },
  render: (args) => <RadioGroupStoryContent {...args} />
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ShouldToggleRadio: Story = {
  name: 'when clicking on a radio button, it should toggle its state',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, step }) => {
    const radios = await canvas.findAllByRole('radio')
    expect(radios).toHaveLength(3)

    const defaultRadio = radios[0]
    const comfortableRadio = radios[1]

    if (!defaultRadio || !comfortableRadio)
      throw new Error('Expected target radio buttons to be present')

    await step('click the default radio button', async () => {
      await userEvent.click(defaultRadio)
      await waitFor(() => expect(defaultRadio).toBeChecked())
      await waitFor(() => expect(comfortableRadio).not.toBeChecked())
    })

    await step('click the comfortable radio button', async () => {
      await userEvent.click(comfortableRadio)
      await waitFor(() => expect(comfortableRadio).toBeChecked())
      await waitFor(() => expect(defaultRadio).not.toBeChecked())
    })
  }
}
