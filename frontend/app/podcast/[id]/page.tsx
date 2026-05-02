import PodcastDetailClient from './PodcastDetailClient'

export function generateStaticParams() {
  return [{ id: '_' }]
}

export default function PodcastDetailPage() {
  return <PodcastDetailClient />
}
