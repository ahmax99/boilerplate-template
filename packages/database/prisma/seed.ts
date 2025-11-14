import { prisma } from '../src/client'

declare const process: {
  env: Record<string, string>
  exit(code?: number): never
}

async function main() {
  console.log('🌱 Starting database seed...')

  console.log('🗑️  Clearing existing data...')
  await prisma.todo.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Creating users...')

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      todos: {
        create: [
          {
            title: 'Complete project documentation',
            description: 'Write comprehensive docs for the new feature',
            isDone: false
          },
          {
            title: 'Review pull requests',
            description: 'Review and merge pending PRs',
            isDone: true
          },
          {
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
      email: 'bob@example.com',
      name: 'Bob Smith',
      todos: {
        create: [
          {
            title: 'Fix authentication bug',
            description: 'Users unable to login with OAuth',
            isDone: false
          },
          {
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
      email: 'charlie@example.com',
      name: 'Charlie Davis',
      todos: {
        create: [
          {
            title: 'Design new landing page',
            description: 'Create mockups for homepage redesign',
            isDone: true
          },
          {
            title: 'Conduct user interviews',
            description: 'Interview 10 users about new features',
            isDone: false
          },
          {
            title: 'Write blog post',
            description: 'Article about best practices',
            isDone: false
          },
          {
            title: 'Setup CI/CD pipeline',
            description: 'Configure automated testing and deployment',
            isDone: true
          },
          {
            title: 'Refactor authentication service',
            description: 'Improve security and performance',
            isDone: false
          },
          {
            title: 'Update documentation',
            description: 'Add new API endpoints to docs',
            isDone: false
          },
          {
            title: 'Optimize database queries',
            description: 'Add indexes for frequently queried fields',
            isDone: false
          },
          {
            title: 'Implement dark mode',
            description: 'Add theme toggle to UI components',
            isDone: true
          },
          {
            title: 'Create admin dashboard',
            description: 'Build interface for managing users',
            isDone: false
          },
          {
            title: 'Setup error monitoring',
            description: 'Integrate Sentry for error tracking',
            isDone: true
          },
          {
            title: 'Write unit tests',
            description: 'Cover critical business logic',
            isDone: false
          },
          {
            title: 'Review pull requests',
            description: "Check team members' code submissions",
            isDone: false
          },
          {
            title: 'Plan sprint retrospective',
            description: 'Prepare agenda and materials',
            isDone: false
          },
          {
            title: 'Update dependencies',
            description: 'Check for security patches',
            isDone: true
          },
          {
            title: 'Create demo environment',
            description: 'Setup staging for client previews',
            isDone: false
          },
          {
            title: 'Implement search functionality',
            description: 'Add full-text search to application',
            isDone: false
          },
          {
            title: 'Optimize image assets',
            description: 'Compress and convert to WebP',
            isDone: false
          },
          {
            title: 'Setup backup strategy',
            description: 'Configure automated database backups',
            isDone: true
          },
          {
            title: 'Create onboarding guide',
            description: 'Document setup process for new hires',
            isDone: false
          },
          {
            title: 'Implement analytics',
            description: 'Add user behavior tracking',
            isDone: false
          },
          {
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
