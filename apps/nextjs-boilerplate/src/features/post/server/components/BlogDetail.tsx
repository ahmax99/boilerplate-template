import Image from 'next/image'
import type { Comment, Post } from '@shared/config'

import { Separator } from '@/components/atoms'
import { CommentSection } from '@/features/comment/server/components/CommentSection'

interface BlogDetailProps {
  post: Post
  comments: Comment[]
}

export const BlogDetail = async ({ post, comments }: BlogDetailProps) => (
  <>
    <div className="relative mb-8 h-[400px] w-full overflow-hidden rounded-xl shadow-sm">
      <Image
        alt={post?.title ?? ''}
        className="object-cover"
        fill
        src={
          post?.imageUrl ??
          'https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }
      />
    </div>

    <div className="flex flex-col space-y-4">
      <h1 className="font-bold text-4xl text-foreground tracking-tight">
        {post?.title}
      </h1>

      <div className="flex items-center gap-2">
        <p className="text-muted-foreground text-sm">
          Posted on:{' '}
          {new Date(post?.createdAt ?? '').toLocaleDateString('en-US')}
        </p>
      </div>
    </div>

    <Separator className="my-8" />

    <p className="whitespace-pre-wrap text-foreground/90 text-lg leading-relaxed">
      {post?.content}
    </p>

    <Separator className="my-8" />

    <CommentSection comments={comments} postId={post.id} />
  </>
)
