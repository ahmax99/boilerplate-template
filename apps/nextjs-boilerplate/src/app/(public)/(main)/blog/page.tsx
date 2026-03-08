import { connection } from 'next/server'
import type { Post } from '@shared/config'

import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { BlogList } from '@/features/post/server/components/BlogList'

export const metadata = generatePageMetadata({
  title: 'Blog',
  description: 'Insights, thoughts, and trends from our team',
  urlPath: 'blog'
})

export default async function BlogListPage() {
  await connection()
  // const result = await PostService.getAll()

  // const posts = result.isOk() ? result.value : []
  const posts: Post[] = []

  return (
    <div className="container py-12">
      <div className="pb-12 text-center">
        <h1 className="font-extrabold text-4xl tracking-tight sm:text-5xl">
          Our Blog
        </h1>
        <p className="mx-auto max-w-2xl pt-4 text-muted-foreground text-xl">
          Insights, thoughts, and trends from our team.
        </p>
      </div>

      <BlogList posts={posts} />
    </div>
  )
}
