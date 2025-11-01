import { Calendar } from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { addDays } from 'date-fns'
import { action } from 'storybook/actions'
import { expect, userEvent } from 'storybook/test'

const meta = {
  title: 'organisms/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      table: {
        disable: true
      }
    },
    disabled: {
      control: 'boolean'
    },
    numberOfMonths: {
      control: 'number',
      description: 'Number of months to display'
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Show days that fall outside the current month'
    }
  },
  args: {
    mode: 'single',
    selected: new Date(),
    onSelect: action('onDayClick'),
    className: 'rounded-md border w-fit',
    disabled: false,
    numberOfMonths: 1,
    showOutsideDays: true
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Multiple: Story = {
  args: {
    min: 1,
    selected: [new Date(), addDays(new Date(), 2), addDays(new Date(), 8)],
    mode: 'multiple'
  }
}

export const Range: Story = {
  args: {
    selected: {
      from: new Date(),
      to: addDays(new Date(), 7)
    },
    mode: 'range'
  }
}

export const Disabled: Story = {
  args: {
    disabled: [
      addDays(new Date(), 1),
      addDays(new Date(), 2),
      addDays(new Date(), 3),
      addDays(new Date(), 5)
    ]
  }
}

export const MultipleMonths: Story = {
  args: {
    numberOfMonths: 2,
    showOutsideDays: false
  }
}

export const ShouldNavigateMonthsWhenClicked: Story = {
  name: 'when using the calendar navigation, should change months',
  tags: ['!dev', '!autodocs'],
  args: {
    defaultMonth: new Date(2000, 8)
  },
  play: async ({ canvas }) => {
    const title = await canvas.findByText(/2000/i)
    const startTitle = title.textContent || ''
    const backBtn = await canvas.findByRole('button', {
      name: /previous/i
    })
    const nextBtn = await canvas.findByRole('button', {
      name: /next/i
    })
    const steps = 6
    for (let i = 0; i < steps / 2; i++) {
      await userEvent.click(backBtn)
      expect(title).not.toHaveTextContent(startTitle)
    }
    for (let i = 0; i < steps; i++) {
      await userEvent.click(nextBtn)
      if (i === steps / 2 - 1) {
        expect(title).toHaveTextContent(startTitle)
        continue
      }
      expect(title).not.toHaveTextContent(startTitle)
    }
  }
}
