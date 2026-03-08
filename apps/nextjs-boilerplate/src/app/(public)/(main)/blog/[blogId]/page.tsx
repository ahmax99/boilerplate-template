import type { Comment, Post, PostIdParams } from '@shared/config'
import type { Metadata } from 'next'

import { PageTemplate } from '@/components/layout'
import { PUBLIC_ROUTES } from '@/features/auth/constants/routes'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import { BlogDetail } from '@/features/post/server/components/BlogDetail'

interface BlogDetailPageProps {
  params: Promise<{ blogId: PostIdParams['id'] }>
}

export async function generateMetadata({
  params
}: BlogDetailPageProps): Promise<Metadata> {
  const { blogId } = await params
  // const result = await PostService.getById(blogId)

  // if (result.isErr()) return generatePageMetadata({ urlPath: `blog/${blogId}` })

  return generatePageMetadata({
    // title: result.value.title,
    // description: result.value.content,
    title: 'Blog Detail', // TODO: Replace with actual post title
    description: 'Blog Detail', // TODO: Replace with actual post description
    urlPath: `blog/${blogId}`
  })
}

export default async function BlogDetailPage({
  params
}: Readonly<BlogDetailPageProps>) {
  // const { blogId } = await params

  // const [postResult, commentResult] = await Promise.all([
  //   PostService.getById(blogId),
  //   CommentService.getAll(blogId)
  // ])

  // if (postResult.isErr() || commentResult.isErr()) return notFound()

  // TODO: Remove when services are implemented
  const commentResult = { value: [] as Comment[] }
  const postResult = { value: {} as Post }

  return (
    <PageTemplate
      back={{ href: PUBLIC_ROUTES.BLOG, label: 'Back to blog' }}
      maxWidth="wide"
    >
      <BlogDetail comments={commentResult.value} post={postResult.value} />
    </PageTemplate>
  )
}
