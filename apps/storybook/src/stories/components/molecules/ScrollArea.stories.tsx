import { ScrollArea } from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ScrollArea> = {
  title: 'molecules/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text'
    }
  },
  args: {
    className: 'h-32 w-80 rounded-md border p-4',
    type: 'auto',
    children:
      "Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king's pillow, in his soup, even in the royal toilet. The king was furious, but he couldn't seem to stop Jokester. And then, one day, the people of the kingdom discovered that the jokes left by Jokester were so funny that they couldn't help but laugh. And once they started laughing, they couldn't stop. The king was so angry that he banished Jokester from the kingdom, but the people still laughed, and they laughed, and they laughed. And they all lived happily ever after."
  },
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Always: Story = {
  args: {
    type: 'always'
  }
}

export const Hover: Story = {
  args: {
    type: 'hover'
  }
}

export const Scroll: Story = {
  args: {
    type: 'scroll'
  }
}
