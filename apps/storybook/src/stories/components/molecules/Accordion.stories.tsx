import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

const meta = {
  title: 'molecules/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'radio',
      description: 'Type of accordion behavior',
      options: ['single', 'multiple']
    },
    collapsible: {
      control: 'boolean',
      description: 'Can an open accordion be collapsed using the trigger',
      if: { arg: 'type', eq: 'single' }
    },
    disabled: {
      control: 'boolean'
    }
  },
  args: {
    type: 'single',
    collapsible: true,
    disabled: false
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components'
          aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

type StoryPlayContext = Parameters<NonNullable<Story['play']>>[0]

export const Default: Story = {}

export const ShouldOnlyOpenOneWhenSingleType: Story = {
  name: 'when accordions are clicked, should open only one item at a time',
  args: {
    type: 'single' as const
  },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }: StoryPlayContext) => {
    const canvas = within(canvasElement)
    const accordions = canvas.getAllByRole('button')

    if (!accordions.length) {
      throw new Error('Accordion triggers were not rendered')
    }

    // Open the tabs one at a time
    for (const trigger of accordions) {
      await userEvent.click(trigger)
      await waitFor(() =>
        expect(canvas.queryAllByRole('region')).toHaveLength(1)
      )
    }

    // Close the last opened tab
    const lastAccordion = accordions.at(-1)
    if (!lastAccordion)
      throw new Error('Accordion triggers were not rendered in closing step')

    await userEvent.click(lastAccordion)
    await waitFor(() => expect(canvas.queryByRole('region')).toBeFalsy())
  }
}

export const ShouldOpenAllWhenMultipleType: Story = {
  name: 'when accordions are clicked, should open all items one at a time',
  args: {
    type: 'multiple'
  },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }: StoryPlayContext) => {
    const canvas = within(canvasElement)
    const accordions = canvas.getAllByRole('button')

    if (!accordions.length) {
      throw new Error('Accordion triggers were not rendered')
    }

    // Open all tabs one at a time
    for (let i = 0; i < accordions.length; i++) {
      const accordionToOpen = accordions[i]
      if (!accordionToOpen)
        throw new Error('Accordion trigger missing during open step')

      await userEvent.click(accordionToOpen)
      await waitFor(() =>
        expect(canvas.findAllByRole('region')).toHaveLength(i + 1)
      )
    }

    // Close all tabs one at a time
    for (let i = accordions.length - 1; i > 0; i--) {
      const accordionToClose = accordions[i]
      if (!accordionToClose)
        throw new Error('Accordion trigger missing during close step')

      await userEvent.click(accordionToClose)
      await waitFor(() =>
        expect(canvas.findAllByRole('region')).toHaveLength(i)
      )
    }

    // Close the last opened tab
    const firstAccordion = accordions[0]
    if (!firstAccordion)
      throw new Error(
        'Accordion triggers were not rendered in final close step'
      )

    await userEvent.click(firstAccordion)
    await waitFor(() => expect(canvas.queryByRole('region')).toBeFalsy())
  }
}
