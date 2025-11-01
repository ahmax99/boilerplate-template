import { useState } from 'react'
import { Badge } from '@repo/ui/components/atoms'
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue
} from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CheckIcon } from 'lucide-react'

const FRAMEWORKS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Solid', value: 'solid' },
  { label: 'Qwik', value: 'qwik' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'Remix', value: 'remix' }
] as const

const meta: Meta<typeof MultiSelect> = {
  title: 'organisms/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

const BasicDemo = () => {
  const [selected, setSelected] = useState<string[]>(['react', 'nextjs'])

  return (
    <MultiSelect onValuesChange={setSelected} values={selected}>
      <MultiSelectTrigger className="w-80">
        <MultiSelectValue
          overflowBehavior="wrap-when-open"
          placeholder="Select frameworks..."
        />
      </MultiSelectTrigger>
      <MultiSelectContent>
        {FRAMEWORKS.map((framework) => (
          <MultiSelectItem key={framework.value} value={framework.value}>
            {framework.label}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  )
}

const WithBadgesDemo = () => {
  const [selected, setSelected] = useState<string[]>(['react', 'nextjs'])

  return (
    <div className="flex flex-col gap-4">
      <MultiSelect onValuesChange={setSelected} values={selected}>
        <MultiSelectTrigger className="w-80">
          <MultiSelectValue
            overflowBehavior="wrap-when-open"
            placeholder="Select frameworks..."
          />
        </MultiSelectTrigger>
        <MultiSelectContent>
          {FRAMEWORKS.map((framework) => (
            <MultiSelectItem
              badgeLabel={framework.label}
              key={framework.value}
              value={framework.value}
            >
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4" />
                <span>{framework.label}</span>
                <Badge className="ml-auto" variant="outline">
                  {framework.value}
                </Badge>
              </div>
            </MultiSelectItem>
          ))}
        </MultiSelectContent>
      </MultiSelect>
      <div className="flex flex-wrap gap-2">
        {selected.map((value) => (
          <Badge key={value} variant="default">
            {FRAMEWORKS.find((f) => f.value === value)?.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}

const EmptyStateDemo = () => {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <MultiSelect onValuesChange={setSelected} values={selected}>
      <MultiSelectTrigger className="w-80">
        <MultiSelectValue placeholder="No options available" />
      </MultiSelectTrigger>
      <MultiSelectContent search={{ emptyMessage: 'No frameworks found' }}>
        <div className="py-6 text-center text-sm">No frameworks found</div>
      </MultiSelectContent>
    </MultiSelect>
  )
}

const GroupedItemsDemo = () => {
  const [selected, setSelected] = useState<string[]>(['react', 'nextjs'])

  return (
    <MultiSelect onValuesChange={setSelected} values={selected}>
      <MultiSelectTrigger className="w-80">
        <MultiSelectValue placeholder="Select frameworks..." />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup heading="Popular">
          {FRAMEWORKS.filter((f) =>
            ['react', 'nextjs', 'vue'].includes(f.value)
          ).map((framework) => (
            <MultiSelectItem key={framework.value} value={framework.value}>
              {framework.label}
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
        <MultiSelectSeparator />
        <MultiSelectGroup heading="Others">
          {FRAMEWORKS.filter(
            (f) => !['react', 'nextjs', 'vue'].includes(f.value)
          ).map((framework) => (
            <MultiSelectItem key={framework.value} value={framework.value}>
              {framework.label}
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  )
}

const DisabledDemo = () => {
  const [selected, setSelected] = useState<string[]>(['react'])

  return (
    <div className="flex flex-col gap-4">
      <MultiSelect onValuesChange={setSelected} values={selected}>
        <MultiSelectTrigger className="w-80" disabled>
          <MultiSelectValue placeholder="Select frameworks..." />
        </MultiSelectTrigger>
        <MultiSelectContent>
          {FRAMEWORKS.map((framework) => (
            <MultiSelectItem key={framework.value} value={framework.value}>
              {framework.label}
            </MultiSelectItem>
          ))}
        </MultiSelectContent>
      </MultiSelect>
      <p className="text-sm text-muted-foreground">
        Component is fully disabled
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => <BasicDemo />
}

export const WithBadges: Story = {
  render: () => <WithBadgesDemo />
}

export const EmptyState: Story = {
  render: () => <EmptyStateDemo />
}

export const GroupedItems: Story = {
  render: () => <GroupedItemsDemo />
}

export const Disabled: Story = {
  render: () => <DisabledDemo />
}
