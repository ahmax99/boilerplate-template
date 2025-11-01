import type { ComponentProps } from 'react'
import { useId } from 'react'
import { Checkbox, Input, Switch, Textarea } from '@repo/ui/components/atoms'
import {
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@repo/ui/components/molecules'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle
} from '@repo/ui/components/organisms'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Field> = {
  title: 'organisms/Field',
  component: Field,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'responsive']
    }
  },
  parameters: {
    layout: 'centered'
  },
  args: {
    orientation: 'vertical'
  },
  decorators: (Story) => (
    <div className="w-full max-w-md min-w-sm">
      <Story />
    </div>
  )
}

export default meta

type Story = StoryObj<typeof meta>

type FieldStoryProps = ComponentProps<typeof Field>

const WithSwitchContent = (args: FieldStoryProps) => {
  const id = useId()

  return (
    <Field {...args} orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={id}>Multi-factor authentication</FieldLabel>
        <FieldDescription>
          Enable multi-factor authentication. If you do not have a two-factor
          device, you can use a one-time code sent to your email.
        </FieldDescription>
      </FieldContent>
      <Switch id={id} />
    </Field>
  )
}

const WithInputContent = (args: FieldStoryProps) => {
  const id = useId()

  return (
    <FieldSet>
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor={id}>Username</FieldLabel>
          <Input id={id} placeholder="Max Leiter" type="text" />
          <FieldDescription>
            Choose a unique username for your account.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

const WithTextareaContent = (args: FieldStoryProps) => {
  const id = useId()

  return (
    <FieldSet>
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor={id}>Feedback</FieldLabel>
          <Textarea
            id={id}
            placeholder="Your feedback helps us improve..."
            rows={4}
          />
          <FieldDescription>
            Share your thoughts about our service.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

const WithFieldsetContent = () => {
  const baseId = useId()
  const streetId = `${baseId}-street`
  const cityId = `${baseId}-city`
  const zipId = `${baseId}-zip`

  return (
    <div className="w-full max-w-md space-y-6">
      <FieldSet>
        <FieldLegend>Address Information</FieldLegend>
        <FieldDescription>
          We need your address to deliver your order.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={streetId}>Street Address</FieldLabel>
            <Input id={streetId} placeholder="123 Main St" type="text" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor={cityId}>City</FieldLabel>
              <Input id={cityId} placeholder="New York" type="text" />
            </Field>
            <Field>
              <FieldLabel htmlFor={zipId}>Postal Code</FieldLabel>
              <Input id={zipId} placeholder="90502" type="text" />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}

const WithCheckboxContent = () => {
  const baseId = useId()
  const hardDisksId = `${baseId}-hard-disks`
  const externalDisksId = `${baseId}-external-disks`
  const cdsDvdsId = `${baseId}-cds-dvds`
  const connectedServersId = `${baseId}-connected-servers`
  const syncFoldersId = `${baseId}-sync-folders`

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">
          Show these items on the desktop
        </FieldLegend>
        <FieldDescription>
          Select the items you want to show on the desktop.
        </FieldDescription>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Checkbox id={hardDisksId} />
            <FieldLabel className="font-normal" htmlFor={hardDisksId}>
              Hard disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id={externalDisksId} />
            <FieldLabel className="font-normal" htmlFor={externalDisksId}>
              External disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id={cdsDvdsId} />
            <FieldLabel className="font-normal" htmlFor={cdsDvdsId}>
              CDs, DVDs, and iPods
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id={connectedServersId} />
            <FieldLabel className="font-normal" htmlFor={connectedServersId}>
              Connected servers
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <Field orientation="horizontal">
        <Checkbox defaultChecked id={syncFoldersId} />
        <FieldContent>
          <FieldLabel htmlFor={syncFoldersId}>
            Sync Desktop & Documents folders
          </FieldLabel>
          <FieldDescription>
            Your Desktop & Documents folders are being synced with iCloud Drive.
            You can access them from other devices.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}

const WithRadioContent = () => {
  const baseId = useId()
  const monthlyId = `${baseId}-plan-monthly`
  const yearlyId = `${baseId}-plan-yearly`
  const lifetimeId = `${baseId}-plan-lifetime`

  return (
    <FieldSet>
      <FieldLabel>Subscription Plan</FieldLabel>
      <FieldDescription>
        Yearly and lifetime plans offer significant savings.
      </FieldDescription>
      <RadioGroup defaultValue="monthly">
        <Field orientation="horizontal">
          <RadioGroupItem id={monthlyId} value="monthly" />
          <FieldLabel className="font-normal" htmlFor={monthlyId}>
            Monthly ($9.99/month)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id={yearlyId} value="yearly" />
          <FieldLabel className="font-normal" htmlFor={yearlyId}>
            Yearly ($99.99/year)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id={lifetimeId} value="lifetime" />
          <FieldLabel className="font-normal" htmlFor={lifetimeId}>
            Lifetime ($299.99)
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  )
}

const ChoiceCardContent = () => {
  const baseId = useId()
  const computeEnvironmentId = `${baseId}-compute-environment`
  const kubernetesId = `${baseId}-kubernetes`
  const virtualMachineId = `${baseId}-vm`

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLabel htmlFor={computeEnvironmentId}>
          Compute Environment
        </FieldLabel>
        <FieldDescription>
          Select the compute environment for your cluster.
        </FieldDescription>
        <RadioGroup defaultValue="kubernetes">
          <FieldLabel htmlFor={kubernetesId}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Kubernetes</FieldTitle>
                <FieldDescription>
                  Run GPU workloads on a K8s configured cluster.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem id={kubernetesId} value="kubernetes" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor={virtualMachineId}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Virtual Machine</FieldTitle>
                <FieldDescription>
                  Access a VM configured cluster to run GPU workloads.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem id={virtualMachineId} value="vm" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
    </FieldGroup>
  )
}

export const WithInput: Story = {
  render: (args) => <WithInputContent {...args} />
}

export const WithTextarea: Story = {
  render: (args) => <WithTextareaContent {...args} />
}

export const WithSelect: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Department</FieldLabel>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="support">Customer Support</SelectItem>
          <SelectItem value="hr">Human Resources</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>
        Select your department or area of work.
      </FieldDescription>
    </Field>
  )
}

export const WithFieldset: Story = {
  render: () => <WithFieldsetContent />
}

export const WithCheckbox: Story = {
  render: () => <WithCheckboxContent />
}

export const WithRadio: Story = {
  render: () => <WithRadioContent />
}

export const WithSwitch: Story = {
  render: (args) => <WithSwitchContent {...args} />
}

export const ChoiceCard: Story = {
  render: () => <ChoiceCardContent />
}
