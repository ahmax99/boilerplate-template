import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

const meta: Meta<typeof Command> = {
  title: 'molecules/Command',
  component: Command,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    className: 'rounded-lg w-96 border shadow-md'
  },
  render: (args) => (
    <Command {...args}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem disabled>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Billing</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TypingInCombobox: Story = {
  name: 'when typing into the combobox, should filter results',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    await userEvent.type(input, 'calen', { delay: 100 })
    expect(canvas.getAllByRole('option', { name: /calendar/i })).toHaveLength(1)

    await userEvent.clear(input)

    await userEvent.type(input, 'se', { delay: 100 })
    expect(canvas.getAllByRole('option').length).toBeGreaterThan(1)
    expect(canvas.getAllByRole('option', { name: /search/i })).toHaveLength(1)

    await userEvent.clear(input)

    await userEvent.type(input, 'story', { delay: 100 })
    expect(canvas.queryAllByRole('option', { hidden: false })).toHaveLength(0)
    expect(canvas.getByText(/no results/i)).toBeVisible()
  }
}
