import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

type TypographyToken = {
  readonly name: string
  readonly variable: string
}

const SAMPLE_TEXT = 'Almost before we knew it, we had left the ground.'

const toCssProperty = (propertyKey: keyof React.CSSProperties) => {
  let result = ''

  for (const char of propertyKey) {
    if (char >= 'A' && char <= 'Z') {
      result += `-${char.toLowerCase()}`
    } else {
      result += char
    }
  }

  return result
}

const readRawValue = (variable: string) => {
  if (typeof document === 'undefined') return ''
  return globalThis
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

const readComputedValue = (
  variable: string,
  propertyKey: keyof React.CSSProperties
) => {
  if (typeof document === 'undefined') return ''

  const cssProperty = toCssProperty(propertyKey)
  const probe = document.createElement('span')
  probe.style.setProperty(cssProperty, `var(${variable})`)
  probe.style.setProperty('position', 'absolute')
  probe.style.setProperty('visibility', 'hidden')
  probe.style.setProperty('pointer-events', 'none')
  document.body.appendChild(probe)

  const computed = globalThis
    .getComputedStyle(probe)
    .getPropertyValue(cssProperty)
    .trim()

  probe.remove()
  return computed
}

const TypographyRow = ({
  token,
  propertyKey,
  sampleText
}: {
  token: TypographyToken
  propertyKey: keyof React.CSSProperties
  sampleText: string
}) => {
  const rawValue = readRawValue(token.variable)
  const computedValue = readComputedValue(token.variable, propertyKey)

  const previewStyle = {
    [propertyKey]: `var(${token.variable})`
  } as React.CSSProperties

  return (
    <TableRow>
      <TableCell>{token.name}</TableCell>
      <TableCell>{token.variable}</TableCell>
      <TableCell>{rawValue || '—'}</TableCell>
      <TableCell>{computedValue || '—'}</TableCell>
      <TableCell>
        <span className="block whitespace-nowrap" style={previewStyle}>
          {sampleText}
        </span>
      </TableCell>
    </TableRow>
  )
}

const meta: Meta<{
  tokens: readonly TypographyToken[]
  propertyKey: keyof React.CSSProperties
  sampleText: string
}> = {
  title: 'tokens/Typography',
  argTypes: {},
  args: {
    sampleText: SAMPLE_TEXT
  },
  render: (args) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Variable</TableHead>
          <TableHead>Raw Value</TableHead>
          <TableHead>Computed Value</TableHead>
          <TableHead>
            <span className="sr-only">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {args.tokens.map((token) => (
          <TypographyRow
            key={token.name}
            propertyKey={args.propertyKey}
            sampleText={args.sampleText}
            token={token}
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

type Story = StoryObj<typeof meta>

const TRACKING_TOKENS: readonly TypographyToken[] = [
  { name: 'base', variable: '--tracking-base' },
  { name: 'tighter', variable: '--tracking-tighter' },
  { name: 'tight', variable: '--tracking-tight' },
  { name: 'normal', variable: '--tracking-normal' },
  { name: 'wide', variable: '--tracking-wide' },
  { name: 'wider', variable: '--tracking-wider' },
  { name: 'widest', variable: '--tracking-widest' }
]

const LEADING_TOKENS: readonly TypographyToken[] = [
  { name: 'base', variable: '--leading-base' },
  { name: 'none', variable: '--leading-none' },
  { name: 'tight', variable: '--leading-tight' },
  { name: 'snug', variable: '--leading-snug' },
  { name: 'normal', variable: '--leading-normal' },
  { name: 'relaxed', variable: '--leading-relaxed' },
  { name: 'loose', variable: '--leading-loose' }
]

export const Tracking: Story = {
  args: {
    propertyKey: 'letterSpacing',
    tokens: TRACKING_TOKENS
  }
}

export const Leading: Story = {
  args: {
    propertyKey: 'lineHeight',
    tokens: LEADING_TOKENS
  }
}
