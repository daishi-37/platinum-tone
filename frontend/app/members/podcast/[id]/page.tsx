import PodcastPageClient from './PodcastPageClient'

export function generateStaticParams() {
  return [{ id: '_' }]
}

export default function PodcastEpisodePage() {
  return <PodcastPageClient />
}
