import BlogDetailClient from './BlogDetailClient'

export function generateStaticParams() {
  return [{ slug: '_' }]
}

export default function BlogDetailPage() {
  return <BlogDetailClient />
}
