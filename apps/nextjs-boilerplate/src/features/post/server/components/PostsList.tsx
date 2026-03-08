import Image from 'next/image'
import type { Post } from '@shared/config'

import { ButtonLink } from '@/components/atoms'
import { Card, CardContent, CardFooter } from '@/components/molecules'

interface PostsListProps {
  posts: Post[]
  imageUrls: string[]
}

export const PostsList = async ({ posts, imageUrls }: PostsListProps) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {posts?.map((post, index) => (
      <Card className="pt-0" key={post.id}>
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            alt="image"
            className="rounded-t-lg object-cover"
            fill
            loading="eager"
            src={imageUrls[index] ?? ''}
            unoptimized
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
