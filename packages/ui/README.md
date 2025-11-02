# @repo/ui

Reusable UI component library built with React, TypeScript, TailwindCSS, and Radix UI primitives.

## Features

- 🎨 **Atomic Design** - Organized as atoms, molecules, and organisms
- 📝 **Form System** - Type-safe forms with TanStack Form
- 📊 **DataTable System** - Powerful tables with TanStack Table
- 🎯 **Type-Safe** - Full TypeScript support
- ♿ **Accessible** - Built on Radix UI primitives
- 🎭 **Themeable** - Dark mode support with next-themes

## Installation

This is a workspace package. Import components directly:

```tsx
import { Button, Input } from '@repo/ui/components/atoms'
import { Card, Dialog } from '@repo/ui/components/molecules'
import { DataTable } from '@repo/ui/components/organisms/DataTable'
import { useAppForm, useAppTable } from '@repo/ui/hooks'
```

## Form Components

Type-safe forms with validation, built on TanStack Form.

### Quick Start

```tsx
'use client'

import { useAppForm } from '@repo/ui/hooks'
import { Button } from '@repo/ui/components/atoms'
import { z } from 'zod'

// 1. Define schema
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address')
})

// 2. Create form component
export function UserForm() {
  const form = useAppForm({
    defaultValues: {
      name: '',
      email: ''
    },
    validators: {
      onSubmit: userSchema
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value)
      // Handle submission
    }
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field name="name">
        {(field) => (
          <field.Input
            label="Name"
            description="Your full name"
          />
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <field.Input
            label="Email"
            description="Your email address"
          />
        )}
      </form.Field>

      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Available Form Fields

- `field.Input` - Text input
- `field.Textarea` - Multi-line text
- `field.Select` - Dropdown select
- `field.Checkbox` - Checkbox with label

### Form Features

- ✅ Type-safe with Zod validation
- ✅ Automatic error handling
- ✅ Touch state tracking
- ✅ Field-level validation
- ✅ Accessible labels and errors

## DataTable Components

Powerful, composable data tables with sorting, filtering, and pagination.

### Quick Start

```tsx
'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable, DataTableColumnHeader } from '@repo/ui/components/organisms/DataTable'

// 1. Define your data type
type User = {
  id: number
  name: string
  email: string
}

// 2. Define columns
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    )
  },
  {
    accessorKey: 'email',
    header: 'Email'
  }
]

// 3. Use DataTable
export function UserTable({ data }: { data: User[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      enablePagination
      enableSearch
      enableViewOptions
      initialState={{
        sorting: [{ id: 'name', desc: false }]
      }}
      tableHeight="h-[300px]"
    />
  )
}
```

### Available DataTable Components

- `<DataTable />` - Main table component (with built-in search, pagination, and column visibility when enabled via props)
- `<DataTableColumnHeader />` - Sortable column header

### DataTable Features

- ✅ Sorting (multi-column)
- ✅ Filtering (per-column)
- ✅ Pagination with page size control
- ✅ Column visibility toggle
- ✅ Row selection support
- ✅ Fully typed with generics
- ✅ Composable architecture

### Advanced Examples

#### Row Selection

```tsx
import { Checkbox } from '@repo/ui/components/atoms'

const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  // ... other columns
]
```

#### Custom Cell Formatting

```tsx
{
  accessorKey: 'amount',
  header: 'Amount',
  cell: ({ row }) => {
    const amount = parseFloat(row.getValue('amount'))
    return <div className="font-medium">${amount.toFixed(2)}</div>
  }
}
```

#### Row Actions

```tsx
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@repo/ui/components/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@repo/ui/components/molecules'

{
  id: 'actions',
  cell: ({ row }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEdit(row.original)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(row.original)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Component Categories

### Atoms (Basic Building Blocks)

- `Button` - Button with variants
- `Input` - Text input
- `Checkbox` - Checkbox
- `Label` - Form label
- `Badge` - Status badge
- `Spinner` - Loading spinner
- And more...

### Molecules (Composite Components)

- `Card` - Content container
- `Dialog` - Modal dialog
- `Select` - Dropdown select
- `DropdownMenu` - Context menu
- `Table` - Basic table primitives
- And more...

### Organisms (Complex Components)

- `Form` - Form field components
- `DataTable` - Data table system
- `ActionButton` - Button with confirmation
- And more...

## Hooks

- `useAppForm` - Form management with validation
- `useAppTable` - Table management with defaults
- `useMobile` - Mobile breakpoint detection

## TypeScript

All components are fully typed. Import types as needed:

```tsx
import type { ButtonProps } from '@repo/ui/components/atoms'
import type { ColumnDef } from '@tanstack/react-table'
```

## Development

```bash
# Build components
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm check-types
```

## Dependencies

- **React 19** - UI framework
- **TanStack Form** - Form state management
- **TanStack Table** - Table state management
- **Radix UI** - Accessible primitives
- **TailwindCSS** - Styling
- **Zod** - Schema validation
- **Lucide React** - Icons

## Resources

- [TanStack Form Docs](https://tanstack.com/form/latest)
- [TanStack Table Docs](https://tanstack.com/table/latest)
- [Radix UI Docs](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
