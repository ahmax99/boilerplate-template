import { BookOpen, PenTool } from 'lucide-react'

import { PUBLIC_ROUTES } from '@/lib/routes'

import { ButtonLink } from '../atoms'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../molecules'

function FeatureSection() {
  return (
    <section className="px-4 py-6">
      <div className="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="flex flex-col border-none shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <CardTitle>Blog</CardTitle>
            <CardDescription>Read our latest articles</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground text-sm">
              Browse through a collection of interesting posts and tutorials.
            </p>
          </CardContent>
          <CardFooter>
            <ButtonLink
              className="w-full"
              href={PUBLIC_ROUTES.POSTS}
              variant="outline"
            >
              Visit Blog
            </ButtonLink>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-none shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PenTool className="h-6 w-6" />
            </div>
            <CardTitle>Create Post</CardTitle>
            <CardDescription>Share your thoughts</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground text-sm">
              Have something to say? Create a new blog post and share it with
              the community.
            </p>
          </CardContent>
          <CardFooter>
            <ButtonLink
              className="w-full"
              href={PUBLIC_ROUTES.POSTS_CREATE}
              variant="outline"
            >
              Create Post
            </ButtonLink>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}

export { FeatureSection }
