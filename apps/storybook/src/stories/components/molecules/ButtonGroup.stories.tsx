import { useState } from 'react'
import { Button, Input, Separator, Textarea } from '@repo/ui/components/atoms'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@repo/ui/components/molecules'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  AudioLinesIcon,
  BotIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon
} from 'lucide-react'

const meta: Meta<typeof ButtonGroup> = {
  title: 'molecules/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    }
  },
  parameters: {
    layout: 'centered'
  },
  args: {
    orientation: 'horizontal'
  }
}

export default meta

type Story = StoryObj<typeof meta>

const WithInputGroupStoryComponent = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <TooltipProvider>
      <ButtonGroup className="[--radius:9999rem]">
        <ButtonGroup>
          <Button size="icon" variant="outline">
            <PlusIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <InputGroup>
            <InputGroupInput
              disabled={voiceEnabled}
              placeholder={
                voiceEnabled ? 'Record and send audio...' : 'Send a message...'
              }
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    aria-pressed={voiceEnabled}
                    className="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
                    data-active={voiceEnabled}
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    size="icon-xs"
                  >
                    <AudioLinesIcon />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>Voice Mode</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
        </ButtonGroup>
      </ButtonGroup>
    </TooltipProvider>
  )
}

const WithSelectStoryComponent = () => {
  const [currency, setCurrency] = useState('$')

  const currencies = [
    { value: '$', label: 'US Dollar' },
    { value: '€', label: 'Euro' },
    { value: '£', label: 'British Pound' }
  ] as const

  return (
    <ButtonGroup>
      <ButtonGroup>
        <Select onValueChange={setCurrency} value={currency}>
          <SelectTrigger className="font-mono">{currency}</SelectTrigger>
          <SelectContent className="min-w-24">
            {currencies.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.value}{' '}
                <span className="text-muted-foreground">{item.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input pattern="[0-9]*" placeholder="10.00" />
      </ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Send" size="icon" variant="outline">
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  )
}

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
      <Button variant="outline">Cut</Button>
    </ButtonGroup>
  )
}

export const Orientation: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button size="icon" variant="outline">
        <PlusIcon />
      </Button>
      <Button size="icon" variant="outline">
        <MoreHorizontalIcon />
      </Button>
    </ButtonGroup>
  ),
  args: {
    orientation: 'vertical'
  }
}

export const Nested: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroup>
        <Button size="sm" variant="outline">
          1
        </Button>
        <Button size="sm" variant="outline">
          2
        </Button>
        <Button size="sm" variant="outline">
          3
        </Button>
        <Button size="sm" variant="outline">
          4
        </Button>
        <Button size="sm" variant="outline">
          5
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Previous" size="icon-sm" variant="outline">
          <ArrowLeftIcon />
        </Button>
        <Button aria-label="Next" size="icon-sm" variant="outline">
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  )
}

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button size="sm" variant="secondary">
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button size="sm" variant="secondary">
        Paste
      </Button>
    </ButtonGroup>
  )
}

export const Split: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">Button</Button>
      <ButtonGroupSeparator />
      <Button size="icon" variant="secondary">
        <PlusIcon />
      </Button>
    </ButtonGroup>
  )
}

export const WithInput: Story = {
  render: () => (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button aria-label="Search" variant="outline">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  )
}

export const WithInputGroup: Story = {
  render: () => <WithInputGroupStoryComponent />
}

export const WithDropdownMenu: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Follow</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="pl-2!" variant="outline">
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="[--radius:1rem]">
          <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
          <DropdownMenuItem>Mark as Read</DropdownMenuItem>
          <DropdownMenuItem>Report Conversation</DropdownMenuItem>
          <DropdownMenuItem>Block User</DropdownMenuItem>
          <DropdownMenuItem>Share Conversation</DropdownMenuItem>
          <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            Delete Conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}

export const WithSelect: Story = {
  render: () => <WithSelectStoryComponent />
}

export const WithPopover: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <BotIcon /> Copilot
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button aria-label="Open Popover" size="icon" variant="outline">
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="rounded-xl p-0 text-sm">
          <div className="px-4 py-3">
            <div className="text-sm font-medium">Agent Tasks</div>
          </div>
          <Separator />
          <div className="p-4 text-sm *:[p:not(:last-child)]:mb-2">
            <Textarea
              className="mb-4 resize-none"
              placeholder="Describe your task in natural language."
            />
            <p className="font-medium">Start a new task with Copilot</p>
            <p className="text-muted-foreground">
              Describe your task in natural language. Copilot will work in the
              background and open a pull request for your review.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  )
}
