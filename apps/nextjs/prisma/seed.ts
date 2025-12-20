import { nanoid } from 'nanoid'

import prisma from '@/lib/prisma'

declare const process: {
  env: Record<string, string>
  exit(code?: number): never
}

async function main() {
  console.log('🌱 Starting database seed...')

  console.log('🗑�E�E Clearing existing data...')
  await prisma.todo.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Creating users...')

  const alice = await prisma.user.create({
    data: {
      id: nanoid(),
      email: 'alice@example.com',
      name: 'Alice Johnson',
      todos: {
        create: [
          {
            id: nanoid(),
            title: 'Complete project documentation',
            description: 'Write comprehensive docs for the new feature',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Review pull requests',
            description: 'Review and merge pending PRs',
            isDone: true
          },
          {
            id: nanoid(),
            title: 'Update dependencies',
            description: 'Upgrade packages to latest versions',
            isDone: false
          }
        ]
      }
    },
    include: {
      todos: true
    }
  })

  const bob = await prisma.user.create({
    data: {
      id: nanoid(),
      email: 'bob@example.com',
      name: 'Bob Smith',
      todos: {
        create: [
          {
            id: nanoid(),
            title: 'Fix authentication bug',
            description: 'Users unable to login with OAuth',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Optimize database queries',
            description: 'Improve performance of slow endpoints',
            isDone: false
          }
        ]
      }
    },
    include: {
      todos: true
    }
  })

  const charlie = await prisma.user.create({
    data: {
      id: nanoid(),
      email: 'charlie@example.com',
      name: 'Charlie Davis',
      todos: {
        create: [
          {
            id: nanoid(),
            title: 'Design new landing page',
            description: 'Create mockups for homepage redesign',
            isDone: true
          },
          {
            id: nanoid(),
            title: 'Conduct user interviews',
            description: 'Interview 10 users about new features',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Write blog post',
            description: 'Article about best practices',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Setup CI/CD pipeline',
            description: 'Configure automated testing and deployment',
            isDone: true
          },
          {
            id: nanoid(),
            title: 'Refactor authentication service',
            description: 'Improve security and performance',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Update documentation',
            description: 'Add new API endpoints to docs',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Optimize database queries',
            description: 'Add indexes for frequently queried fields',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Implement dark mode',
            description: 'Add theme toggle to UI components',
            isDone: true
          },
          {
            id: nanoid(),
            title: 'Create admin dashboard',
            description: 'Build interface for managing users',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Setup error monitoring',
            description: 'Integrate Sentry for error tracking',
            isDone: true
          },
          {
            id: nanoid(),
            title: 'Write unit tests',
            description: 'Cover critical business logic',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Review pull requests',
            description: "Check team members' code submissions",
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Plan sprint retrospective',
            description: 'Prepare agenda and materials',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Update dependencies',
            description: 'Check for security patches',
            isDone: true
          },
          {
            id: nanoid(),
            title: 'Create demo environment',
            description: 'Setup staging for client previews',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Implement search functionality',
            description: 'Add full-text search to application',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Optimize image assets',
            description: 'Compress and convert to WebP',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Setup backup strategy',
            description: 'Configure automated database backups',
            isDone: true
          },
          {
            id: nanoid(),
            title: 'Create onboarding guide',
            description: 'Document setup process for new hires',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Implement analytics',
            description: 'Add user behavior tracking',
            isDone: false
          },
          {
            id: nanoid(),
            title: 'Redesign logo',
            description: 'Create modern brand identity',
            isDone: false
          }
        ]
      }
    },
    include: {
      todos: true
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log(`Created ${3} users:`)
  console.log(
    `  - ${alice.name} (${alice.email}) with ${alice.todos.length} todos`
  )
  console.log(`  - ${bob.name} (${bob.email}) with ${bob.todos.length} todos`)
  console.log(
    `  - ${charlie.name} (${charlie.email}) with ${charlie.todos.length} todos`
  )
  console.log(
    `Total todos created: ${alice.todos.length + bob.todos.length + charlie.todos.length}`
  )
}

;(async () => {
  try {
    await main()
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
