import { type ComponentProps, useId, useState } from 'react'
import { Label, Spinner } from '@repo/ui/components/atoms'
import {
  ButtonGroup,
  ButtonGroupText,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@repo/ui/components/molecules'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea
} from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Check,
  CheckIcon,
  ChevronDownIcon,
  Code,
  Copy,
  CornerDownLeft,
  CreditCardIcon,
  HelpCircle,
  Info,
  InfoIcon,
  Link2Icon,
  LoaderIcon,
  MailIcon,
  MoreHorizontal,
  RefreshCcw,
  SearchIcon,
  Star,
  StarIcon
} from 'lucide-react'

const meta = {
  title: 'organisms/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

type InputGroupStoryProps = ComponentProps<typeof InputGroup>

const WithButtonsContent = (args: InputGroupStoryProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const secureInputId = useId()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup {...args}>
        <InputGroupInput placeholder="https://x.com/shadcn" readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            onClick={() => {
              copyToClipboard('https://x.com/shadcn')
            }}
            size="icon-xs"
            title="Copy"
          >
            {isCopied ? <Check /> : <Copy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="[--radius:9999px]">
        <Popover>
          <PopoverTrigger asChild>
            <InputGroupAddon>
              <InputGroupButton size="icon-xs" variant="secondary">
                <Info />
              </InputGroupButton>
            </InputGroupAddon>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex flex-col gap-1 rounded-xl text-sm"
          >
            <p className="font-medium">Your connection is not secure.</p>
            <p>You should not enter any sensitive information on this site.</p>
          </PopoverContent>
        </Popover>
        <InputGroupAddon className="text-muted-foreground pl-1.5">
          https://
        </InputGroupAddon>
        <InputGroupInput id={secureInputId} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={() => setIsFavorite(!isFavorite)}
            size="icon-xs"
          >
            <Star
              className="data-[favorite=true]:fill-blue-600 data-[favorite=true]:stroke-blue-600"
              data-favorite={isFavorite}
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput placeholder="Type to search..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

const WithTextareaContent = (args: InputGroupStoryProps) => {
  const textareaId = useId()

  return (
    <div className="grid w-full max-w-md gap-4">
      <InputGroup {...args}>
        <InputGroupTextarea
          className="min-h-[200px]"
          id={textareaId}
          placeholder="console.log('Hello, world!');"
        />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText>Line 1, Column 1</InputGroupText>
          <InputGroupButton className="ml-auto" size="sm" variant="default">
            Run <CornerDownLeft />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="font-mono font-medium">
            <Code />
            script.js
          </InputGroupText>
          <InputGroupButton className="ml-auto" size="icon-xs">
            <RefreshCcw />
          </InputGroupButton>
          <InputGroupButton size="icon-xs" variant="ghost">
            <Copy />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

const WithLabelsContent = (args: InputGroupStoryProps) => {
  const baseId = useId()
  const emailId = `${baseId}-email`
  const secondaryEmailId = `${baseId}-email-2`

  return (
    <div className="grid w-full max-w-sm gap-4">
      <TooltipProvider>
        <InputGroup {...args}>
          <InputGroupInput id={emailId} placeholder="shadcn" />
          <InputGroupAddon>
            <Label htmlFor={emailId}>@</Label>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup {...args}>
          <InputGroupInput
            id={secondaryEmailId}
            placeholder="shadcn@vercel.com"
          />
          <InputGroupAddon align="block-start">
            <Label className="text-foreground" htmlFor={secondaryEmailId}>
              Email
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  aria-label="Help"
                  className="ml-auto rounded-full"
                  size="icon-xs"
                  variant="ghost"
                >
                  <InfoIcon />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>We'll use this to send you notifications</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </TooltipProvider>
    </div>
  )
}

const WithButtonGroupContent = (args: InputGroupStoryProps) => {
  const urlId = useId()

  return (
    <div className="grid w-full max-w-sm gap-6">
      <ButtonGroup>
        <ButtonGroupText asChild>
          <Label htmlFor={urlId}>https://</Label>
        </ButtonGroupText>
        <InputGroup {...args}>
          <InputGroupInput id={urlId} />
          <InputGroupAddon align="inline-end">
            <Link2Icon />
          </InputGroupAddon>
        </InputGroup>
        <ButtonGroupText>.com</ButtonGroupText>
      </ButtonGroup>
    </div>
  )
}

export const WithButtonGroup: Story = {
  render: (args) => <WithButtonGroupContent {...args} />
}

export const WithIcons: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup {...args}>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput placeholder="Enter your email" type="email" />
        <InputGroupAddon>
          <MailIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon>
          <CreditCardIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <CheckIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput placeholder="Card number" />
        <InputGroupAddon align="inline-end">
          <StarIcon />
          <InfoIcon />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export const WithButtons: Story = {
  render: (args) => <WithButtonsContent {...args} />
}

export const WithTooltips: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-4">
      <TooltipProvider>
        <InputGroup {...args}>
          <InputGroupInput placeholder="Enter password" type="password" />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  aria-label="Info"
                  size="icon-xs"
                  variant="ghost"
                >
                  <InfoIcon />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Password must be at least 8 characters</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup {...args}>
          <InputGroupInput placeholder="Your email address" />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  aria-label="Help"
                  size="icon-xs"
                  variant="ghost"
                >
                  <HelpCircle />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>We'll use this to send you notifications</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup {...args}>
          <InputGroupInput placeholder="Enter API key" />
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupAddon>
                <InputGroupButton
                  aria-label="Help"
                  size="icon-xs"
                  variant="ghost"
                >
                  <HelpCircle />
                </InputGroupButton>
              </InputGroupAddon>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Click for help with API keys</p>
            </TooltipContent>
          </Tooltip>
        </InputGroup>
      </TooltipProvider>
    </div>
  )
}

export const WithTextarea: Story = {
  render: (args) => <WithTextareaContent {...args} />
}

export const WithSpinner: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup {...args} data-disabled>
        <InputGroupInput disabled placeholder="Searching..." />
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput disabled placeholder="Processing..." />
        <InputGroupAddon>
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput disabled placeholder="Saving changes..." />
        <InputGroupAddon align="inline-end">
          <InputGroupText>Saving...</InputGroupText>
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput disabled placeholder="Refreshing data..." />
        <InputGroupAddon>
          <LoaderIcon className="animate-spin" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-muted-foreground">
            Please wait...
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export const WithLabels: Story = {
  render: (args) => <WithLabelsContent {...args} />
}

export const WithDropdowns: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup {...args}>
        <InputGroupInput placeholder="Enter file name" />
        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton
                aria-label="More"
                size="icon-xs"
                variant="ghost"
              >
                <MoreHorizontal />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Copy path</DropdownMenuItem>
              <DropdownMenuItem>Open location</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="[--radius:1rem]">
        <InputGroupInput placeholder="Enter search query" />
        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton className="pr-1.5! text-xs" variant="ghost">
                Search In... <ChevronDownIcon className="size-3" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="[--radius:0.95rem]">
              <DropdownMenuItem>Documentation</DropdownMenuItem>
              <DropdownMenuItem>Blog Posts</DropdownMenuItem>
              <DropdownMenuItem>Changelog</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
