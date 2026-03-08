import Image from 'next/image'
import type { Post } from '@shared/config'

import { ButtonLink } from '@/components/atoms'
import { Card, CardContent, CardFooter } from '@/components/molecules'

interface PostsListProps {
  posts: Post[]
}

export const PostsList = async ({ posts }: PostsListProps) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {posts?.map((post) => (
      <Card className="pt-0" key={post.id}>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            alt="image"
            className="rounded-t-lg object-cover"
            fill
            src={
              post.imageUrl ??
              'https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }
          />
        </div>

        <CardContent>
          <h1 className="font-bold text-2xl hover:text-primary">
            {post.title}
          </h1>
          <p className="line-clamp-3 text-muted-foreground">{post.content}</p>
        </CardContent>
        <CardFooter>
          <ButtonLink className="w-full" href={`/posts/${post.id}`}>
            Read more
          </ButtonLink>
        </CardFooter>
      </Card>
    ))}
  </div>
)
