import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const BREAKPOINTS = [
  { label: 'default', minWidth: '0px', maxWidth: '100%' },
  { label: 'sm', minWidth: '640px', maxWidth: '640px' },
  { label: 'md', minWidth: '768px', maxWidth: '768px' },
  { label: 'lg', minWidth: '1024px', maxWidth: '1024px' },
  { label: 'xl', minWidth: '1280px', maxWidth: '1280px' },
  { label: '2xl', minWidth: '1536px', maxWidth: '1400px' }
] as const

const ContainerRow = ({
  label,
  minWidth,
  maxWidth
}: (typeof BREAKPOINTS)[number]) => (
  <TableRow>
    <TableCell>{label}</TableCell>
    <TableCell>{minWidth}</TableCell>
    <TableCell>{maxWidth}</TableCell>
    <TableCell>
      <div className="flex w-full justify-center">
        <div className="h-8 w-full max-w-[min(var(--preview-width,100%),100%)] overflow-hidden">
          <div
            className="h-full rounded bg-linear-to-r from-primary/10 to-primary"
            style={{ width: maxWidth }}
          />
        </div>
      </div>
    </TableCell>
  </TableRow>
)

const meta: Meta = {
  title: 'tokens/Container',
  parameters: {
    layout: 'fullscreen'
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Breakpoint</TableHead>
          <TableHead>Min Width</TableHead>
          <TableHead>Container Max Width</TableHead>
          <TableHead>
            <span className="sr-only">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {BREAKPOINTS.map((breakpoint) => (
          <ContainerRow key={breakpoint.label} {...breakpoint} />
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
