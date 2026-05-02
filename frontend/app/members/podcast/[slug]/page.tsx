import BacktalkClient from './BacktalkClient'

export function generateStaticParams() {
  return [{ slug: '_' }]
}

export default function MembersPodcastDetailPage() {
  return <BacktalkClient />
}
