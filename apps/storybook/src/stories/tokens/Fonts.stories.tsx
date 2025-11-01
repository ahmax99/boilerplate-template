import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const SAMPLE_TEXT = 'Sphinx of black quartz, judge my vow.'

const FONT_TOKENS = [
  { name: 'sans', variable: '--font-sans' },
  { name: 'serif', variable: '--font-serif' },
  { name: 'mono', variable: '--font-mono' }
] as const

const readVariableValue = (variable: string) => {
  if (typeof document === 'undefined') return ''

  return globalThis
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

const FontRow = ({ name, variable }: (typeof FONT_TOKENS)[number]) => {
  const value = readVariableValue(variable)

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{variable}</TableCell>
      <TableCell>{value || '—'}</TableCell>
      <TableCell>
        <span className="block" style={{ fontFamily: `var(${variable})` }}>
          {SAMPLE_TEXT}
        </span>
      </TableCell>
    </TableRow>
  )
}

const meta: Meta = {
  title: 'tokens/Fonts',
  parameters: {
    layout: 'fullscreen'
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Variable</TableHead>
          <TableHead>Font Stack</TableHead>
          <TableHead>
            <span className="sr-only">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {FONT_TOKENS.map((token) => (
          <FontRow key={token.name} {...token} />
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
