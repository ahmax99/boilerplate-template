import { prisma } from '@repo/database'

export default async function Home() {
  const users = await prisma.user.findMany()

  return <h1>{users.map((user) => user.name)}</h1>
}
