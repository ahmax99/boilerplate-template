import { connection } from 'next/server'

import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { fetchAllPosts, fetchPostImage } from '@/features/post/server/api'
import { PostsList } from '@/features/post/server/components/PostsList'

export const metadata = generatePageMetadata({
  title: 'Posts',
  description: 'Insights, thoughts, and trends from our team',
  urlPath: 'posts'
})

export default async function PostsListPage() {
  await connection()
  const posts = await fetchAllPosts()
  const imageUrls = await Promise.all(
    posts.map((post) => fetchPostImage(post.imagePath ?? ''))
  )

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

      <PostsList imageUrls={imageUrls} posts={posts} />
    </div>
  )
}
