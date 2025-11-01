import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

type RadiusToken = {
  readonly name: string
  readonly variable: string
}

const RADIUS_TOKENS: readonly RadiusToken[] = [
  { name: 'base', variable: '--radius-base' },
  { name: 'sm', variable: '--radius-sm' },
  { name: 'md', variable: '--radius-md' },
  { name: 'lg', variable: '--radius-lg' },
  { name: 'xl', variable: '--radius-xl' }
]

const RadiusRow = ({ token }: { token: RadiusToken }) => {
  const styles = globalThis.getComputedStyle(document.documentElement)
  const value = styles.getPropertyValue(token.variable).trim()

  return (
    <TableRow>
      <TableCell>{token.name}</TableCell>
      <TableCell>{token.variable}</TableCell>
      <TableCell>{value || '—'}</TableCell>
      <TableCell>
        <div className="flex items-center justify-center">
          <div
            className="bg-card size-20 border"
            style={{ borderRadius: value }}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

const meta: Meta = {
  title: 'tokens/Borders',
  argTypes: {},
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Variable</TableHead>
          <TableHead>Computed Value</TableHead>
          <TableHead>
            <span className="sr-only">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {RADIUS_TOKENS.map((token) => (
          <RadiusRow key={token.name} token={token} />
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
