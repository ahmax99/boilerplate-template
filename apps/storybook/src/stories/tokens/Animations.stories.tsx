import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const ANIMATIONS = [
  {
    name: 'accordion-down',
    className: 'animate-accordion-down'
  },
  {
    name: 'accordion-up',
    className: 'animate-accordion-up'
  }
] as const

const PreviewRow = ({ name, className }: (typeof ANIMATIONS)[number]) => {
  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{className}</TableCell>
      <TableCell>
        <div className="relative h-16 overflow-hidden">
          <div
            className="absolute inset-0 grid place-content-center rounded-md border bg-card shadow-sm"
            data-automation-id={`animation-${name}`}
          >
            <div className={className}>Animate</div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

const meta: Meta = {
  title: 'tokens/Animations',
  parameters: {
    layout: 'fullscreen'
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>
            <span className="sr-only">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ANIMATIONS.map((animation) => (
          <PreviewRow key={animation.name} {...animation} />
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
