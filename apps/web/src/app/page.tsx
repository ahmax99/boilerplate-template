import { prisma, User } from '@repo/database'

export default async function Home() {
  const users = await prisma.user.findMany()

  return <h1>{users.map((user: User) => user.name)}</h1>
}
