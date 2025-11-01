import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@repo/ui/components/molecules'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor } from 'storybook/test'

const meta: Meta<typeof Tabs> = {
  title: 'molecules/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    defaultValue: 'account',
    className: 'w-96'
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  ),
  parameters: {
    layout: 'centered'
  }
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ShouldChangeTabs: Story = {
  name: 'when clicking a tab, should change the content',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvas, step }) => {
    const tabs = await canvas.findAllByRole('tab')

    for (const [i, tab] of tabs.entries()) {
      if (!tab) continue
      await step(`click the '${tab.innerText}' tab`, async () => {
        await userEvent.click(tab)
        await waitFor(() =>
          expect(tab).toHaveAttribute('aria-selected', 'true')
        )
        await expect(
          canvas.queryByRole('tabpanel', { name: tab.innerText })
        ).toBeVisible()
      })

      await step('check other tabs are not selected', async () => {
        for (const [j, otherTab] of tabs.entries()) {
          if (!otherTab) continue
          if (j === i) continue
          expect(otherTab).toHaveAttribute('aria-selected', 'false')
          expect(
            canvas.queryByRole('tabpanel', { name: otherTab.innerText })
          ).toBeNull()
        }
      })
    }
  }
}
