import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const SAMPLE_LINES = Array.from(
  { length: 12 },
  (_, index) =>
    `Line ${index + 1}. This scrolling container demonstrates the custom scrollbar styles defined in scrollbars.css.`
)

const SAMPLE_CONTENT = SAMPLE_LINES.map((line) => (
  <p className="text-sm" key={line}>
    {line.replace('scrollbars.css', '')}
    <code>scrollbars.css</code>
  </p>
))

const ScrollbarPreview = () => (
  <div className="h-32 overflow-y-scroll rounded border bg-card p-3 space-y-2">
    {SAMPLE_CONTENT}
  </div>
)

const RULES = [
  {
    name: 'Smooth scrolling',
    selector: 'html',
    declaration: 'scroll-behavior: smooth;',
    hasPreview: false
  },
  {
    name: 'Font smoothing',
    selector: '*',
    declaration:
      '-webkit-font-smoothing: antialiased;\n-moz-osx-font-smoothing: grayscale;',
    hasPreview: false
  },
  {
    name: 'Scrollbar width',
    selector: '::-webkit-scrollbar',
    declaration: 'width: 6px;',
    hasPreview: true
  },
  {
    name: 'Scrollbar track',
    selector: '::-webkit-scrollbar-track',
    declaration: 'background: transparent;',
    hasPreview: true
  },
  {
    name: 'Scrollbar thumb',
    selector: '::-webkit-scrollbar-thumb',
    declaration: 'background: rgba(0, 0, 0, 0.2);\nborder-radius: 3px;',
    hasPreview: true
  },
  {
    name: 'Scrollbar thumb hover',
    selector: '::-webkit-scrollbar-thumb:hover',
    declaration: 'background: rgba(0, 0, 0, 0.3);',
    hasPreview: true
  }
] as const

const meta: Meta = {
  title: 'tokens/Scrollbars',
  parameters: {
    layout: 'fullscreen'
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Selector</TableHead>
          <TableHead>Declaration</TableHead>
          <TableHead>
            <span className="sr-only">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {RULES.map((rule) => (
          <TableRow key={rule.name}>
            <TableCell>{rule.name}</TableCell>
            <TableCell>
              <code>{rule.selector}</code>
            </TableCell>
            <TableCell>
              <code className="whitespace-pre-wrap">{rule.declaration}</code>
            </TableCell>
            <TableCell>
              {rule.hasPreview ? <ScrollbarPreview /> : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

export type Story = StoryObj<typeof meta>

export const Default: Story = {}
