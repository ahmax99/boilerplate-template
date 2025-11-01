import { Button } from '@repo/ui/components/atoms'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BellRing } from 'lucide-react'

const notifications = [
  {
    id: 'call-confirmed',
    title: 'Your call has been confirmed.',
    description: '1 hour ago'
  },
  {
    id: 'new-message',
    title: 'You have a new message!',
    description: '1 hour ago'
  },
  {
    id: 'subscription-expiring',
    title: 'Your subscription is expiring soon!',
    description: '2 hours ago'
  }
] as const

const meta: Meta<typeof Card> = {
  title: 'molecules/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    className: 'w-96'
  },
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notifications.map((notification) => (
          <div className="flex items-center gap-4" key={notification.id}>
            <BellRing className="size-6" />
            <div>
              <p>{notification.title}</p>
              <p className="text-foreground/60">{notification.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="link">Close</Button>
      </CardFooter>
    </Card>
  )
}

export const WithCardAction: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Team Settings</CardTitle>
        <CardDescription>Manage your team preferences</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Configure team members, permissions, and notifications.</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Cancel</Button>
        <Button className="ml-auto">Save Changes</Button>
      </CardFooter>
    </Card>
  )
}

export const MinimalCard: Story = {
  render: (args) => (
    <Card {...args}>
      <CardContent>
        <p className="text-sm">
          This is a minimal card with only content. Perfect for displaying
          simple information without the need for a header or footer.
        </p>
      </CardContent>
    </Card>
  )
}

export const HeaderOnly: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
        <CardDescription>
          Your account summary at a glance. Click for details.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
