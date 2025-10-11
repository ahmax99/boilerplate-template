import { prisma, User } from '@repo/database'

export default async function Home() {
  const users = await prisma.user.findMany()

  return (
    <div>
      {users.map((user: User) => (
        <p key={user.id}>{user.name ?? user.email}</p>
      ))}
    </div>
  )
}
