import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

type SpacingToken = {
  readonly name: string
  readonly variable: string
  readonly multiplier: number
}

const BASE_VARIABLE = '--spacing-base'

const formatValue = (value: number, unit: 'rem' | 'px') => {
  const precision = unit === 'rem' ? 3 : 1
  const rounded = Number.parseFloat(value.toFixed(precision))
  return `${rounded}${unit}`
}

const SpacingRow = ({ token }: { token: SpacingToken }) => {
  const rootStyle = globalThis.getComputedStyle(document.documentElement)
  const baseRaw = rootStyle.getPropertyValue(BASE_VARIABLE).trim()
  const baseRem = Number.parseFloat(baseRaw) || 0
  const rootFontSize = Number.parseFloat(rootStyle.fontSize)

  const remValue = baseRem * token.multiplier
  const pxValue = remValue * rootFontSize
  const previewWidth = `${Math.max(pxValue, 1)}px`

  return (
    <TableRow>
      <TableCell>{token.name}</TableCell>
      <TableCell>{token.variable}</TableCell>
      <TableCell>{formatValue(remValue, 'rem')}</TableCell>
      <TableCell>{formatValue(pxValue, 'px')}</TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="bg-muted border">
          <div className="bg-primary h-4" style={{ width: previewWidth }} />
        </div>
      </TableCell>
    </TableRow>
  )
}

const meta: Meta<{
  tokens: SpacingToken[]
}> = {
  title: 'tokens/Spaces',
  argTypes: {},
  render: (args) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Variable</TableHead>
          <TableHead>Rem</TableHead>
          <TableHead>Pixels</TableHead>
          <TableHead className="hidden sm:table-cell">
            <span className="sr-only">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {args.tokens.map((token) => (
          <SpacingRow key={token.name} token={token} />
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

type Story = StoryObj<typeof meta>

const SPACING_TOKENS: SpacingToken[] = [
  { name: 'base', variable: '--spacing-base', multiplier: 1 },
  { name: 'xs', variable: '--spacing-xs', multiplier: 0.5 },
  { name: 'sm', variable: '--spacing-sm', multiplier: 1 },
  { name: 'md', variable: '--spacing-md', multiplier: 2 },
  { name: 'lg', variable: '--spacing-lg', multiplier: 4 },
  { name: 'xl', variable: '--spacing-xl', multiplier: 8 }
]

const GAP_TOKENS: SpacingToken[] = [
  { name: 'xs', variable: '--gap-xs', multiplier: 0.5 },
  { name: 'sm', variable: '--gap-sm', multiplier: 1 },
  { name: 'md', variable: '--gap-md', multiplier: 2 },
  { name: 'lg', variable: '--gap-lg', multiplier: 4 },
  { name: 'xl', variable: '--gap-xl', multiplier: 8 }
]

export const Spacing: Story = {
  args: {
    tokens: SPACING_TOKENS
  }
}

export const Gap: Story = {
  args: {
    tokens: GAP_TOKENS
  }
}
