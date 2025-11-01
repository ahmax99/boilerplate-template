import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

type Shadow = {
  name: string
  value: string
}

const ShadowTile = ({ value }: Pick<Shadow, 'value'>) => {
  const style = globalThis.getComputedStyle(document.documentElement)
  const shadow = style.getPropertyValue(value)

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="bg-card size-20 rounded-md"
        style={{ boxShadow: shadow }}
      />
      <p className="text-center text-xs opacity-70">{value}</p>
      <p className="text-center text-xs">{shadow}</p>
    </div>
  )
}

const meta: Meta<{
  shadow: Shadow[]
}> = {
  title: 'tokens/Shadows',
  argTypes: {},
  render: (args) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>
            <span className="sr-only shadow-2xl">Preview</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {args.shadow.map(({ name, value }) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>
              <ShadowTile value={value} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default meta

type Story = StoryObj<typeof meta>

export const Core: Story = {
  args: {
    shadow: [
      { name: 'xxs', value: '--shadow-2xs' },
      { name: 'xs', value: '--shadow-xs' },
      { name: 'sm', value: '--shadow-sm' },
      { name: 'base', value: '--shadow' },
      { name: 'md', value: '--shadow-md' },
      { name: 'lg', value: '--shadow-lg' },
      { name: 'xl', value: '--shadow-xl' },
      { name: '2xl', value: '--shadow-2xl' }
    ]
  }
}
