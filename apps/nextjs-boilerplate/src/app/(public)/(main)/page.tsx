import { FeatureSection, HeroSection } from '@/components/common'
import { PageTemplate } from '@/components/layout'
import { generatePageMetadata } from '@/features/metadata/utils/generatePageMetadata'

export const metadata = generatePageMetadata({
  title: 'Home',
  description: 'Welcome to our blog'
})

export default function HomePage() {
  return (
    <PageTemplate maxWidth="wide">
      <HeroSection />
      <FeatureSection />
    </PageTemplate>
  )
}
