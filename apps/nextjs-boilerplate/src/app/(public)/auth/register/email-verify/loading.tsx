import { Skeleton } from '@/components/atoms'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/molecules/Card'

export default function Loading() {
  return (
    <Card className="w-full sm:max-w-96">
      <CardHeader className="text-center">
        <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full rounded-lg" />
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}
