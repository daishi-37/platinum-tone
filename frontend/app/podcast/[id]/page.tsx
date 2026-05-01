import PodcastEpisodeClient from './PodcastEpisodeClient'

export function generateStaticParams() {
  return [{ id: '_' }]
}

export default function PodcastEpisodePage() {
  return <PodcastEpisodeClient />
}
