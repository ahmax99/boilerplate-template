import { PageTemplate } from '@/components/layout'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'
import {
  type FieldConfig,
  PostForm
} from '@/features/post/client/components/PostForm'

export const metadata = generatePageMetadata({
  title: 'Create Post',
  description: 'Share your thoughts with the big world',
  urlPath: 'blog/create'
})

export default async function CreatePostPage() {
  // const data = await getCurrentSession()
  // const permissions = getUserPermissions(data?.user)

  // if (!permissions.can('create', 'Post')) redirect(PUBLIC_ROUTES.HOME)

  const data = {
    user: null
  } // TODO: Get user from session

  const createPostConfig = {
    title: 'Create Post',
    description: 'Share your thoughts with the big world',
    submitLabel: 'Create Post',
    defaultValues: {
      title: '',
      content: '',
      image: ''
    },
    fields: [
      {
        name: 'title' as FieldConfig['name'],
        label: 'Title',
        description: 'Enter your post title'
      },
      {
        name: 'content' as FieldConfig['name'],
        label: 'Content',
        description: 'Enter your post content'
      },
      {
        name: 'image' as FieldConfig['name'],
        label: 'Image',
        description: 'Enter your post image'
      }
    ]
  }

  return (
    <PageTemplate alignment="center">
      <PostForm config={createPostConfig} user={data?.user ?? null} />
    </PageTemplate>
  )
}
